const FacturaRepository = require('../repositories/factura.repository');
const ResponseHelper = require('../utils/helper_response');
const facturaRepository = new FacturaRepository();

const FacturaController = {
  async crearFactura(req, res) {
    try {
      const { monto, fecha,servicioid } = req.body;
      const foto  = req.file;
      const factura = await facturaRepository.crearFactura(monto, fecha, foto,servicioid);

      return res.status(201).json(ResponseHelper.success(factura, ResponseHelper.created('factura')));
    } catch (error) {
      console.error('Error al crear la factura:', error);
      return res.json(ResponseHelper.error('Error al crear la factura'));
    }
  },

  async eliminarFactura(req, res) {
    try {
      const { id } = req.params;

      const factura = await facturaRepository.eliminarFactura(id);

      return res.json(ResponseHelper.success(factura, ResponseHelper.deleted('factura')));
    } catch (error) {
      console.error('Error al eliminar la factura:', error);
      return res.json(ResponseHelper.error('Error al eliminar la factura'));
    }
  },
};

module.exports = FacturaController;