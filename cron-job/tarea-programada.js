const UsuarioRepository = require('../repositories/usuario.repository');
const DeudaMensualRepository = require('../repositories/deuda.mensual.repository');
const moment = require('moment-timezone');
const apiWhatsappWeb = require('../adapter/whatsapp/api-whatsapp-web');
const { scheduleJob } = require('node-schedule');
const ConfiguracionRepository = require('../repositories/configuracion.repository');
const configuracionRepository = new ConfiguracionRepository();
class TareaProgramada {
    zonaHorariaBolivia = 'America/La_Paz';
    constructor() {
        this.tareaDia20 = scheduleJob({ rule: '0 9 20 * *', tz: this.timeZone }, () => {
            this.ejecutarNotificaciones();
        });

        this.tareaFinDeMes = scheduleJob({ rule: '0 9 28 * *', tz: this.timeZone }, () => {
            this.ejecutarNotificaciones();
        });
        this.crearDeudaMensuales = scheduleJob({ rule: '55 23 * * *', tz: this.timeZone },async () => {
            let configuracion = await configuracionRepository.getConfiguracion();
            try {
                console.log('Tarea programada para crear deudas mensualmente');
                let today = moment().tz('America/La_Paz').format('YYYY-MM-DD HH:mm:ss');
                let tomorrow = moment().tz('America/La_Paz').add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
                today = moment(today);
                tomorrow = moment(tomorrow);
                console.log(today,tomorrow);
                if (today.month() !== tomorrow.month()) {
                    console.log('Nuevo mes!');
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
        });

        // this.prueba = scheduleJob({ rule: '*/2 * * * *', tz: this.timeZone },async ()=>{
        //     moment.locale('es');
        //     console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
        //     console.log("Tarea programada ejecutandose");
        //     await apiWhatsappWeb.enviarMensajeTexto("+59162008498", "Cada 5 min: horaSErvidor\r\n "+moment().format('YYYY-MM-DD HH:mm:ss'));
        // });
    }

    iniciarTareas() {
        // this.tareaDia20.start();
        // this.tareaFinDeMes.start();
        // this.crearDeudaMensuales.start();
        // this.prueba.start();
    }

    detenerTareas() {
        
    }

    async ejecutarNotificaciones() {
        const usuarioRepository = new UsuarioRepository();
        let configuracion = await configuracionRepository.getConfiguracion();
        if(configuracion.estado_conexion){
            await usuarioRepository.notificarPorWhatsappLasDeudasPendientes(configuracion.instancia_id);
        }
    }
}

module.exports = TareaProgramada;