const { Usuario, Suscripcion, Servicio  } = require('../models');

class UsuarioRepository {
  async listarUsuarios(page, limit) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Usuario.findAndCountAll({
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

  async listarUsuarioConSuscripciones(page, limit) {
    const offset = (page - 1) * limit;

    const usuarios = await Usuario.findAll({
      include: [
        {
          model: Servicio,
        },
      ],
      offset,
      limit,
    });

    return usuarios;
  }

  async crearUsuario(nombre, apellidos) {
    const usuario = await Usuario.create({
      nombre,
      apellidos,
      estado: true,
    });
    return usuario;
  }

  async actualizarUsuario(id, nombre, apellidos) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.nombre = nombre;
    usuario.apellidos = apellidos;
    await usuario.save();
    return usuario;
  }

  async eliminarUsuario(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    await usuario.destroy();
    return { message: 'Usuario eliminado correctamente' };
  }

  async activarUsuario(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.estado = true;
    await usuario.save();
    return usuario;
  }

  async desactivarUsuario(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.estado = false;
    await usuario.save();
    return usuario;
  }
}

module.exports = UsuarioRepository;