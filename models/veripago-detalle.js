"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DetalleVeripagos extends Model {
    static associate(models) {
      // Asociaciones aquí, si es necesario
      DetalleVeripagos.belongsTo(models.DetalleUsuarioFactura, {
        foreignKey: "deuda_usuario_factura_id",
      });

      DetalleVeripagos.belongsTo(models.VeripagosInstance, {
        foreignKey: "veripagos_instance_id",
      });
    }
  }

  DetalleVeripagos.init(
    {
      monto: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      mes: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deuda_usuario_factura_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "detalles_usuario_factura",
          key: "id",
        },
      },
      veripagos_instance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "veripagos_instance",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "DetalleVeripagos",
      tableName: "detalle_veripagos",
      paranoid: true, // Para activar el soft delete
    }
  );

  return DetalleVeripagos;
};
