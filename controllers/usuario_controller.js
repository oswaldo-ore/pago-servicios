const UsuarioRepository = require('../repositories/usuario.repository');
const ResponseHelper = require('../utils/helper_response');

const usuarioRepository = new UsuarioRepository();

const UsuarioController = {
  async listarUsuarios(req, res) {
    try {
        const { page = 1, limit = 8 } = req.query;
        const usuarios = await usuarioRepository.listarUsuarioConSuscripciones(page, limit);
        return res.json(ResponseHelper.success(usuarios,ResponseHelper.listar('usuarios')));
    } catch (error) {
      console.error('Error al listar los usuarios:', error);
      return res.json(ResponseHelper.error(ResponseHelper.errorListar('usuarios')));
    }
  },

  async crearUsuario(req, res) {
    try {
      const { nombre, apellidos } = req.body;

      const usuario = await usuarioRepository.crearUsuario(
        nombre,
        apellidos
      );
      return res.status(201).json(ResponseHelper.success(usuario,ResponseHelper.created('usuario')));
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      return res.json(ResponseHelper.error('Error al crear el usuario'));
    }
  },

  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellidos } = req.body;

      const usuario = await usuarioRepository.actualizarUsuario(
        id,
        nombre,
        apellidos,
      );
      return res.json(ResponseHelper.success(usuario,ResponseHelper.updated('usuario')));
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      return res.json(ResponseHelper.error('Error al actualizar el usuario'));
    }
  },

  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioRepository.eliminarUsuario(id);
      return res.json(ResponseHelper.success(usuario,ResponseHelper.deleted('usuario')));
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      return res.json(ResponseHelper.error('Error al eliminar el usuario'));
    }
  },

  async activarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioRepository.activarUsuario(id);
      return res.json(ResponseHelper.success(usuario,ResponseHelper.activated('usuario')));
    } catch (error) {
      console.error('Error al activar el usuario:', error);
      return res.json(ResponseHelper.error('Error al activar el usuario'));
    }
  },

  async desactivarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioRepository.desactivarUsuario(id);
      return res.json(ResponseHelper.success(usuario,ResponseHelper.desactivated('usuario')));
    } catch (error) {
      console.error('Error al desactivar el usuario:', error);
      return res.json(ResponseHelper.error('Error al desactivar el usuario' ));
    }
  },
};

module.exports = UsuarioController;