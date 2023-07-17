const { Admin } = require('../models'); // Importa el modelo Admin de tu aplicación
const bcrypt = require('bcrypt');
async function createAdminUser() {
  const existingUser = await Admin.findOne({ where: { email: 'admin@pagoservicio.com' } });

  if (existingUser) {
    console.log('El usuario administrador ya existe.');
    return;
  }
  const password = '12345678'; // Cambia la contraseña por una segura
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const newAdmin = await Admin.create({
      nombre: 'Admin',
      apellidos: 'Admin',
      email: 'admin@pagoservicio.com',
      password: hashedPassword, // Cambia la contraseña por una segura
      estado: 1,
    });

    console.log('Usuario administrador creado:');
    console.log(newAdmin.toJSON());
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  }
}

createAdminUser();