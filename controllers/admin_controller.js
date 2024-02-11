const UserService = require('../services/user.service');
const ResponseHelper = require('../utils/helper_response');

const AdminController = {
    async createNewUser(req,res){
        try {
            let {nombre,apellidos,correo,password, cod_pais = "", phone_number = ""} = req.body;
            let admin = await UserService.crearNuevoUsuarioAdmin(nombre,apellidos,correo,password,cod_pais,phone_number);
            return res.json(ResponseHelper.success(admin,"El usuario se ha creado correctamente"));
        } catch (error) {
            return res.json(ResponseHelper.error(error.message));
        }
    },
}

module.exports = AdminController;