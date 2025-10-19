import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'espacios_deportivos',
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@local.test';
const ADMIN_USER  = process.env.ADMIN_USER  || 'admin';
const ADMIN_PASS  = process.env.ADMIN_PASS  || 'admin123';

function ident(name: string) {
  if (!name) throw new Error('Empty identifier');
  if (/^[a-z0-9_]+$/.test(name)) return name;
  return `"${name}"`;
}

async function tableExists(table: string): Promise<boolean> {
  const r = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
    [table.toLowerCase()]
  );
  return r.rowCount === 1;
}

async function findExistingColumn(table: string, candidates: string[]): Promise<string | null> {
  const colsRes = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
    [table.toLowerCase()],
  );
  const existing = (colsRes.rows || []).map((r: any) => r.column_name);
  for (const c of candidates) if (existing.includes(c)) return c; // exact
  for (const c of candidates) {
    const found = existing.find((e: string) => e.toLowerCase() === c.toLowerCase());
    if (found) return found;
  }
  return null;
}

async function columnNullable(table: string, column: string): Promise<boolean> {
  const r = await client.query(
    `SELECT is_nullable FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table.toLowerCase(), column.toLowerCase()]
  );
  if (r.rowCount === 0) return true; // si no se pudo determinar, asumimos nullable
  return r.rows[0].is_nullable === 'YES';
}

async function chooseUserRoleTable(): Promise<{ table: string, colUser: string, colRol: string }> {
  // Prefiere 'usuarios_rol' (definida en la entidad), si no existe intenta otros nombres comunes
  const candidates = ['usuarios_rol', 'usuarios_roles', 'usuario_rol'];
  for (const t of candidates) {
    if (await tableExists(t)) {
      const colUser = (await findExistingColumn(t, ['id_usuario'])) ?? 'id_usuario';
      const colRol  = (await findExistingColumn(t, ['id_rol'])) ?? 'id_rol';
      return { table: t, colUser, colRol };
    }
  }
  throw new Error('No existe tabla de vinculación usuario-rol (usuarios_roles / usuario_rol)');
}

async function ensureRoles() {
  if (!(await tableExists('roles'))) {
    throw new Error('La tabla roles no existe');
  }
  const id_rolCol = (await findExistingColumn('roles', ['id_rol'])) ?? 'id_rol';
  const rolCol = (await findExistingColumn('roles', ['rol'])) ?? 'rol';
  const values = ['ADMIN', 'CLIENTE', 'DUENIO', 'CONTROLADOR'];

  for (const r of values) {
    const found = await client.query(`SELECT ${ident(id_rolCol)} FROM roles WHERE ${ident(rolCol)} = $1`, [r]);
    if (found.rowCount === 0) {
      await client.query(`INSERT INTO roles(${ident(rolCol)}) VALUES($1)`, [r]);
      console.log(`Inserted role ${r}`);
    } else {
      console.log(`Role ${r} already exists`);
    }
  }
}

async function getRoleId(roleName: string): Promise<number> {
  const id_rolCol = (await findExistingColumn('roles', ['id_rol'])) ?? 'id_rol';
  const rolCol = (await findExistingColumn('roles', ['rol'])) ?? 'rol';
  const rs = await client.query(
    `SELECT ${ident(id_rolCol)} as id FROM roles WHERE ${ident(rolCol)} = $1`,
    [roleName]
  );
  if (rs.rowCount === 0) throw new Error(`No se encontró rol ${roleName}`);
  return Number(rs.rows[0].id);
}

async function getUserByEmail(email: string): Promise<{ id_usuario: number, id_persona: number | null } | null> {
  const id_usuarioCol = (await findExistingColumn('usuarios', ['id_usuario'])) ?? 'id_usuario';
  const correoCol = (await findExistingColumn('usuarios', ['correo'])) ?? 'correo';
  const id_personaCol = (await findExistingColumn('usuarios', ['id_persona'])) ?? 'id_persona';
  const rs = await client.query(
    `SELECT ${ident(id_usuarioCol)} AS id_usuario, ${ident(id_personaCol)} AS id_persona FROM usuarios WHERE ${ident(correoCol)} = $1`,
    [email]
  );
  if (rs.rowCount === 0) return null;
  return { id_usuario: Number(rs.rows[0].id_usuario), id_persona: rs.rows[0].id_persona === null ? null : Number(rs.rows[0].id_persona) };
}

async function createUserAdmin(maybePersonaId: number | null): Promise<number> {
  const id_usuarioCol = (await findExistingColumn('usuarios', ['id_usuario'])) ?? 'id_usuario';
  const id_personaCol = (await findExistingColumn('usuarios', ['id_persona'])) ?? 'id_persona';
  const usuarioCol = (await findExistingColumn('usuarios', ['usuario'])) ?? 'usuario';
  const correoCol = (await findExistingColumn('usuarios', ['correo'])) ?? 'correo';
  const correoVerifCol = (await findExistingColumn('usuarios', ['correo_verificado'])) ?? 'correo_verificado';
  const hashCol = (await findExistingColumn('usuarios', ['hash_contrasena'])) ?? 'hash_contrasena';
  const estadoCol = (await findExistingColumn('usuarios', ['estado'])) ?? 'estado';

  const hash = await bcrypt.hash(ADMIN_PASS, 10);

  const idPersonaNullable = await columnNullable('usuarios', id_personaCol);

  // Si id_persona es NOT NULL pero no pasamos persona => creamos persona antes
  let personaId = maybePersonaId;
  if (!idPersonaNullable && !personaId) {
    personaId = await createPersonaMinimal(); // crea primero para cumplir NOT NULL
  }

  const columns: string[] = [];
  const values: any[] = [];
  const params: string[] = [];

  function add(col: string, val: any) {
    columns.push(ident(col));
    values.push(val);
    params.push(`$${params.length + 1}`);
  }

  if (personaId) add(id_personaCol, personaId);
  add(usuarioCol, ADMIN_USER);
  add(correoCol, ADMIN_EMAIL);
  add(correoVerifCol, true);
  add(hashCol, hash);
  add(estadoCol, 'ACTIVO');

  const sql = `INSERT INTO usuarios(${columns.join(', ')}) VALUES(${params.join(', ')}) RETURNING ${ident(id_usuarioCol)} AS id`;

  const rs = await client.query(sql, values);
  const id_usuario = Number(rs.rows[0].id);
  console.log('Created admin user with id', id_usuario);

  // Si pediste crear persona DESPUÉS (1:1), y la columna permite null, aún no hay persona; luego la creamos y se actualiza.
  return id_usuario;
}

async function ensureUserHasRole(id_usuario: number, roleName: 'ADMIN' | 'CLIENTE' | 'DUENIO' | 'CONTROLADOR') {
  const { table, colUser, colRol } = await chooseUserRoleTable();
  const idRol = await getRoleId(roleName);

  const found = await client.query(
    `SELECT 1 FROM ${ident(table)} WHERE ${ident(colUser)} = $1 AND ${ident(colRol)} = $2`,
    [id_usuario, idRol]
  );
  if (found.rowCount === 0) {
    await client.query(
      `INSERT INTO ${ident(table)}(${ident(colUser)}, ${ident(colRol)}) VALUES($1,$2)`,
      [id_usuario, idRol]
    );
    console.log(`Assigned role ${roleName} to user ${id_usuario}`);
  } else {
    console.log(`User ${id_usuario} already has role ${roleName}`);
  }
}

async function createPersonaMinimal(): Promise<number> {
  if (!(await tableExists('personas'))) throw new Error('Tabla personas no existe');

  const id_personaCol   = (await findExistingColumn('personas', ['id_persona'])) ?? 'id_persona';
  const nombresCol      = (await findExistingColumn('personas', ['nombres'])) ?? 'nombres';
  const paternoCol      = (await findExistingColumn('personas', ['paterno'])) ?? 'paterno';
  const maternoCol      = (await findExistingColumn('personas', ['materno'])) ?? 'materno';
  const telefonoCol     = (await findExistingColumn('personas', ['telefono'])) ?? 'telefono';
  const fechaCol        = (await findExistingColumn('personas', ['fecha_nacimiento'])) ?? 'fecha_nacimiento';
  const generoCol       = (await findExistingColumn('personas', ['genero'])) ?? 'genero';

  const rs = await client.query(
    `INSERT INTO personas(${ident(nombresCol)}, ${ident(paternoCol)}, ${ident(maternoCol)}, ${ident(telefonoCol)}, ${ident(fechaCol)}, ${ident(generoCol)})
     VALUES($1,$2,$3,$4,$5,$6) RETURNING ${ident(id_personaCol)} AS id`,
    ['Admin', 'User', 'Admin', '0000000000', new Date().toISOString().slice(0,10), 'MASCULINO']
  );
  const id = Number(rs.rows[0].id);
  console.log('Created persona with id', id);
  return id;
}

async function ensureUserHasPersona(id_usuario: number) {
  const id_personaCol = (await findExistingColumn('usuarios', ['id_persona'])) ?? 'id_persona';
  const id_usuarioCol = (await findExistingColumn('usuarios', ['id_usuario'])) ?? 'id_usuario';

  // 1) ¿ya tiene persona?
  const r = await client.query(
    `SELECT ${ident(id_personaCol)} AS id_persona FROM usuarios WHERE ${ident(id_usuarioCol)} = $1`,
    [id_usuario]
  );
  const current = r.rows[0]?.id_persona ?? null;
  if (current) {
    console.log(`User ${id_usuario} ya vinculado a persona ${current}`);
    return Number(current);
  }

  // 2) crear persona mínima y vincular
  const newPersonaId = await createPersonaMinimal();
  await client.query(
    `UPDATE usuarios SET ${ident(id_personaCol)} = $1 WHERE ${ident(id_usuarioCol)} = $2`,
    [newPersonaId, id_usuario]
  );
  console.log(`Linked user ${id_usuario} -> persona ${newPersonaId}`);
  return newPersonaId;
}

async function run() {
  await client.connect();
  console.log('Connected to DB');

  // Transacción para consistencia
  await client.query('BEGIN');

  try {
    // 1) ROLES
    await ensureRoles();

    // 2) ADMIN (usuario) + rol
    let user = await getUserByEmail(ADMIN_EMAIL);
    let id_usuario: number;

    if (!user) {
      // Intentar crear ADMIN sin persona primero (si el schema lo permite). Si el schema NO lo permite, createUserAdmin creará la persona antes.
      id_usuario = await createUserAdmin(null);
    } else {
      id_usuario = user.id_usuario;
      console.log('Admin user already exists with id', id_usuario);
    }

    // Asignar rol ADMIN
    await ensureUserHasRole(id_usuario, 'ADMIN');

    // 3) PERSONA (1:1) — si no existe, crear y vincular
    user = await getUserByEmail(ADMIN_EMAIL);
    if (user && user.id_persona == null) {
      await ensureUserHasPersona(user.id_usuario);
    } else if (!user) {
      // si no lo encontró por alguna razón (raro), forzamos a crearlo con persona
      const personaId = await createPersonaMinimal();
      id_usuario = await createUserAdmin(personaId);
      await ensureUserHasRole(id_usuario, 'ADMIN');
    }

    await client.query('COMMIT');
    console.log('Seeding finished');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
