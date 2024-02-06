const ResponseHelper = require('../utils/helper_response');
const ConfiguracionRepository = require('../repositories/configuracion.repository');
const configuracionRepository = new ConfiguracionRepository();

const ConfiguracionController = {
    
    async getConfiguracion(req,res) {
        try {
            const configuracion = await configuracionRepository.getConfiguracion();
            return res.json(ResponseHelper.success(configuracion,"Configuracion"));
        } catch (error) {
            return res.json(ResponseHelper.error('Error en el servidor'));
        }
    },
    
    async getConfiguracionV2(req,res) {
        try {
            const configuracion = await configuracionRepository.getConfiguracionByAdminId(req.user.id);
            return res.json(ResponseHelper.success(configuracion, "Configuracion" ));
        } catch (error) {
            return res.json(ResponseHelper.error('Error en el servidor'));
        }
    },
    async generarCodigoQr(req,res){
        try {
            let response = await configuracionRepository.generarCodigoQr();
            return res.json(ResponseHelper.success(response.data) );
        } catch (error) {
            return res.json(ResponseHelper.error(error.message));
        }
    },

    async generarCodigoQrV2(req,res){
        try {
            let response = await configuracionRepository.generarCodigoQrByAdminId(req.user.id);
            return res.json(ResponseHelper.success(response.data) );
        } catch (error) {
            return res.json(ResponseHelper.error(error.message));
        }
    },

    async updateVeripagosConfiguracion(req,res){
        try {
            let {secret_key,username,password=""} = req.body;
            let admin_id = req.user.id;
            let response = await configuracionRepository.updateVeripagosConfiguracion(secret_key,username,password, admin_id);
            return res.json(ResponseHelper.success(response));
        } catch (error) {
            return res.json(ResponseHelper.error(error.message));
        }
    },

    async verificarConexion(req,res){
        try {
            let response = await configuracionRepository.verificarConexionQr();
            return res.json(ResponseHelper.success(response));
        } catch (error) {
            console.log(error);
            return res.json(ResponseHelper.error(error.message??""));
        }
    },

    async verificarConexionV2(req,res){
        try {
            let response = await configuracionRepository.verificarConexionQrByAdminId(req.user.id);
            return res.json(ResponseHelper.success(response));
        } catch (error) {
            console.log(error);
            return res.json(ResponseHelper.error(error.message??""));
        }
    },

    async desconectarNroWhatsapp(req,res){
        try {
            let response = await configuracionRepository.desconectarNroWhatsapp();
            return res.json(ResponseHelper.success(response));
        } catch (error) {
            return res.json(ResponseHelper.error(error.message));
        }
    },

    async desconectarNroWhatsappV2(req,res){
        try {
            let response = await configuracionRepository.desconectarNroWhatsappByAdminId(req.user.id);
            return res.json(ResponseHelper.success(response));
        } catch (error) {
            return res.json(ResponseHelper.error(error.message));
        }
    }

}

module.exports = ConfiguracionController;