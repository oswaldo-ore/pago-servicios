const apiWhatsappWeb = require("../../adapter/whatsapp/api-whatsapp-web");
const moment = require('moment-timezone');
const ConfiguracionRepository = require("../../repositories/configuracion.repository");
const DeudaMensualRepository = require("../../repositories/deuda.mensual.repository");
const configuracionRepository = new ConfiguracionRepository();
class CreateDeudaMensual{
    static async handle() {
        let configuracion = await configuracionRepository.getConfiguracion();
        try {
            console.log('Tarea programada para crear deudas mensualmente');
            let today = moment().tz('America/La_Paz').format('YYYY-MM-DD HH:mm:ss');
            let tomorrow = moment().tz('America/La_Paz').add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
            today = moment(today);
            tomorrow = moment(tomorrow);
            if (today.month() !== tomorrow.month()) {
                let deudaMensualRepository = new DeudaMensualRepository();
                await deudaMensualRepository.crearDeudaDelUsuario(today);
                today = moment().format('YYYY-MM-DD HH:mm');
                if(configuracion.estado_conexion){
                    await apiWhatsappWeb.enviarMensajeTexto("+59162008498",`Deudas mensuales creadas exitosamente.\r\n*${today}*`,configuracion.instancia_id);
                }
            }
        } catch (error) {
            let today = moment().format('YYYY-MM-DD HH:mm');
            if(configuracion.estado_conexion){
                await apiWhatsappWeb.enviarMensajeTexto("+59162008498", "Erro al crear deudas mensuales\r\n*"+today+"*\r\n"+error.message,configuracion.instancia_id);
            }
        }
    }
}

module.exports = CreateDeudaMensual;