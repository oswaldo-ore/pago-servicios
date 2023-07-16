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
                }
            ]
        });
        return {
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: +page,
            data: rows,
        };
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
                    monto: element.monto,
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
                    monto: element.monto,
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
                    monto: calcular,
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

            // Obtener la ruta del archivo de la factura
            const rutaArchivo = path.join(__dirname, `../public${factura.foto_factura}`);

            // Verificar si el archivo existe y eliminarlo
            if (fs.existsSync(rutaArchivo)) {
                fs.unlinkSync(rutaArchivo);
            }

            // Eliminar la factura de la base de datos
            await factura.destroy();

            return { message: 'Factura eliminada correctamente' };
        } catch (error) {
            // Manejo de errores
            throw new Error('Error al eliminar la factura');
        }
    }
}

module.exports = FacturaRepository;