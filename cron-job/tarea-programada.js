const { scheduleJob } = require('node-schedule');
const NotifyToUser = require('./schedule/notify-to-user');
const CreateDeudaMensual = require('./schedule/create-deuda-mensual');
const DetalleUsuarioFacturaRepository = require('../repositories/detalle.factura.repository');
const moment =  require('moment');
const VeripagosDeudaFacturaService = require('../services/veripagos-deuda-factura.service');
class TareaProgramada {
    zonaHorariaBolivia = 'America/La_Paz';
    constructor() {
        this.tareaDia20 = scheduleJob({ rule: '0 9 20 * *', tz: this.zonaHorariaBolivia }, () => {
            NotifyToUser.ejecutarNotificaciones();
        });

        this.tareaFinDeMes = scheduleJob({ rule: '0 9 28 * *', tz: this.zonaHorariaBolivia }, () => {
            VeripagosDeudaFacturaService.crearVeripagosInstanceAndSendQrByManyDetalleUsuarioFactura();
        });
        this.crearDeudaMensuales = scheduleJob({ rule: '55 23 * * *', tz: this.zonaHorariaBolivia },async () => {
            CreateDeudaMensual.handle();
        });

        this.crearDeudaAutomatico = scheduleJob({rule: '* * * * *', tz: this.zonaHorariaBolivia}, ()=>{
            DetalleUsuarioFacturaRepository.createAutomaticDebts();
        });

        this.prueba = scheduleJob({ rule: '*/2 * * * *', tz: this.zonaHorariaBolivia },async ()=>{
            moment.locale('es');
            console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
            console.log("Tarea programada ejecutandose");
            // VeripagosDeudaFacturaService.crearVeripagosInstanceAndSendQrByManyDetalleUsuarioFactura();
            // let setting = await configuracionRepository.getConfiguracionByAdminId(1);
            // let veripagosApi =  new VeripagosAPI(setting.veripagos_username, setting.veripagos_password, setting.veripagos_secret_key);
            // let result = await veripagosApi.generarQR(1, [], '1/00:00');
            // console.log(result);
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