const FacturaRepository = require('../repositories/factura.repository');
const VeripagosInstanceRepository = require('../repositories/veripagos-instance.repository');
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
      const user = req.user;
      const factura = await facturaRepository.crearFactura(monto, fecha, foto, servicioid,user.id);

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
      const user = req.user;
      const detalle = await facturaRepository.registrarDetalleFactura(parseFloat(monto), detalle_factura_id,isprestado,user.id);
      console.log(detalle);
      if(detalle.facturaid != null ){
        await facturaRepository.verificarSiLaFacturaPagada(detalle.facturaid);
      }
      return res.json(ResponseHelper.success(detalle, "El pago fue registrado correctamente."));
    } catch (error) {
      console.log(error);
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
  },
  /*
    {
      "movimiento_id": 23066,
      "monto": 20,
      "detalle":"Codigo de pago 23066",
      "estado":"Completado",
      "data":[
          {
              "orderId": 5455,
              "description":"Recarga de la billetera: VeriPagos",
              "subscriptionId":null,
              "ProductsDetail":[
                  {
                      "ProductId": 14,
                      "Quantity": 1,
                      "UnitPrice": 20
                  }
              ]
          }
      ]
  }
  */
  async webhookVeripagos(req,res){
    let {movimiento_id, monto,detalle,estado, data} = req.body
    try {
      let veripagos = await VeripagosInstanceRepository.getVeripagosInstanceByMovimientoId(movimiento_id);
      console.log(veripagos);
      if(veripagos && veripagos.completado_en == null){
        let deudas = veripagos.DetalleVeripagos;
        for (let index = 0; index < deudas.length; index++) {
          const deuda = deudas[index];
          const detalle = await facturaRepository.registrarDetalleFactura(parseFloat(deuda.monto), deuda.deuda_usuario_factura_id,false );
          if(detalle.facturaid != null ){
            await facturaRepository.verificarSiLaFacturaPagada(detalle.facturaid);
          }
        }
        veripagos.estado = estado;
        await veripagos.save();
      }
      return res.json(ResponseHelper.success(veripagos, "El pago fue registrado correctamente."));
    } catch (error) {
      return res.json(ResponseHelper.error('Error al registrar el pago'));
    }
  }
};

module.exports = FacturaController;