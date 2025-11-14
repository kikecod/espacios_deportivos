import { Genero } from 'src/personas/entities/personas.entity';

export const adminRootSeed = {
  // Datos de la Persona
  persona: {
    nombres: 'Administrador',
    paterno: 'Root',
    materno: 'Sistema',
    telefono: '+591-00000000',
    telefonoVerificado: true,
    fechaNacimiento: new Date('1990-01-01'), // Fecha por defecto para el admin
    genero: Genero.OTRO, // Género neutro para cuenta administrativa
  },
  
  // Datos del Usuario
  usuario: {
    usuario: 'admin',
    correo: 'admin@rogu.com',
    correoVerificado: true,
    // Contraseña: Admin123!
    // Se hasheará en el seed service
    contrasena: 'Admin123!',
  },
};
