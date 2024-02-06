const { VeripagosInstance, DetalleVeripagos } = require("../models");

class VeripagosInstanceRepository {
    static async createVeripagosInstanceWithDetalle(
        movimientoId = null,
        monto,
        estado,
        deudas
    ) {
        let transaction;
        try {
            transaction = await VeripagosInstance.sequelize.transaction();
            const veripagosInstance = await VeripagosInstance.create(
                {
                    movimiento_id: movimientoId,
                    monto: monto,
                    descripcion: "Pago de deuda",
                    estado: estado,
                },
                { transaction }
            );
            const detalleVeripagosPromises = deudas.map(async (deuda) => {
                return DetalleVeripagos.create(
                    {
                        monto: deuda.monto,
                        mes: deuda.fecha,
                        deuda_usuario_factura_id: deuda.id,
                        veripagos_instance_id: veripagosInstance.id,
                    },
                    { transaction }
                );
            });
            let detalle = await Promise.all(detalleVeripagosPromises);
            await transaction.commit();
            return { veripagosInstance, detalle };
        } catch (error) {
            // Revertir la transacción en caso de error
            if (transaction) {
                await transaction.rollback();
            }
            console.error(
                "Error al crear instancia de Veripagos con Detalle:",
                error
            );
            throw error;
        }
    }

    static async getVeripagosInstanceById(id) {
        return VeripagosInstance.findByPk(id, {
            include: [
                {
                    model: DetalleVeripagos,
                    as: "DetalleVeripagos",
                },
            ],
        });
    }

    static async getVeripagosInstanceByMovimientoId(movimientoId) {
        return await VeripagosInstance.findOne({
            where: {
                movimiento_id: movimientoId,
            },
            include: [
                {
                    model: DetalleVeripagos,
                    as: "DetalleVeripagos",
                },
            ],
        });
    }
}

module.exports = VeripagosInstanceRepository;
