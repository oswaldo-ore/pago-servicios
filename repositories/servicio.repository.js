const { Servicio } = require('../models');

class ServicioRepository {
  async listarServicios(page, limit) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Servicio.findAndCountAll({
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

  async crearServicio(nombre, asociar) {
    console.log(asociar);
    let asociarId = (asociar != "" ? asociar  : null);
    console.log(asociar,asociarId);
    const servicio = await Servicio.create({
      nombre,
      estado: true,
      asociar:asociarId,
    });
    return servicio;
  }

  async actualizarServicio(id, nombre, asociar) {
    const servicio = await Servicio.findByPk(id);
    let asociarId = (asociar === "" ? null : asociar);
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }
    servicio.nombre = nombre;
    servicio.asociar = asociarId;
    await servicio.save();
    return servicio;
  }

  async eliminarServicio(id) {
    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }
    await servicio.destroy();
    return { message: 'Servicio eliminado correctamente' };
  }

  async activarServicio(id) {
    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }
    servicio.estado = true;
    await servicio.save();
    return servicio;
  }

  async desactivarServicio(id) {
    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }
    servicio.estado = false;
    await servicio.save();
    return servicio;
  }
}

module.exports = ServicioRepository;