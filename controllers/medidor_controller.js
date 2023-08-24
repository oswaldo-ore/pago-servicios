const MedidorRepository = require('../repositories/medidor.repository');
const ResponseHelper = require('../utils/helper_response');

const medidorRepository = new MedidorRepository();

const MedidorController = {
  async listarMedidores(req, res) {
    try {
      const { page = 1, limit = 8 } = req.query;
      const medidores = await medidorRepository.listarMedidores(page, limit);
      return res.json(ResponseHelper.success(medidores, 'Medidores listados correctamente'));
    } catch (error) {
      console.error('Error al listar los medidores:', error);
      return res.json(ResponseHelper.error('Error al listar los medidores'));
    }
  },

  async listarMedidoresDeUnCliente(req, res) {
    try {
      const { page = 1, limit = 8,id } = req.query;
      const medidores = await medidorRepository.listarMedidoresDeUnUsuario(page, limit,id);
      return res.json(ResponseHelper.success(medidores, 'Medidores listados correctamente'));
    } catch (error) {
      console.error('Error al listar los medidores:', error);
      return res.json(ResponseHelper.error('Error al listar los medidores'));
    }
  },

  async crearMedidor(req, res) {
    try {
      const { fecha, cantidad_medido, monto, mes, detalle, servicioId, usuarioId } = req.body;
      const medidor = await medidorRepository.crearMedidor(fecha, cantidad_medido, monto, mes, detalle, servicioId, usuarioId);
      return res.status(201).json(ResponseHelper.success(medidor, 'Medidor creado correctamente'));
    } catch (error) {
      console.error('Error al crear el medidor:', error);
      return res.json(ResponseHelper.error('Error al crear el medidor'));
    }
  },

  async actualizarMedidor(req, res) {
    try {
      const { id } = req.params;
      const { fecha, cantidad_medido, monto, mes, detalle, servicioId, usuarioId } = req.body;
      const medidor = await medidorRepository.actualizarMedidor(id, fecha, cantidad_medido, monto, mes, detalle, servicioId, usuarioId);
      return res.json(ResponseHelper.success(medidor, 'Medidor actualizado correctamente'));
    } catch (error) {
      console.error('Error al actualizar el medidor:', error);
      return res.json(ResponseHelper.error('Error al actualizar el medidor'));
    }
  },

  async eliminarMedidor(req, res) {
    try {
      const { id } = req.params;
      await medidorRepository.eliminarMedidor(id);
      return res.json(ResponseHelper.success(null, 'Medidor eliminado correctamente'));
    } catch (error) {
      console.error('Error al eliminar el medidor:', error);
      return res.json(ResponseHelper.error('Error al eliminar el medidor'));
    }
  },

  async activarMedidor(req, res) {
    try {
      const { id } = req.params;
      const medidor = await medidorRepository.activarMedidor(id);
      return res.json(ResponseHelper.success(medidor, 'Medidor activado correctamente'));
    } catch (error) {
      console.error('Error al activar el medidor:', error);
      return res.json(ResponseHelper.error('Error al activar el medidor'));
    }
  },

  async desactivarMedidor(req, res) {
    try {
      const { id } = req.params;
      const medidor = await medidorRepository.desactivarMedidor(id);
      return res.json(ResponseHelper.success(medidor, 'Medidor desactivado correctamente'));
    } catch (error) {
      console.error('Error al desactivar el medidor:', error);
      return res.json(ResponseHelper.error('Error al desactivar el medidor'));
    }
  },
};

module.exports = MedidorController;