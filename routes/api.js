var express = require('express');
const { UsuarioController,ServicioController } = require('../controllers');

const router = express.Router();

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
module.exports = router;