const {
    Factura,
    DetalleUsuarioFactura,
    Usuario,
    Servicio,
} = require('../models');
const { sequelize } = require('sequelize');
const { Op } = require('sequelize');
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
            }
        });
        return detallesPrestadosNoCancelados;
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
            }
        });
        return detallesPagados;
    }
}

module.exports = DetalleUsuarioFacturaRepository;