const ServicioRepository = require('../repositories/servicio.repository');
const ResponseHelper = require('../utils/helper_response');

const servicioRepository = new ServicioRepository();

const ServicioController = {
  async listarServicios(req, res) {
    try {
      const { page = 1, limit = 2 } = req.query;
      const servicios = await servicioRepository.listarServicios(page, limit);
      return res.json(ResponseHelper.success(servicios, ResponseHelper.listar('servicios')));
    } catch (error) {
      console.error('Error al listar los servicios:', error);
      return res.json(ResponseHelper.error(ResponseHelper.errorListar('servicios')));
    }
  },

  async listarTodosServicios(req, res) {
    try {
      const { page = 1, limit = 1000 } = req.query;
      const servicios = await servicioRepository.listarServicios(page, limit);
      return res.json(ResponseHelper.success(servicios.data, ResponseHelper.listar('servicios')));
    } catch (error) {
      console.error('Error al listar los servicios:', error);
      return res.json(ResponseHelper.error(ResponseHelper.errorListar('servicios')));
    }
  },

  async crearServicio(req, res) {
    try {
      const { nombre, asociar } = req.body;
      const servicio = await servicioRepository.crearServicio(nombre, asociar);
      return res.status(201).json(ResponseHelper.success(servicio, ResponseHelper.created('servicio')));
    } catch (error) {
      console.error('Error al crear el servicio:', error);
      return res.json(ResponseHelper.error('Error al crear el servicio'));
    }
  },

  async actualizarServicio(req, res) {
    try {
      const { id } = req.params;
      const { nombre, asociar } = req.body;
      const servicio = await servicioRepository.actualizarServicio(id, nombre, asociar);
      return res.json(ResponseHelper.success(servicio, ResponseHelper.updated('servicio')));
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      return res.json(ResponseHelper.error('Error al actualizar el servicio'));
    }
  },

  async eliminarServicio(req, res) {
    try {
      const { id } = req.params;
      const servicio = await servicioRepository.eliminarServicio(id);
      return res.json(ResponseHelper.success(servicio, ResponseHelper.deleted('servicio')));
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      return res.json(ResponseHelper.error('Error al eliminar el servicio'));
    }
  },

  async activarServicio(req, res) {
    try {
      const { id } = req.params;
      const servicio = await servicioRepository.activarServicio(id);
      return res.json(ResponseHelper.success(servicio, ResponseHelper.activated('servicio')));
    } catch (error) {
      console.error('Error al activar el servicio:', error);
      return res.json(ResponseHelper.error('Error al activar el servicio'));
    }
  },

  async desactivarServicio(req, res) {
    try {
      const { id } = req.params;
      const servicio = await servicioRepository.desactivarServicio(id);
      return res.json(ResponseHelper.success(servicio, ResponseHelper.deactivated('servicio')));
    } catch (error) {
      console.error('Error al desactivar el servicio:', error);
      return res.json(ResponseHelper.error('Error al desactivar el servicio'));
    }
  },
};

module.exports = ServicioController;