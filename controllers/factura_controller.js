const FacturaRepository = require('../repositories/factura.repository');
const ResponseHelper = require('../utils/helper_response');
const facturaRepository = new FacturaRepository();

const FacturaController = {

  async listaFacturaConDetalle(req, res) {
    const { page = 1, limit = 8 } = req.query;
    const facturas = await facturaRepository.listarFacturas(page,limit);

    return res.json(ResponseHelper.success(facturas, 'Factura listado correctamente'));
  },
  async crearFactura(req, res) {
    try {
      const { monto, fecha, servicioid } = req.body;
      const foto = req.file;
      const factura = await facturaRepository.crearFactura(monto, fecha, foto, servicioid);

      return res.status(201).json(ResponseHelper.success(factura, ResponseHelper.created('factura')));
    } catch (error) {
      console.error('Error al crear la factura:', error.message);
      return res.json(ResponseHelper.error(error.message));
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

  async showFactura(req, res) {
    const { id } = req.params;
    const factura = await facturaRepository.verFactura(id);
    return res.json(ResponseHelper.success(factura, 'Factura listado correctamente'));
  },

  async cambiarEstadoPrestado(req, res) {
    const { id } = req.params;
    const factura = await facturaRepository.cambiarEstadoFacturaACanceladoPrestamo(id);
    return res.json(ResponseHelper.success(factura, 'Factura listado correctamente'));
  },

  async pagarFactura(req, res) {
    try {
      const { monto, detalle_factura_id, isprestado } = req.body;
      const detalle = await facturaRepository.registrarDetalleFactura(parseFloat(monto), detalle_factura_id,isprestado);
      await facturaRepository.verificarSiLaFacturaPagada(detalle.facturaid);
      return res.json(ResponseHelper.success(detalle, "El pago fue registrado correctamente."));
    } catch (error) {
      return res.json(ResponseHelper.error('Error al registrar el pago' + error));
    }
  },

  async devolverPrestamoDelPago(req,res){
    
    try {
      const { detalle_factura_id } = req.body;
      const detalle = await facturaRepository.devolverPrestamoDelPago(parseFloat(detalle_factura_id));
      return res.json(ResponseHelper.success(detalle, "La devolucion del pago fue registrado correctamente."));
    } catch (error) {
      return res.json(ResponseHelper.error('Error al registrar la devolucion' + error));
    }
  }
};

module.exports = FacturaController;