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

        this.crearDeudaAutomatico = scheduleJob({rule: '0 * * * *', tz: this.zonaHorariaBolivia}, ()=>{
            DetalleUsuarioFacturaRepository.createAutomaticDebts();
        });

        this.prueba = scheduleJob({ rule: '* 10-11 * * *', tz: this.zonaHorariaBolivia },async ()=>{
            moment.locale('es');
            console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
        });
    }

    iniciarTareas() {
    }

    detenerTareas() {
    }
}

module.exports = TareaProgramada;