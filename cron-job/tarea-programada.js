const { scheduleJob } = require('node-schedule');
const NotifyToUser = require('./schedule/notify-to-user');
const CreateDeudaMensual = require('./schedule/create-deuda-mensual');
const DetalleUsuarioFacturaRepository = require('../repositories/detalle.factura.repository');
const moment =  require('moment');
const apiWhatsappWeb = require('../adapter/whatsapp/api-whatsapp-web');
class TareaProgramada {
    zonaHorariaBolivia = 'America/La_Paz';
    constructor() {
        this.tareaDia20 = scheduleJob({ rule: '0 9 20 * *', tz: this.timeZone }, () => {
            NotifyToUser.ejecutarNotificaciones();
        });

        this.tareaFinDeMes = scheduleJob({ rule: '0 9 28 * *', tz: this.timeZone }, () => {
            NotifyToUser.ejecutarNotificaciones();
        });
        this.crearDeudaMensuales = scheduleJob({ rule: '55 23 * * *', tz: this.timeZone },async () => {
            CreateDeudaMensual.handle();
        });

        this.crearDeudaAutomatico = scheduleJob({rule: '* * * * *', tz: this.zonaHorariaBolivia}, ()=>{
            DetalleUsuarioFacturaRepository.createAutomaticDebts();
        });

        this.prueba = scheduleJob({ rule: '*/2 * * * *', tz: this.timeZone },async ()=>{
            moment.locale('es');
            console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
            console.log("Tarea programada ejecutandose");
            // await apiWhatsappWeb.enviarMensajeTexto("+59162008498", "Cada 5 min: horaSErvidor\r\n "+moment().format('YYYY-MM-DD HH:mm:ss'));
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
}

module.exports = TareaProgramada;