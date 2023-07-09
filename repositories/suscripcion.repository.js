const { Suscripcion } = require('../models');

class SuscripcionRepository {
  async crearSuscripcion(usuarioid, servicioid, tipo, monto, tiene_medidor) {
    const suscripcion = await Suscripcion.create({
      usuarioid,
      servicioid,
      tipo,
      monto,
      tiene_medidor,
    });
    return suscripcion;
  }

  async actualizarSuscripcion(id, usuarioid, servicioid, tipo, monto, tiene_medidor) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) {
      throw new Error('Suscripción no encontrada');
    }
    suscripcion.usuarioid = usuarioid;
    suscripcion.servicioid = servicioid;
    suscripcion.tipo = tipo;
    suscripcion.monto = monto;
    suscripcion.tiene_medidor = tiene_medidor;
    await suscripcion.save();
    return suscripcion;
  }

  async eliminarSuscripcion(id) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) {
      throw new Error('Suscripción no encontrada');
    }
    await suscripcion.destroy();
    return { message: 'Suscripción eliminada correctamente' };
  }

  async activarSuscripcion(id) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) {
      throw new Error('Suscripción no encontrada');
    }
    suscripcion.habilitado = true;
    await suscripcion.save();
    return suscripcion;
  }

  async desactivarSuscripcion(id) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) {
      throw new Error('Suscripción no encontrada');
    }
    suscripcion.habilitado = false;
    await suscripcion.save();
    return suscripcion;
  }
}

module.exports = SuscripcionRepository;