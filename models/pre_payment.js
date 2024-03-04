const { Sequelize, Model } = require("sequelize");

module.exports  = (sequelize, DataTypes) => {
    class PrePayment extends Model {
        static associate(models) {
            PrePayment.belongsTo(models.Usuario, { foreignKey: 'user_id' });
        }
        toJSON() {
            return {
              ...this.get(),
              createdAt: undefined,
              updatedAt: undefined,
              deletedAt: undefined
            };
          }
    }
    PrePayment.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "usuarios",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        available_amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Adelanto de pago.",
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        state: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "0: Adelantado, 1: parcialmente, 2: pagado",
        },
    }, {
        sequelize,
        modelName: "PrePayment",
        tableName: "pre_payments",
        timestamps: true,
        paranoid: true,
    });
    return PrePayment;
}