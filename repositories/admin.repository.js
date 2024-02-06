const { Admin, Configuracion } = require('../models');
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

    static async findUserByCorreo(correo) {
        return Admin.findOne({
            where: {
                email: correo
            },
            include: [
                {
                    model: Configuracion,
                    required: true
                }
            ]
        });
    }

    static async getUserAndSettingByUserAndPassVeripago(username, password) {
        console.log(username, password);
        return await Admin.findOne({
            include:[
                {
                    model: Configuracion,
                    required: true,
                    where:{
                        veripagos_username: username,
                        veripagos_password: password,
                    }
                }
            ]
        });
    }
}

module.exports = AdminRepository;