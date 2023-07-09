var express = require('express');
const { UsuarioController,ServicioController,SuscripcionController,FacturaController } = require('../controllers');

const router = express.Router();
const multer  = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
});

router.get('/usuarios/listar', UsuarioController.listarUsuarios);
router.post('/usuarios/crear', UsuarioController.crearUsuario);
router.put('/usuarios/:id', UsuarioController.actualizarUsuario);
router.delete('/usuarios/:id', UsuarioController.eliminarUsuario);
router.put('/usuarios/:id/activar', UsuarioController.activarUsuario);
router.put('/usuarios/:id/desactivar', UsuarioController.desactivarUsuario);

router.get('/servicios/listar', ServicioController.listarServicios);
router.post('/servicios/crear', ServicioController.crearServicio);
router.put('/servicios/:id', ServicioController.actualizarServicio);
router.delete('/servicios/:id', ServicioController.eliminarServicio);
router.put('/servicios/:id/activar', ServicioController.activarServicio);
router.put('/servicios/:id/desactivar', ServicioController.desactivarServicio);

router.post('/suscripciones/crear', SuscripcionController.crearSuscripcion);
router.put('/suscripciones/:id', SuscripcionController.actualizarSuscripcion);
router.delete('/suscripciones/:id', SuscripcionController.eliminarSuscripcion);
router.put('/suscripciones/:id/activar', SuscripcionController.activarSuscripcion);
router.put('/suscripciones/:id/desactivar', SuscripcionController.desactivarSuscripcion);

router.post('/facturas/crear', upload.single("foto"),  FacturaController.crearFactura);
module.exports = router;