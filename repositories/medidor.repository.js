const { Medidor,Suscripcion } = require('../models');

class MedidorRepository {
  async listarMedidores(page, limit) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Medidor.findAndCountAll({
      offset,
      limit: +limit,
    });
    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: +page,
      data: rows,
    };
  }

  async listarMedidoresDeUnUsuario(page, limit,suscripcionId) {
    let suscripcion = await Suscripcion.findByPk(suscripcionId);
    const offset = (page - 1) * limit;
    const { count, rows } = await Medidor.findAndCountAll({
      where:{
        usuarioId: suscripcion.usuarioid,
        servicioId: suscripcion.servicioid,
      },
      order: [
        ['fecha', 'DESC']
      ],
      offset,
      limit: +limit,
    });
    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: +page,
      data: rows,
    };
  }

  async crearMedidor(fecha, cantidad_medido, monto, mes, detalle, servicioId, usuarioId) {
    const medidor = await Medidor.create({
      fecha,
      cantidad_medido,
      monto,
      mes,
      detalle,
      servicioId,
      usuarioId,
    });
    return medidor;
  }

  async actualizarMedidor(id, fecha, cantidad_medido, monto, mes, detalle, servicioId, usuarioId) {
    const medidor = await Medidor.findByPk(id);
    if (!medidor) {
      throw new Error('Medidor no encontrado');
    }
    medidor.fecha = fecha;
    medidor.cantidad_medido = cantidad_medido;
    medidor.monto = monto;
    medidor.mes = mes;
    medidor.detalle = detalle;
    medidor.servicioId = servicioId;
    medidor.usuarioId = usuarioId;
    await medidor.save();
    return medidor;
  }

  async eliminarMedidor(id) {
    const medidor = await Medidor.findByPk(id);
    if (!medidor) {
      throw new Error('Medidor no encontrado');
    }
    await medidor.destroy();
  }

  async activarMedidor(id) {
    const medidor = await Medidor.findByPk(id);
    if (!medidor) {
      throw new Error('Medidor no encontrado');
    }
    medidor.estado = true;
    await medidor.save();
    return medidor;
  }

  async desactivarMedidor(id) {
    const medidor = await Medidor.findByPk(id);
    if (!medidor) {
      throw new Error('Medidor no encontrado');
    }
    medidor.estado = false;
    await medidor.save();
    return medidor;
  }
}

module.exports = MedidorRepository;