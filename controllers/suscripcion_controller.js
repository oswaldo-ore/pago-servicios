const SuscripcionRepository = require('../repositories/suscripcion.repository');
const ResponseHelper = require('../utils/helper_response');

const suscripcionRepository = new SuscripcionRepository();

const SuscripcionController = {
  async listarSuscripciones(req, res) {
    try {
      const { page = 1, limit = 8 } = req.query;
      let suscripciones = await suscripcionRepository.listarPaginacion(page,limit);
      return res.json(ResponseHelper.success(suscripciones, ResponseHelper.listar('suscripciones')));
    } catch (error) {
      console.error('Error al listar los suscripciones:', error);
      return res.json(ResponseHelper.error(ResponseHelper.errorListar('suscripciones')));
    }
  },
  async crearSuscripcion(req, res) {
    try {
      const { usuarioid, servicioid, tipo, monto, tiene_medidor } = req.body;

      const suscripcion = await suscripcionRepository.crearSuscripcion(
        usuarioid,
        servicioid,
        tipo,
        monto,
        tiene_medidor
      );

      return res.status(201).json(ResponseHelper.success(suscripcion, ResponseHelper.created('suscripción')));
    } catch (error) {
      console.error('Error al crear la suscripción:', error);
      return res.json(ResponseHelper.error('Error al crear la suscripción'));
    }
  },

  async actualizarSuscripcion(req, res) {
    try {
      const { id } = req.params;
      const { usuarioid, servicioid, tipo, monto, tiene_medidor } = req.body;

      const suscripcion = await suscripcionRepository.actualizarSuscripcion(
        id,
        usuarioid,
        servicioid,
        tipo,
        monto,
        tiene_medidor
      );

      return res.json(ResponseHelper.success(suscripcion, ResponseHelper.updated('suscripción')));
    } catch (error) {
      console.error('Error al actualizar la suscripción:', error);
      return res.json(ResponseHelper.error('Error al actualizar la suscripción'));
    }
  },

  async eliminarSuscripcion(req, res) {
    try {
      const { id } = req.params;

      const suscripcion = await suscripcionRepository.eliminarSuscripcion(id);

      return res.json(ResponseHelper.success(suscripcion, ResponseHelper.deleted('suscripción')));
    } catch (error) {
      console.error('Error al eliminar la suscripción:', error);
      return res.json(ResponseHelper.error('Error al eliminar la suscripción'));
    }
  },

  async activarSuscripcion(req, res) {
    try {
      const { id } = req.params;

      const suscripcion = await suscripcionRepository.activarSuscripcion(id);

      return res.json(ResponseHelper.success(suscripcion, ResponseHelper.activated('suscripción')));
    } catch (error) {
      console.error('Error al activar la suscripción:', error);
      return res.json(ResponseHelper.error('Error al activar la suscripción'));
    }
  },

  async desactivarSuscripcion(req, res) {
    try {
      const { id } = req.params;

      const suscripcion = await suscripcionRepository.desactivarSuscripcion(id);

      return res.json(ResponseHelper.success(suscripcion, ResponseHelper.deactivated('suscripción')));
    } catch (error) {
      console.error('Error al desactivar la suscripción:', error);
      return res.json(ResponseHelper.error('Error al desactivar la suscripción'));
    }
  },
};

module.exports = SuscripcionController;