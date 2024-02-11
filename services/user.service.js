const { sequelize } = require("../models");
const AdminRepository = require("../repositories/admin.repository");
const ConfiguracionRepository = require("../repositories/configuracion.repository");
const configuracionRepository = new ConfiguracionRepository();
class UserService {
    static async crearNuevoUsuarioAdmin(nombre,apellidos,correo,password,cod_pais,phone_number) {
        return await sequelize.transaction(async (transaction) => {
            let admin = await AdminRepository.createUser(nombre,apellidos,correo,password,transaction);
            let config = await configuracionRepository.createConfiguracion(cod_pais,phone_number, admin.id,transaction);
            admin.Configuracion = config;
            return admin;
        });
    }
}

module.exports = UserService;