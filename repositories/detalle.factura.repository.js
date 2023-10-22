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
            for (let index = 0; index < deudas.length && monto > 0; index++) {
                const deuda = deudas[index];
                let isCancelado = monto >= (deuda.monto - deuda.monto_pago);
                let montoPago = 0;
                let montoDeuda = parseFloat(deuda.monto) - parseFloat(deuda.monto_pago);
                if(isCancelado){
                    montoPago = montoDeuda;
                    deuda.monto_pago = deuda.monto;
                    deuda.fecha_pago = new Date();
                    deuda.estado = DetalleUsuarioFactura.COMPLETADO;
                }else{
                    deuda.monto_pago += parseFloat(monto);
                    montoPago = parseFloat(monto);
                }
                let nameMes = nombresMeses[new Date(deuda.fecha).getMonth()];
                console.log("Deuda: "+deuda.monto+" Cancelado: "+isCancelado+" Monto que pago: "+montoPago+" Monto debe: "+ montoDeuda+" mes: "+nameMes);
                let detalleMovimiento = await DetalleMovimiento.create({
                    monto: montoPago,
                    fecha: new Date(),
                    detalleusuariofacturaid: deuda.id,
                    descripcion: "Pago de "+ deuda.Servicio.nombre+" de "+ nameMes,
                    movimientoid: movimiento.id
                },{transaction});
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