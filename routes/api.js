var express = require('express');
const jwtMiddleware = require('../middleware/jwt_json');
const { 
    UsuarioController,
    ServicioController,
    SuscripcionController,
    FacturaController,
    MedidorController,
    LoginController,
    WhatsappController,
    ConfiguracionController
} = require('../controllers');

const router = express.Router();
const multer  = require('multer');
const DeudaMensualController = require('../controllers/deuda_mensual_controller');
const upload = multer({
    storage: multer.memoryStorage(),
});

router.post('/session/enviarmensaje', WhatsappController.enviarMensaje);
router.post('/facturaactualizarfacturas', WhatsappController.actualizarFacturas);
router.get('/test', UsuarioController.test);
router.post('/test2', DeudaMensualController.generarDeudaMensuales);
router.get('/test3', DeudaMensualController.getAllDeudasMensuales);
router.post('/admin/login',LoginController.loginAdmin);

router.use(jwtMiddleware);
router.post('/admin/logout',LoginController.logoutAdmin);
router.get('/usuarios/listar', UsuarioController.listarUsuarios);
router.get('/usuarios/listar-todo', UsuarioController.listarTodosUsuarios);
router.post('/usuarios/crear', UsuarioController.crearUsuario);
router.put('/usuarios/:id', UsuarioController.actualizarUsuario);
router.delete('/usuarios/:id', UsuarioController.eliminarUsuario);
router.put('/usuarios/:id/activar', UsuarioController.activarUsuario);
router.put('/usuarios/:id/desactivar', UsuarioController.desactivarUsuario);
router.get('/usuarios/suscripciones', UsuarioController.usuariosConSuscripciones);
router.get('/usuarios/:id/deudas', UsuarioController.detallePagoDeUsuario);
router.post('/usuarios/:id/pagar', UsuarioController.pagarDeudaDelUsuario);

router.get('/servicios/listar', ServicioController.listarServicios);
router.get('/servicios/listar-todo', ServicioController.listarTodosServicios);
router.post('/servicios/crear', ServicioController.crearServicio);
router.put('/servicios/:id', ServicioController.actualizarServicio);
router.delete('/servicios/:id', ServicioController.eliminarServicio);
router.put('/servicios/:id/activar', ServicioController.activarServicio);
router.put('/servicios/:id/desactivar', ServicioController.desactivarServicio);

router.post('/medidores/crear', MedidorController.crearMedidor);

router.get('/suscripciones/listar',SuscripcionController.listarSuscripciones);
router.post('/suscripciones/crear', SuscripcionController.crearSuscripcion);
router.put('/suscripciones/:id', SuscripcionController.actualizarSuscripcion);
router.delete('/suscripciones/:id', SuscripcionController.eliminarSuscripcion);
router.put('/suscripciones/:id/activar', SuscripcionController.activarSuscripcion);
router.put('/suscripciones/:id/desactivar', SuscripcionController.desactivarSuscripcion);
router.get('/suscripciones/medidores/:id', MedidorController.listarMedidoresDeUnCliente);

router.post('/facturas/crear', upload.single("foto"),  FacturaController.crearFactura);
router.get('/facturas/listar', FacturaController.listaFacturaConDetalle);
router.delete('/facturas/:id', FacturaController.eliminarFactura);
router.get('/factura/:id', FacturaController.showFactura);
router.put('/factura/:id/estado-prestado', FacturaController.cambiarEstadoPrestado);

router.post("/detalle/factura/pagar",FacturaController.pagarFactura);
router.post("/detalle/factura/devolver",FacturaController.devolverPrestamoDelPago);

router.get('/deudas-mensuales', DeudaMensualController.getAllDeudasMensuales);
router.get('/configuracion', ConfiguracionController.getConfiguracion);
router.post('/configuracion/getCodigoQr', ConfiguracionController.generarCodigoQr);
router.post('/configuracion/verificarQr', ConfiguracionController.verificarConexion);
router.post('/configuracion/desconectar', ConfiguracionController.desconectarNroWhatsapp);


module.exports = router;