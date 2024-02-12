const UserService = require('../services/user.service');
const VeripagosDeudaFacturaService = require('../services/veripagos-deuda-factura.service');
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

    async notify(req,res){
        try {
            let response = await VeripagosDeudaFacturaService.crearVeripagosInstanceAndSendQrByManyDetalleUsuarioFactura();
            return res.json(ResponseHelper.success(null,"El usuario se ha creado correctamente"));
        } catch (error) {
            return res.json(ResponseHelper.error(error.message));
            
        }
    }
}

module.exports = AdminController;