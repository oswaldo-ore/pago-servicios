const { Movimiento, DetalleMovimiento, DetalleUsuarioFactura, Servicio } = require('../models');
const { sequelize } = require('../models');
class MovimientoRepository {

    static async crearMovimientoConUnDetalle(monto, usuarioId, descripcion, detalleFacturaId, saldo_anterior = 0, a_cuenta = 0) {
        const transaction = await sequelize.transaction();
        let movimiento = await Movimiento.create({
            monto: monto,
            fecha: new Date(),
            usuarioid: usuarioId,
            descripcion: descripcion,
            saldo_anterior: saldo_anterior,
            a_cuenta: a_cuenta
        });

        let detalle = await DetalleMovimiento.create({
            monto: monto,
            fecha: new Date(),
            detalleusuariofacturaid: detalleFacturaId,
            descripcion: descripcion,
        });
        await transaction.commit();
        return {
            movimiento: movimiento,
            detalle: detalle,
        }
    }

    static async getMovementsByUserId(userId){
    return await Movimiento.findAll({
            include: [
                {
                    model: DetalleMovimiento,
                    as: 'DetallesMovimiento',
                    include: [
                        {
                            model: DetalleUsuarioFactura,
                            as: 'DetalleUsuarioFactura',
                            include: [
                                {
                                    model: Servicio,
                                    as: 'Servicio'
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [
                ['fecha', 'DESC']
            ],
            where: {
                usuarioid: userId
            }
        });
    }

    static async getMovementsByUserIdWithPaginate(userId, page , limit) {
        const offset = (page - 1) * limit;
        const { rows,count } = await Movimiento.findAndCountAll({
            include: [
                {
                    model: DetalleMovimiento,
                    as: 'DetallesMovimiento',
                    include: [
                        {
                            model: DetalleUsuarioFactura,
                            as: 'DetalleUsuarioFactura',
                            include: [
                                {
                                    model: Servicio,
                                    as: 'Servicio'
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [
                ['fecha', 'DESC']
            ],
            offset,
            limit: +limit,
            where: {
                usuarioid: userId
            }
        });
        const total = await Movimiento.count({
            lean: true,
            where: {
                usuarioid: userId,
            }
        });
        return {
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: +page,
            data: rows,
        };
    }
}

module.exports = MovimientoRepository;