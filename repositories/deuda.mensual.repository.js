const UsuarioRepository = require("./usuario.repository");
const ServicioRepository = require("./servicio.repository");
const DetalleUsuarioFacturaRepository = require("./detalle.factura.repository");
const {
    DeudaMensual, sequelize, DetalleDeudaMensual, Sequelize,Usuario,Servicio
} = require('../models');
const moment = require('moment-timezone');
const { error } = require("../utils/helper_response");
const { Op } = require("sequelize");
class DeudaMensualRepository {
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
        this.servicioRepository = new ServicioRepository();
        this.detalleUsuarioFacturaRepository = new DetalleUsuarioFacturaRepository();
    }

    async crearDeudaDelUsuario() {
        const transaction = await sequelize.transaction();
        try {
            const fecha = moment().tz('America/La_Paz');
            let mes = moment(fecha).format('MMMM-YYYY');
            moment.locale('es');
            const startOfMonth = moment().tz('America/La_Paz').startOf('month').startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const endOfMonth = moment().tz('America/La_Paz').endOf('month').endOf('day').format('YYYY-MM-DD HH:mm:ss');
            const existingRecord = await DeudaMensual.findOne({
                where: {
                    fecha: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            });
            if (existingRecord) {
                throw new Error("Ya existe deuda mensuales de este mes");
            }
            let deudasUsuarios = await this.usuarioRepository.getUserConFacturasNoPagadas();
            for (let index = 0; index < deudasUsuarios.length; index++) {
                const deudas = deudasUsuarios[index].DetalleUsuarioFactura;
                const usuario = deudasUsuarios[index];
                let montoTotal = 0;
                let montoPago = 0;
                let montoDebe = 0;
                const deudaMensualUsuario = await DeudaMensual.create({
                    monto: 0,
                    monto_pago: 0,
                    monto_debe: 0,
                    usuarioid: usuario.id,
                    fecha: fecha,
                    mes: mes,
                }, { transaction });
                deudaMensualUsuario.save();
                for (let j = 0; j < deudas.length; j++) {
                    const deuda = deudas[j];
                    let debe = parseFloat((deuda.monto - deuda.monto_pago).toFixed(2));
                    const detalleDeudaMensual = await DetalleDeudaMensual.create({
                        servicioid: deuda.servicioid,
                        deuda_mensual_id: deudaMensualUsuario.id,
                        monto: deuda.monto,
                        monto_pago: deuda.monto_pago,
                        monto_debe: debe,
                        usuarioid: usuario.id,
                        fecha: deuda.fecha,
                        mes: moment(deuda.fecha).format('MMMM-YYYY'),
                    }, { transaction });
                    detalleDeudaMensual.save();
                    montoTotal += deuda.monto;
                    montoPago += deuda.monto_pago;
                    montoDebe += debe;
                }
                deudaMensualUsuario.monto = parseFloat(montoTotal.toFixed(2));
                deudaMensualUsuario.monto_pago = parseFloat(montoPago.toFixed(2));
                deudaMensualUsuario.monto_debe = parseFloat(montoDebe.toFixed(2));
                deudaMensualUsuario.save();;
            }
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw new Error(error.message);
        }
    }

    async getDeudasMensuales(mes = "2023-11",page = 1,limit = 8) {
        const fechaInicio = moment(mes).startOf('month'); 
        const fechaFin = moment(mes).endOf('month');
        const offset = (page - 1) * limit;
        const { count, rows }  = await DeudaMensual.findAndCountAll({
            include: [
                {
                    model: DetalleDeudaMensual,
                    as:"DetalleDeudaMensuales",
                    include:[
                        {
                            model: Servicio
                        },
                    ]
                },
                {
                    model: Usuario
                }
            ],
            where:{
                fecha: {
                    [Op.gte]: fechaInicio,
                    [Op.lte]: fechaFin,
                },
            },
            order: [
                ['fecha', 'DESC'],
            ],
        },{
            offset: offset,
            limit: limit
        });
        return {
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows,
        };
    }
}
module.exports = DeudaMensualRepository;