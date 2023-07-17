const UsuarioController = require('./usuario_controller');
const ServicioController = require('./servicio_controller');
const SuscripcionController = require('./suscripcion_controller');
const FacturaController = require('./factura_controller');
const MedidorController = require('./medidor_controller');
const LoginController = require('./login_controller');
// Importa otros controladores según sea necesario

module.exports = {
  UsuarioController,
  ServicioController,
  SuscripcionController,
  FacturaController,
  MedidorController,
  LoginController
  // Exporta otros controladores según sea necesario
};