const {Movimiento,DetalleMovimiento} = require('../models');
const { sequelize } = require('../models');
class MovimientoRepository{

    static async  crearMovimientoConUnDetalle(monto,usuarioId,descripcion,detalleFacturaId,saldo_anterior=0,a_cuenta=0) {
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
}

module.exports = MovimientoRepository;