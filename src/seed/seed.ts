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

async function run() {
  await client.connect();
  console.log('Connected to DB');

  // Helper: get actual column name present in DB for a logical set of candidates
  async function findExistingColumn(table: string, candidates: string[]): Promise<string | null> {
    const colsRes = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
      [table.toLowerCase()],
    );
    const existing = (colsRes.rows || []).map((r: any) => r.column_name);
    // try exact match first
    for (const c of candidates) {
      if (existing.includes(c)) return c;
    }
    // try case-insensitive match
    for (const c of candidates) {
      const found = existing.find((e: string) => e.toLowerCase() === c.toLowerCase());
      if (found) return found;
    }
    return null;
  }

  // Helper: return identifier for SQL; only quote if identifier contains uppercase letters or dashes etc.
  function ident(name: string) {
    if (!name) throw new Error('Empty identifier');
    // If the name is all lowercase and contains only a-z0-9_ we can use it unquoted
    if (/^[a-z0-9_]+$/.test(name)) return name;
    // otherwise quote it (preserve case)
    return `"${name}"`;
  }

  // Insert roles
  const roles = ['ADMIN', 'CLIENTE', 'DUENIO', 'CONTROLADOR'];
  const id_rolCol = (await findExistingColumn('roles', ['id_rol', 'id_rol', 'id_rol'])) ?? 'id_rol';
  for (const r of roles) {
    const found = await client.query(`SELECT ${ident(id_rolCol)} FROM roles WHERE rol = $1`, [r]);
    if (found.rowCount === 0) {
      await client.query('INSERT INTO roles(rol) VALUES($1)', [r]);
      console.log(`Inserted role ${r}`);
    } else {
      console.log(`Role ${r} already exists`);
    }
  }

  // Create admin user if not exists
  const adminEmail = 'admin@local.test';
  const id_usuarioCol = (await findExistingColumn('usuarios', ['id_usuario', 'id_usuario', 'id_usuario'])) ?? 'id_usuario';
  const correoCol = (await findExistingColumn('usuarios', ['correo'])) ?? 'correo';
  const res = await client.query(`SELECT ${ident(id_usuarioCol)} FROM usuarios WHERE ${ident(correoCol)} = $1`, [adminEmail]);
  if (res.rowCount === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    // Insert a minimal persona row if personas table exists and persona FK required.
    // Check if 'personas' table exists and has at least one row
    let id_persona: number | null = null;
    try {
      // Try to insert a persona and get id
      // determine persona id column and persona columns
      const id_personaCol = (await findExistingColumn('personas', ['id_persona', 'id_persona', 'id_persona'])) ?? 'id_persona';
      const nombresCol = (await findExistingColumn('personas', ['nombres'])) ?? 'nombres';
      const paternoCol = (await findExistingColumn('personas', ['paterno'])) ?? 'paterno';
      const maternoCol = (await findExistingColumn('personas', ['materno'])) ?? 'materno';
      const telefonoCol = (await findExistingColumn('personas', ['telefono'])) ?? 'telefono';
      const fechaCol = (await findExistingColumn('personas', ['fecha_nacimiento', 'fecha_nacimiento'])) ?? 'fecha_nacimiento';
      const generoCol = (await findExistingColumn('personas', ['genero'])) ?? 'genero';

      const insertPersona = await client.query(
        `INSERT INTO personas(${ident(nombresCol)}, ${ident(paternoCol)}, ${ident(maternoCol)}, ${ident(telefonoCol)}, ${ident(fechaCol)}, ${ident(generoCol)})
         VALUES($1,$2,$3,$4,$5,$6) RETURNING ${ident(id_personaCol)}`,
        ['Admin', 'User', 'Admin', '0000000000', new Date().toISOString().slice(0, 10), 'MASCULINO'],
      );
  const personaRow = insertPersona.rows[0] || {};
  id_persona = personaRow[id_personaCol] ?? personaRow[id_personaCol?.toLowerCase()] ?? personaRow[id_personaCol?.toUpperCase()] ?? personaRow.idpersona ?? personaRow.id_persona ?? personaRow.idPersona ?? null;
  console.log('Created persona with id', id_persona);
    } catch (e) {
      console.log('Failed to insert persona; usuarios.id_persona is required by DB and seeder cannot continue. Error:', (e as Error).message);
      await client.end();
      process.exit(1);
    }

    // Insert usuario. Note: columns based on src/usuarios/usuario.entity.ts
   // Determine actual column names for usuarios table
   const id_personaUsuarioCol = (await findExistingColumn('usuarios', ['id_persona', 'id_persona', 'id_persona'])) ?? 'id_persona';
   const correoUsuarioCol = (await findExistingColumn('usuarios', ['correo'])) ?? 'correo';
   const usuarioCol = (await findExistingColumn('usuarios', ['usuario'])) ?? 'usuario';
   const correoVerifCol = (await findExistingColumn('usuarios', ['correo_verificado', 'correo_verificado'])) ?? 'correo_verificado';
   const hashCol = (await findExistingColumn('usuarios', ['hash_contrasena', 'hash_contrasena'])) ?? 'hash_contrasena';
   const estadoCol = (await findExistingColumn('usuarios', ['estado'])) ?? 'estado';

   const insertUsuarioQuery = id_persona
    ? `INSERT INTO usuarios(${ident(id_personaUsuarioCol)}, ${ident(usuarioCol)}, ${ident(correoUsuarioCol)}, ${ident(correoVerifCol)}, ${ident(hashCol)}, ${ident(estadoCol)})
      VALUES($1,$2,$3,$4,$5,$6) RETURNING ${ident(id_usuarioCol)}`
    : `INSERT INTO usuarios(${ident(usuarioCol)}, ${ident(correoUsuarioCol)}, ${ident(correoVerifCol)}, ${ident(hashCol)}, ${ident(estadoCol)})
      VALUES($1,$2,$3,$4,$5) RETURNING ${ident(id_usuarioCol)}`;

   const insertUsuarioValues = id_persona ? [id_persona, 'admin', adminEmail, true, hash, 'ACTIVO'] : ['admin', adminEmail, true, hash, 'ACTIVO'];

   await client.query(insertUsuarioQuery, insertUsuarioValues as any);
    console.log('Created admin user');

    // Assign ADMIN role via usuario_rol table if exists
    try {
      // find ids
      const usuarioRes2 = await client.query(`SELECT ${ident(id_usuarioCol)} FROM usuarios WHERE ${ident(correoUsuarioCol)} = $1`, [adminEmail]);
  const usuarioRow = usuarioRes2.rows[0] || {};
  const id_usuario = usuarioRow[id_usuarioCol] ?? usuarioRow[id_usuarioCol?.toLowerCase()] ?? usuarioRow[id_usuarioCol?.toUpperCase()] ?? usuarioRow.idusuario ?? usuarioRow.id_usuario ?? usuarioRow.idUsuario ?? null;
  const rolRes = await client.query(`SELECT ${ident(id_rolCol)} FROM roles WHERE rol = $1`, ['ADMIN']);
  const rolRow = rolRes.rows[0] || {};
  const id_rol = rolRow[id_rolCol] ?? rolRow[id_rolCol?.toLowerCase()] ?? rolRow[id_rolCol?.toUpperCase()] ?? rolRow.idrol ?? rolRow.id_rol ?? rolRow.idRol ?? null;

      // find usuario_rol columns
      const urUserCol = (await findExistingColumn('usuario_rol', ['id_usuario', 'id_usuario', 'id_usuario'])) ?? 'id_usuario';
      const urRolCol = (await findExistingColumn('usuario_rol', ['id_rol', 'id_rol', 'id_rol'])) ?? 'id_rol';

      const urFound = await client.query(`SELECT * FROM usuario_rol WHERE ${ident(urUserCol)} = $1 AND ${ident(urRolCol)} = $2`, [id_usuario, id_rol]);
      if (urFound.rowCount === 0) {
        await client.query(`INSERT INTO usuario_rol(${ident(urUserCol)}, ${ident(urRolCol)}) VALUES($1,$2)`, [id_usuario, id_rol]);
        console.log('Assigned ADMIN role to admin user');
      } else {
        console.log('Admin user already has ADMIN role');
      }
    } catch (e) {
      console.log('Could not assign role automatically:', (e as Error).message);
    }
  } else {
    console.log('Admin user already exists, skipping creation');
  }

  await client.end();
  console.log('Seeding finished');
}

run().catch((err) => {
  console.error('Seeding error', err);
  process.exit(1);
});
