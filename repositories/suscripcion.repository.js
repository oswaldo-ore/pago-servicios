const { Op, literal, fn } = require("sequelize");
const { Suscripcion, Servicio, Usuario, sequelize } = require("../models");
const moment = require("moment");
class SuscripcionRepository {
  async listarPaginacion(page, limit, search = "") {
    const offset = (page - 1) * limit;
    const { rows: suscripciones, count: total } =
      await Suscripcion.findAndCountAll({
        include: [
          {
            model: Servicio,
          },
          {
            model: Usuario,
          },
        ],
        offset,
        limit: +limit,
        //order by habilitado true primero false despues y por nombre DESC en node js sequelize
        order: [
          ["habilitado", "DESC"],
          [{ model: Usuario, as: 'Usuario' }, 'nombre', 'ASC'],
        ],
        where: {
          [Op.or]: [
            sequelize.where(
              sequelize.fn("concat", sequelize.col("Usuario.nombre"), " ", sequelize.col("Usuario.apellidos")),
              {
                [Op.like]: `%${search}%`,
              }
            ),
            sequelize.where(
              sequelize.fn("concat", sequelize.col("Servicio.nombre")),
              {
                [Op.like]: `%${search}%`,
              }
            ),
          ],
        },
    });
    // const count = await Suscripcion.count({
    //   lean: true,
    // });
    return {
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: +page,
      data: suscripciones,
    };
  }
  async crearSuscripcion(
    usuarioid,
    servicioid,
    tipo,
    monto,
    tiene_medidor,
    fecha_deuda
  ) {
    const suscripcion = await Suscripcion.create({
      usuarioid,
      servicioid,
      tipo,
      monto,
      tiene_medidor,
      fecha_deuda,
    });
    return suscripcion;
  }

  async actualizarSuscripcion(
    id,
    usuarioid,
    servicioid,
    tipo,
    monto,
    tiene_medidor,
    fecha_deuda
  ) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) {
      throw new Error("Suscripción no encontrada");
    }
    suscripcion.usuarioid = usuarioid;
    suscripcion.servicioid = servicioid;
    suscripcion.tipo = tipo;
    suscripcion.monto = monto;
    suscripcion.tiene_medidor = tiene_medidor;
    suscripcion.fecha_deuda = fecha_deuda;
    await suscripcion.save();
    return suscripcion;
  }

  async eliminarSuscripcion(id) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) {
      throw new Error("Suscripción no encontrada");
    }
    await suscripcion.destroy();
    return { message: "Suscripción eliminada correctamente" };
  }

  async activarSuscripcion(id) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) {
      throw new Error("Suscripción no encontrada");
    }
    suscripcion.habilitado = true;
    await suscripcion.save();
    return suscripcion;
  }

  async desactivarSuscripcion(id) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) {
      throw new Error("Suscripción no encontrada");
    }
    suscripcion.habilitado = false;
    await suscripcion.save();
    return suscripcion;
  }

  static async getUserWithSubscriptionAutomatic(
    day
  ) {
    const subscriptions = await Suscripcion.findAll({
      include:[
        {
          model: Servicio,
        },
        {
          model: Usuario,
        },
      ],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('DAY', sequelize.col('fecha_deuda')),
            day
          )
        ],
        tipo: "automatico",
      },
    });
    return subscriptions;
  }

  static async getSubscriptionByUserAndService(usuarioId, servicioId) {
    const subscription = await Suscripcion.findOne({
      include: [
        {
          model: Usuario,
          where: {
            id: usuarioId,
            estado: true,
          },
        },
      ],
      where: {
        usuarioid: usuarioId,
        servicioid: servicioId,
      },
    });
    return subscription;
  }
}

module.exports = SuscripcionRepository;
