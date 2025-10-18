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
  const idRolCol = (await findExistingColumn('roles', ['idRol', 'idrol', 'id_rol'])) ?? 'idrol';
  for (const r of roles) {
    const found = await client.query(`SELECT ${ident(idRolCol)} FROM roles WHERE rol = $1`, [r]);
    if (found.rowCount === 0) {
      await client.query('INSERT INTO roles(rol) VALUES($1)', [r]);
      console.log(`Inserted role ${r}`);
    } else {
      console.log(`Role ${r} already exists`);
    }
  }

  // Create admin user if not exists
  const adminEmail = 'admin@local.test';
  const idUsuarioCol = (await findExistingColumn('usuarios', ['idUsuario', 'idusuario', 'id_usuario'])) ?? 'idusuario';
  const correoCol = (await findExistingColumn('usuarios', ['correo'])) ?? 'correo';
  const res = await client.query(`SELECT ${ident(idUsuarioCol)} FROM usuarios WHERE ${ident(correoCol)} = $1`, [adminEmail]);
  if (res.rowCount === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    // Insert a minimal persona row if personas table exists and persona FK required.
    // Check if 'personas' table exists and has at least one row
    let idPersona: number | null = null;
    try {
      // Try to insert a persona and get id
      // determine persona id column and persona columns
      const idPersonaCol = (await findExistingColumn('personas', ['idPersona', 'idpersona', 'id_persona'])) ?? 'idpersona';
      const nombresCol = (await findExistingColumn('personas', ['nombres'])) ?? 'nombres';
      const paternoCol = (await findExistingColumn('personas', ['paterno'])) ?? 'paterno';
      const maternoCol = (await findExistingColumn('personas', ['materno'])) ?? 'materno';
      const telefonoCol = (await findExistingColumn('personas', ['telefono'])) ?? 'telefono';
      const fechaCol = (await findExistingColumn('personas', ['fechaNacimiento', 'fecha_nacimiento'])) ?? 'fechaNacimiento';
      const generoCol = (await findExistingColumn('personas', ['genero'])) ?? 'genero';

      const insertPersona = await client.query(
        `INSERT INTO personas(${ident(nombresCol)}, ${ident(paternoCol)}, ${ident(maternoCol)}, ${ident(telefonoCol)}, ${ident(fechaCol)}, ${ident(generoCol)})
         VALUES($1,$2,$3,$4,$5,$6) RETURNING ${ident(idPersonaCol)}`,
        ['Admin', 'User', 'Admin', '0000000000', new Date().toISOString().slice(0, 10), 'MASCULINO'],
      );
      idPersona = insertPersona.rows[0].idpersona ?? insertPersona.rows[0].idPersona ?? insertPersona.rows[0][idPersonaCol] ?? null;
      console.log('Created persona with id', idPersona);
    } catch (e) {
      console.log('Failed to insert persona; usuarios.idPersona is required by DB and seeder cannot continue. Error:', (e as Error).message);
      await client.end();
      process.exit(1);
    }

    // Insert usuario. Note: columns based on src/usuarios/usuario.entity.ts
   // Determine actual column names for usuarios table
   const idPersonaUsuarioCol = (await findExistingColumn('usuarios', ['idPersona', 'idpersona', 'id_persona'])) ?? 'idpersona';
   const correoUsuarioCol = (await findExistingColumn('usuarios', ['correo'])) ?? 'correo';
   const usuarioCol = (await findExistingColumn('usuarios', ['usuario'])) ?? 'usuario';
   const correoVerifCol = (await findExistingColumn('usuarios', ['correoVerificado', 'correo_verificado'])) ?? 'correoverificado';
   const hashCol = (await findExistingColumn('usuarios', ['hashContrasena', 'hash_contrasena'])) ?? 'hashcontrasena';
   const estadoCol = (await findExistingColumn('usuarios', ['estado'])) ?? 'estado';

   const insertUsuarioQuery = idPersona
    ? `INSERT INTO usuarios(${ident(idPersonaUsuarioCol)}, ${ident(usuarioCol)}, ${ident(correoUsuarioCol)}, ${ident(correoVerifCol)}, ${ident(hashCol)}, ${ident(estadoCol)})
      VALUES($1,$2,$3,$4,$5,$6) RETURNING ${ident(idUsuarioCol)}`
    : `INSERT INTO usuarios(${ident(usuarioCol)}, ${ident(correoUsuarioCol)}, ${ident(correoVerifCol)}, ${ident(hashCol)}, ${ident(estadoCol)})
      VALUES($1,$2,$3,$4,$5) RETURNING ${ident(idUsuarioCol)}`;

   const insertUsuarioValues = idPersona ? [idPersona, 'admin', adminEmail, true, hash, 'ACTIVO'] : ['admin', adminEmail, true, hash, 'ACTIVO'];

   await client.query(insertUsuarioQuery, insertUsuarioValues as any);
    console.log('Created admin user');

    // Assign ADMIN role via usuario_rol table if exists
    try {
      // find ids
      const usuarioRes2 = await client.query(`SELECT ${ident(idUsuarioCol)} FROM usuarios WHERE ${ident(correoUsuarioCol)} = $1`, [adminEmail]);
      const idUsuario = usuarioRes2.rows[0][idUsuarioCol] ?? usuarioRes2.rows[0][idUsuarioCol.toLowerCase()];
      const rolRes = await client.query(`SELECT ${ident(idRolCol)} FROM roles WHERE rol = $1`, ['ADMIN']);
      const idRol = rolRes.rows[0][idRolCol] ?? rolRes.rows[0][idRolCol.toLowerCase()];

      // find usuario_rol columns
      const urUserCol = (await findExistingColumn('usuario_rol', ['idUsuario', 'idusuario', 'id_usuario'])) ?? 'idusuario';
      const urRolCol = (await findExistingColumn('usuario_rol', ['idRol', 'idrol', 'id_rol'])) ?? 'idrol';

      const urFound = await client.query(`SELECT * FROM usuario_rol WHERE ${ident(urUserCol)} = $1 AND ${ident(urRolCol)} = $2`, [idUsuario, idRol]);
      if (urFound.rowCount === 0) {
        await client.query(`INSERT INTO usuario_rol(${ident(urUserCol)}, ${ident(urRolCol)}) VALUES($1,$2)`, [idUsuario, idRol]);
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
