const { now } = require('moment');
const apiWhatsappWeb = require('../adapter/whatsapp/api-whatsapp-web');
const moment = require('moment');
const {
    Factura,
    DetalleUsuarioFactura,
    Usuario,
    Servicio,
    Movimiento,
    DetalleMovimiento,
    sequelize
} = require('../models');
const { Op } = require('sequelize');
const ConfiguracionRepository = require('./configuracion.repository');
const SuscripcionRepository = require('./suscripcion.repository');
const ServicioRepository = require('./servicio.repository');
const configuracionRepository = new ConfiguracionRepository();
const serviceRepository = new ServicioRepository();
nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
class DetalleUsuarioFacturaRepository {
    
    async deudasNoCanceladasDeUnUsuario(usuarioId) {
        const detallesPrestadosNoCancelados = await DetalleUsuarioFactura.findAll({
            include: [
                {
                    model: Usuario,
                    required: true
                },
                {
                    model: Servicio,
                    required: false,
                },
                {
                    model: Factura,
                    required: false,
                }
            ],
            where: {
                usuarioid: usuarioId,
                estado: {
                    [Op.or]: [DetalleUsuarioFactura.PENDIENTE, DetalleUsuarioFactura.PRESTADO ] 
                }
            },
            order: [
                ["fecha","ASC"],
                ["monto","DESC"]
            ]
        });
        return detallesPrestadosNoCancelados;
    }

    async deudasDeUnUsuarioWithPaginate(usuarioId, page, limit,state) {
        //sacar los valores para el paginate
        const offset = (page - 1) * limit;
        let stateWhere = {};
        if(state == DetalleUsuarioFactura.COMPLETADO){
            stateWhere.estado = DetalleUsuarioFactura.COMPLETADO;
        }else if(state == -1){
            stateWhere.estado = {
                [Op.or]: [DetalleUsuarioFactura.PENDIENTE, DetalleUsuarioFactura.PRESTADO, DetalleUsuarioFactura.COMPLETADO]
            }
        }else{
            stateWhere.estado = {
                [Op.or]: [DetalleUsuarioFactura.PENDIENTE, DetalleUsuarioFactura.PRESTADO ]
            }
        }
        console.log(stateWhere);
        const { count, rows }  = await DetalleUsuarioFactura.findAndCountAll({
            include: [
                {
                    model: Usuario,
                    required: true
                },
                {
                    model: Servicio,
                    required: false,
                },
                {
                    model: Factura,
                    required: false,
                }
            ],
            where: {
                usuarioid: usuarioId,
                // estado: {
                //     [Op.or]: [DetalleUsuarioFactura.PENDIENTE, DetalleUsuarioFactura.PRESTADO ] 
                // }
                ...stateWhere
            },
            order: [
                ["fecha","DESC"],
                ["monto","DESC"]
            ],
            offset,
            limit: +limit,
            distinct: true
        });
        return {
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: +page,
            data: rows,
        };
    }

    async pagarDeudasNoCanceladasDeUnUsuario(usuarioId,monto,detalle) {
        const transaction = await sequelize.transaction();
        try {
            let deudas = await this.deudasNoCanceladasDeUnUsuario(usuarioId);
            let usuario = await Usuario.findByPk(usuarioId); 
            let movimiento = await Movimiento.create({
                monto: monto,
                fecha: new Date(),
                usuarioid: usuarioId,
                descripcion: detalle=="" ?"Pago del servicio":detalle,
                saldo_anterior: 0,
                a_cuenta: 0
            },{ transaction});
            let message = `*Infome del pago - Bs. ${monto}*\r\n\r\n`;
            let now = moment();
            let formattedDate = now.format('DD-MM-YYYY HH:mm');
            message+= `*Fecha:* ${formattedDate}\r\n`;
            message+= `${usuario.nombre} ${usuario.apellidos}\r\n\r\n`;
            for (let index = 0; index < deudas.length && monto > 0; index++) {
                const deuda = deudas[index];
                let isCancelado = monto >= (deuda.monto - deuda.monto_pago);
                let montoPago = 0;
                let montoDeuda = parseFloat(deuda.monto) - parseFloat(deuda.monto_pago);
                let messageDeuda = "";
                let montoAnterior = deuda.monto_pago;
                if(isCancelado){
                    montoPago = montoDeuda;
                    deuda.monto_pago = deuda.monto;
                    deuda.fecha_pago = new Date();
                    deuda.estado = DetalleUsuarioFactura.COMPLETADO;
                    messageDeuda ="La deuda ha sido saldada";
                }else{
                    deuda.monto_pago += parseFloat(monto);
                    montoPago = parseFloat(monto);
                    messageDeuda =`*Deuda pendiente:*\r\n*Debe:* Bs. ${(deuda.monto - deuda.monto_pago).toFixed()}`;
                }
                let nameMes = nombresMeses[new Date(deuda.fecha).getMonth()];
                let year = new Date(deuda.fecha).getFullYear();
                // console.log("Deuda: "+deuda.monto+" Cancelado: "+isCancelado+" Monto que pago: "+montoPago+" Monto debe: "+ montoDeuda+" mes: "+nameMes);
                let detalleMovimiento = await DetalleMovimiento.create({
                    monto: montoPago,
                    fecha: new Date(),
                    detalleusuariofacturaid: deuda.id,
                    descripcion: "Pago de "+ deuda.Servicio.nombre+" de "+ nameMes+" - "+year,
                    movimientoid: movimiento.id
                },{transaction});
                let messageMontoAnterior = ``;
                if(montoAnterior > 0){
                    messageMontoAnterior=`_~*Monto Pago Anterior:* Bs. ${montoAnterior}~_\r\n`;
                }
                message+="---------------------------\r\n";
                message+=`*Servicio:* ${deuda.Servicio.nombre}\r\n*Mes:* ${nameMes+" - "+year}\r\n*Deuda:* Bs ${deuda.monto}\r\n${messageMontoAnterior}*Monto Cancelado:* Bs.${montoPago}\r\n${messageDeuda}\r\n`
                message+="---------------------------\r\n";
                await deuda.save({ transaction: transaction });
                monto -= montoPago;
                monto = parseFloat(monto.toFixed(2));
            }
            if(monto > 0){
                movimiento.a_cuenta = monto;
                usuario.a_cuenta += monto;
                await movimiento.save({ transaction: transaction });
            }
            await transaction.commit();
            try {
                if(usuario.cod_pais!="" && usuario.telefono != ""){
                    let number = usuario.cod_pais+usuario.telefono;
                    let configuracion = await configuracionRepository.getConfiguracion();
                    if(configuracion.estado_conexion){
                        await apiWhatsappWeb.enviarMensajeTexto(number,message,configuracion.insta);
                    }
                }
            } catch (error) {
                console.log("ocurrio un error " + error);
            }
            return movimiento;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error);
        }
    }
    async detallesDeUsuarioFacturaPagados(usuarioId) {
        const detallesPagados = await DetalleUsuarioFactura.findAll({
            include: [
                {
                    model: Usuario,
                    required: true
                },
                {
                    model: Servicio,
                    required: false
                },
                {
                    model: Factura,
                    required: false,
                }
            ],
            where: {
                usuarioid: usuarioId,
                estado: DetalleUsuarioFactura.COMPLETADO
            },
            order:[
                [ "createdAt","DESC" ]
            ]
        });
        return detallesPagados;
    }

    async deudasNoCanceladas() {
        const detallesPrestadosNoCancelados = await DetalleUsuarioFactura.findAll({
            include: [
                {
                    model: Usuario,
                    required: true
                },
                {
                    model: Servicio,
                    required: false,
                },
                {
                    model: Factura,
                    required: false,
                }
            ],
            where: {
                estado: {
                    [Op.or]: [DetalleUsuarioFactura.PENDIENTE, DetalleUsuarioFactura.PRESTADO ] 
                }
            },
            order: [
                ["fecha","ASC"],
                ["usuarioid","ASC"]
            ]
        });
        return detallesPrestadosNoCancelados;
    }

    static async existsDeudaWithUserServiceAndDate(usuarioId,servicioId,fecha){
        console.log(fecha);
        return await DetalleUsuarioFactura.findOne({
            where:{
                servicioid: servicioId,
                usuarioid: usuarioId,
                fecha: {
                    [Op.startsWith]: fecha,
                }
            },
        });
    }
    static async existsDeudaWithUserServiceAndDateAndIsGenerateAutomatic(usuarioId,servicioId,fecha){
        console.log(fecha);
        return await DetalleUsuarioFactura.findOne({
            where:{
                servicioid: servicioId,
                usuarioid: usuarioId,
                fecha: {
                    [Op.startsWith]: fecha,
                },
                es_deuda_generada: DetalleUsuarioFactura.GENERADO_AUTOMATICO,
            },
        });
    }
    static async createAutomaticDebts(){
        let date = moment();
        let day = date.date();
        let userWithSubscriptionAutomatic = await SuscripcionRepository.getUserWithSubscriptionAutomatic(day);
        for (let index = 0; index < userWithSubscriptionAutomatic.length; index++) {
            const subscription = userWithSubscriptionAutomatic[index]; //suscripcion
            const user = subscription.Usuario;
            let date = moment().format('YYYY-MM-DD');
            const exitsDeuda = await this.existsDeudaWithUserServiceAndDateAndIsGenerateAutomatic(subscription.usuarioid,subscription.servicioid,date);
            if(!exitsDeuda){
                const detalleFactura = new DetalleUsuarioFacturaRepository();
                detalleFactura.createDebtAndSendMessageToUser(
                    subscription.usuarioid,
                    subscription.servicioid,
                    subscription.monto,
                    date,
                    DetalleUsuarioFactura.GENERADO_AUTOMATICO
                );
                console.log("Se esta creando la deuda");
            }else{
                console.log("Ya existe la deuda");
            }
        }
    }
    async getDetalleUsuarioFacturaById(detalleUsuarioFacturaId) {
        return await DetalleUsuarioFactura.findByPk(detalleUsuarioFacturaId);
    }

    async createDebt(userId,serviceId,amount,date){
        return await DetalleUsuarioFactura.create({
            servicioid: serviceId,
            usuarioid: userId,
            facturaid: null,
            monto: amount,
            fecha: date
        });

    }

    async createDebtAndSendMessageToUser(userId,serviceId,amount,date,isDebtGenerate = DetalleUsuarioFactura.NO_GENERADO){
        let date2 = moment().format('DD-MM-YYYY');
        let detalle = await DetalleUsuarioFactura.create({
            servicioid: serviceId,
            usuarioid: userId,
            facturaid: null,
            monto: parseFloat(amount.toFixed(2)),
            es_deuda_generada: isDebtGenerate,
            fecha: date,
        });
        let service = await serviceRepository.getServiceById(serviceId);
        let configuracion = await configuracionRepository.getConfiguracion();
        if(configuracion.estado_conexion){
            let user = await Usuario.findByPk(userId);
            let mensaje = `Se ha registrado una nueva deuda.\r\n`;
            mensaje += `*Deuda:* ${date2}\r\n`;
            mensaje += `*Servicio:* ${service.nombre}\r\n`;
            mensaje += `*Monto:* Bs. ${detalle.monto}\r\n`;
            let number = user.cod_pais + user.telefono;
            await apiWhatsappWeb.enviarMensajeTexto(number,mensaje,configuracion.instancia_id);
        }
        return detalle;
    }
}

module.exports = DetalleUsuarioFacturaRepository;