const ConfiguracionRepository = require("../../repositories/configuracion.repository");
const UsuarioRepository = require("../../repositories/usuario.repository");
const configuracionRepository = new ConfiguracionRepository();

class NotifyToUser{
    static async ejecutarNotificaciones() {
        const usuarioRepository = new UsuarioRepository();
        let configuracion = await configuracionRepository.getConfiguracion();
        if(configuracion.estado_conexion){
            await usuarioRepository.notificarPorWhatsappLasDeudasPendientes(configuracion.instancia_id);
        }
    }
}
module.exports = NotifyToUser;