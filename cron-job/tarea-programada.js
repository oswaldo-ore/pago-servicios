const UsuarioRepository = require('../repositories/usuario.repository');
const DeudaMensualRepository = require('../repositories/deuda.mensual.repository');
const moment = require('moment-timezone');
const apiWhatsappWeb = require('../adapter/whatsapp/api-whatsapp-web');
const { scheduleJob } = require('node-schedule');

class TareaProgramada {
    zonaHorariaBolivia = 'America/La_Paz';
    constructor() {
        this.tareaDia20 = scheduleJob({ day: 20, hour: 9, minute: 0,  tz: this.zonaHorariaBolivia }, () => {
            this.ejecutarNotificaciones();
        });

        this.tareaFinDeMes = scheduleJob({ day: 28, hour: 9, minute: 0, tz: this.zonaHorariaBolivia }, () => {
            this.ejecutarNotificaciones();
        });
        this.crearDeudaMensuales = scheduleJob({ hour: 23, minute: 55, tz: this.zonaHorariaBolivia },async () => {
            try {
                console.log('Tarea programada para crear deudas mensualmente');
                let today = moment().tz('America/La_Paz').format('YYYY-MM-DD HH:mm:ss');
                let tomorrow = moment().tz('America/La_Paz').add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
                today = moment(today);
                tomorrow = moment(tomorrow);
                if (today.month() !== tomorrow.month()) {
                    console.log('Nuevo mes!');
                    let deudaMensualRepository = new DeudaMensualRepository();
                    await deudaMensualRepository.crearDeudaDelUsuario();
                    today = moment().format('YYYY-MM-DD HH:mm');
                    await apiWhatsappWeb.enviarMensajeTexto("12345","+59162008498",`Deudas mensuales creadas exitosamente.\r\n*${today}*`);
                }
            } catch (error) {
                let today = moment().format('YYYY-MM-DD HH:mm');
                await apiWhatsappWeb.enviarMensajeTexto("12345","+59162008498", "Erro al crear deudas mensuales\r\n*"+today+"*\r\n"+error.message);
            }
        });

        this.prueba = scheduleJob({minute: 1, tz: this.zonaHorariaBolivia },()=>{
            moment.locale('es');
            console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
            console.log("Tarea programada ejecutandose");
        });
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
        await usuarioRepository.notificarPorWhatsappLasDeudasPendientes();
    }
}

module.exports = TareaProgramada;