const { Admin } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

class AdminRepository {
    async createUser(nombre,apellidos,correo, password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const admin = await Admin.create({
            nombre: nombre,
            apellidos: apellidos,
            email: correo,
            password: hashedPassword,
            estado: 0,
          });
          return admin;
    }

    async findUserByCorreo(correo) {
        return admin.find(user => user.email === correo);
    }
}

module.exports = AdminRepository;