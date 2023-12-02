const DeudaMensualRepository = require('../repositories/deuda.mensual.repository');
const ResponseHelper = require('../utils/helper_response');
const moment = require('moment');
const deudaMensualRepository = new DeudaMensualRepository();

const DeudaMensualController = {

  async generarDeudaMensuales(req, res) {
    try {
      let { fecha } = req.body;
      const facturas = await deudaMensualRepository.crearDeudaDelUsuario(fecha);
      return res.json(ResponseHelper.success(facturas, 'Se ha registrados las deudas del mes del usuario.'));
    } catch (error) {
      return res.json(ResponseHelper.error(error.message));
    }
  },

  async getAllDeudasMensuales(req, res) {
    let { date = moment().format('YYYY-MM') ,pageNumber = 1,limit = 8 } = req.query;
    const facturas = await deudaMensualRepository.getDeudasMensuales(date,pageNumber,limit);
    return res.json(ResponseHelper.success(facturas, 'Listado de deuda mensuales correctamente'));
  },
};

module.exports = DeudaMensualController;