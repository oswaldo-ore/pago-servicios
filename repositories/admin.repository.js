const { Admin, Configuracion } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const bcrypt = require('bcrypt');
class AdminRepository {
    static async createUser(nombre,apellidos,correo, password,transaction = null) {
        const existingUser = await Admin.findOne({ where: { email: correo } });
        if (existingUser) {
            throw new Error("El email ya ha sido registrado");
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const admin = await Admin.create({
            nombre: nombre,
            apellidos: apellidos,
            email: correo,
            password: hashedPassword,
            estado: 0,
          },{transaction:transaction});
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

    static async getUserByPk(id){
        return await Admin.findOne({ where: { id: id } });
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