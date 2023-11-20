const cron = require('node-cron');
const UsuarioRepository = require('../repositories/usuario.repository');
const DeudaMensualRepository = require('../repositories/deuda.mensual.repository');
const moment = require('moment-timezone');
const apiWhatsappWeb = require('../adapter/whatsapp/api-whatsapp-web');

class TareaProgramada {
    constructor() {
        this.tareaDia20 = cron.schedule('22 4 20 * *', () => {
            console.log('Tarea programada el día 20 de cada mes ejecutada:');
            this.ejecutarNotificaciones();
        });

        this.tareaFinDeMes = cron.schedule('0 0 28 * *', () => {
            console.log('Tarea programada al final de cada mes ejecutada:');
            this.ejecutarNotificaciones();
        });
        this.crearDeudaMensuales = cron.schedule('59 23 * * *', async () => {
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

        this.prueba = cron.schedule('* * * * *',()=>{
            console.log("Tarea programada ejecutandose");
        });
    }

    iniciarTareas() {
        this.tareaDia20.start();
        this.tareaFinDeMes.start();
        this.crearDeudaMensuales.start();
        this.prueba.start();
    }

    detenerTareas() {
        if (this.tareaDia20) {
            this.tareaDia20.stop();
        }

        if (this.tareaFinDeMes) {
            this.tareaFinDeMes.stop();
        }
        if (this.crearDeudaMensuales) {
            this.crearDeudaMensuales.stop();
        }
    }

    async ejecutarNotificaciones() {
        const usuarioRepository = new UsuarioRepository();
        await usuarioRepository.notificarPorWhatsappLasDeudasPendientes();
    }
}

module.exports = TareaProgramada;