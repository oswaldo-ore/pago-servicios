const { Sequelize, Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class DetailPrePayment extends Model {
        static associate(models) {
            DetailPrePayment.belongsTo(models.PrePayment, {
                foreignKey: "pre_payment_id",
            });
            DetailPrePayment.belongsTo(models.DetalleUsuarioFactura, {
                foreignKey: "detail_user_invoice_id",
            });
        }

    }

    DetailPrePayment.init(
        {
            pre_payment_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "pre_payments",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            detail_user_invoice_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "detalles_usuario_factura",
                    key: "id",
                },
            },
            amount: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            }
        },
        {
            sequelize,
            modelName: "DetailPrePayment",
            tableName: "details_pre_payment",
            timestamps: true,
            paranoid: true,
            defaultScope: {
                attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
            },
        }
    );
    return DetailPrePayment;
};
