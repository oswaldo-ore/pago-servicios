const {
    Factura,
    DetalleUsuarioFactura,
    Usuario,
    Servicio,
    Suscripcion,
    Medidor
} = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const SaveImage = require('../utils/save_images');
const moment = require('moment');
const UsuarioRepository = require('./usuario.repository');
const medidor = require('../models/medidor');


class FacturaRepository {
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
    }

    async listarFacturas(page = 1, limit = 8) {
        const offset = (page - 1) * limit;
        const { count, rows } = await Factura.findAndCountAll({
            offset,
            limit: +limit,
            include: [
                {
                    model: DetalleUsuarioFactura,
                    required: false,
                    include: [
                        {
                            model: Usuario,
                            required: true
                        }
                    ]
                },
                {
                    model: Servicio,
                }
            ],
            order: [
                ['fecha', 'DESC']
              ],
        });
        const total = await Factura.count({
            lean: true
          });
        return {
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: +page,
            data: rows,
        };
    }

    async verFactura(id) {
        const factura = await Factura.findByPk(id,{
            include: [
                {
                    model: DetalleUsuarioFactura,
                    required: false,
                    include: [
                        {
                            model: Usuario,
                            required: true
                        }
                    ]
                },
                {
                    model: Servicio,
                }
            ]
        });
        return factura;
    }

    async registrarDetalleFactura(monto,detalleFacturaId,isPrestado){
        const transaction = await sequelize.transaction();
        console.log("hola esto es "+isPrestado);
        try {
            const fechaActual = new Date();
            let detalle = await DetalleUsuarioFactura.findByPk(detalleFacturaId);
            let cambio =0;
            monto += detalle.monto_pago;
            if(monto >= detalle.monto){
                cambio= monto - detalle.monto;
                detalle.iscancelado = true;
            }
            detalle.monto_pago = parseFloat(monto.toFixed(2));
            detalle.isprestado = isPrestado;
            detalle.cambio_pago = parseFloat(cambio.toFixed(2));
            detalle.fecha_pago = fechaActual;
            await detalle.save({ transaction: transaction });
            await transaction.commit();
            return detalle;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error);
        }
    }

    async verificarSiLaFacturaPagada(facturaId){
        let factura = await this.verFactura(facturaId);
        let montoTotal = await DetalleUsuarioFactura.sum('monto_pago',{
            where:{
                facturaid:facturaId,
            }
        });

        if(montoTotal >= factura.monto){
            factura.ispagado = true;
            await factura.save();
        }
    }

    async devolverPrestamoDelPago(detalleFacturaId){
        let detalle = await DetalleUsuarioFactura.findByPk(detalleFacturaId);
        detalle.isprestado=false;
        await detalle.save();
    }
    async crearFactura(monto, fecha, foto, servicioid) {
        const transaction = await sequelize.transaction();
        try {
            const fechaFormateada = moment(fecha).format('YYYY-MM');
            let verificarFactura = await Factura.findAll({
                where: {
                    fecha: {
                        [Op.startsWith]: fecha,
                    },
                    servicioid: servicioid
                }
            });
            if(verificarFactura.length > 0){
                throw new Error("Ya ha sido registrado una factura con la Fecha: " + fechaFormateada);
            }

            const usuariosSinRegistroMedidor = await this.usuarioRepository.sinRegistroDelMedidorPorFecha(fechaFormateada, servicioid);
            if (usuariosSinRegistroMedidor.length > 0) {
                throw new Error("Hay usuarios sin registro del medidor. Fecha: " + fechaFormateada);
            }

            const usuarioConMedidor = await this.usuarioRepository.medidoresConSuscripcionEnFecha(servicioid, fechaFormateada);
            let sumaMontoMedidorFecha = usuarioConMedidor.reduce((total, medidor) => total + parseFloat(medidor.monto), 0);
            sumaMontoMedidorFecha = parseFloat(sumaMontoMedidorFecha.toFixed(2));

            const suscripcionesFijaDeUsuarios = await this.usuarioRepository.conSuscripcionFija(servicioid);
            let sumaMontoUsuarioConMontoFijo = suscripcionesFijaDeUsuarios.reduce((total, suscripcion) => total + parseFloat(suscripcion.monto), 0);
            sumaMontoUsuarioConMontoFijo = parseFloat(sumaMontoUsuarioConMontoFijo.toFixed(2));

            const suscripcionesDinamicoDeUsuarios = await this.usuarioRepository.conSuscripcionDinamico(servicioid);

            let calcular = (monto - sumaMontoMedidorFecha - sumaMontoUsuarioConMontoFijo) / suscripcionesDinamicoDeUsuarios.length;
            // console.log(monto, sumaMontoMedidorFecha, sumaMontoUsuarioConMontoFijo, suscripcionesDinamicoDeUsuarios.length);
            // console.log(calcular);
            /* Creamos la factura  */
            let url_image = SaveImage.save(`facturas-serv-${servicioid}/`, foto);
            const factura = await Factura.create({
                monto: monto,
                fecha: fecha,
                foto_factura: url_image,
                servicioid: servicioid,
            }, { transaction: transaction });
            let detallesFactura = [];
            for (let index = 0; index < usuarioConMedidor.length; index++) {
                const element = usuarioConMedidor[index];//medidor
                let detalle = await DetalleUsuarioFactura.create({
                    servicioid: servicioid,
                    usuarioid: element.usuarioId,
                    facturaid: factura.id,
                    monto: parseFloat(element.monto.toFixed(2)),
                    fecha: fecha,
                }, { transaction: transaction });
                detallesFactura.push(detalle);
            }
            for (let index = 0; index < suscripcionesFijaDeUsuarios.length; index++) {
                const element = suscripcionesFijaDeUsuarios[index];//suscripcion
                let detalle = await DetalleUsuarioFactura.create({
                    servicioid: servicioid,
                    usuarioid: element.usuarioid,
                    facturaid: factura.id,
                    monto: parseFloat(element.monto.toFixed(2)),
                    fecha: fecha,
                }, { transaction: transaction });
                detallesFactura.push(detalle);
            }

            for (let index = 0; index < suscripcionesDinamicoDeUsuarios.length; index++) {
                const element = suscripcionesDinamicoDeUsuarios[index];//suscripcion
                let detalle = await DetalleUsuarioFactura.create({
                    servicioid: servicioid,
                    usuarioid: element.usuarioid,
                    facturaid: factura.id,
                    monto: parseFloat(calcular.toFixed(2)),
                    fecha: fecha,
                }, { transaction: transaction });
                detallesFactura.push(detalle);
            }
            await transaction.commit();
            return factura;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error);
        }
    }

    async eliminarFactura(id) {
        try {
            const factura = await Factura.findByPk(id);
            if (!factura) {
                throw new Error('Factura no encontrada');
            }
            // const rutaArchivo = path.join(__dirname, `../public${factura.foto_factura}`);
            // if (fs.existsSync(rutaArchivo)) {
            //     fs.unlinkSync(rutaArchivo);
            // }
            await factura.destroy();
            return { message: 'Factura eliminada correctamente' };
        } catch (error) {
            // Manejo de errores
            throw new Error(error);
        }
    }
}

module.exports = FacturaRepository;