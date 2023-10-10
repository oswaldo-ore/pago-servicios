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

    async pagarDeudasNoCanceladasDeUnUsuario(usuarioId,monto) {
        const transaction = await sequelize.transaction();
        try {
            let deudas = await this.deudasNoCanceladasDeUnUsuario(usuarioId);
            let movimiento = await Movimiento.create({
                monto: monto,
                fecha: new Date(),
                usuarioid: usuarioId,
                descripcion: "Pago del servicio",
                saldo_anterior: 0,
                a_cuenta: 0
            },{ transaction});
            for (let index = 0; index < deudas.length; index++) {
                const deuda = deudas[index];
                if(monto > 0){
                    let isCancelado = monto >= deuda.monto;
                    let detalleMovimiento = await DetalleMovimiento.create({
                        monto: deuda.monto,
                        fecha: new Date(),
                        detalleusuariofacturaid: deuda.id,
                        descripcion: "Pago del detalle de la deuda de la fecha "+deuda.fecha,
                        movimientoid: movimiento.id
                    },{transaction});
                    if(isCancelado){
                        deuda.monto_pago = deuda.monto;
                        deuda.estado = DetalleUsuarioFactura.COMPLETADO;
                    }else{
                        deuda.monto_pago = monto;
                    }
                    await deuda.save({ transaction: transaction });
                    monto = monto - deuda.monto;
                }else{
                    break;
                }
            }
            if(monto > 0){
                movimiento.a_cuenta = monto;
                await movimiento.save({ transaction: transaction });
            }   
            await transaction.commit();
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
            }
        });
        return detallesPagados;
    }
}

module.exports = DetalleUsuarioFacturaRepository;