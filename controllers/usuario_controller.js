const UsuarioRepository = require('../repositories/usuario.repository');
const DetalleUsuarioFacturaRepository = require('../repositories/detalle.factura.repository');
const ResponseHelper = require('../utils/helper_response');
const FacturaRepository = require('../repositories/factura.repository');
const apiWhatsappWeb = require('../adapter/whatsapp/api-whatsapp-web');
const ConfiguracionRepository = require('../repositories/configuracion.repository');
const VeripagosDeudaFacturaService = require('../services/veripagos-deuda-factura.service');

const usuarioRepository = new UsuarioRepository();
const detalleFactura = new DetalleUsuarioFacturaRepository();
const facturaRepository = new FacturaRepository();
let configuracionRepository = new ConfiguracionRepository();

const UsuarioController = {
  async listarUsuarios(req, res) {
    try {
        const { page = 1, limit = 8 } = req.query;
        const usuarios = await usuarioRepository.listarUsuarioConSuscripciones(page, limit);
        return res.json(ResponseHelper.success(usuarios,ResponseHelper.listar('usuarios')));
    } catch (error) {
      console.error('Error al listar los usuarios:', error);
      return res.json(ResponseHelper.error(ResponseHelper.errorListar('usuarios')));
    }
  },

  async listarTodosUsuarios(req, res) {
    try {
        const { page = 1, limit = 1000 } = req.query;
        const usuarios = await usuarioRepository.listarUsuarioConSuscripciones(page, limit);
        return res.json(ResponseHelper.success(usuarios.data,ResponseHelper.listar('usuarios')));
    } catch (error) {
      console.error('Error al listar los usuarios:', error);
      return res.json(ResponseHelper.error(ResponseHelper.errorListar('usuarios')));
    }
  },

  async crearUsuario(req, res) {
    try {
      const { nombre, apellidos,cod_pais="",telefono="" } = req.body;
      let configuracion = await configuracionRepository.getConfiguracionByAdminId(req.user.id);
      const usuario = await usuarioRepository.crearUsuario(
        nombre,
        apellidos,
        cod_pais,
        telefono,
        configuracion? configuracion.id : 1,
      );
      return res.status(201).json(ResponseHelper.success(usuario,ResponseHelper.created('usuario')));
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      return res.json(ResponseHelper.error('Error al crear el usuario'));
    }
  },

  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellidos,cod_pais="",telefono="" } = req.body;

      const usuario = await usuarioRepository.actualizarUsuario(
        id,
        nombre,
        apellidos,
        cod_pais,
        telefono
      );
      return res.json(ResponseHelper.success(usuario,ResponseHelper.updated('usuario')));
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      return res.json(ResponseHelper.error('Error al actualizar el usuario'));
    }
  },

  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioRepository.eliminarUsuario(id);
      return res.json(ResponseHelper.success(usuario,ResponseHelper.deleted('usuario')));
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      return res.json(ResponseHelper.error('Error al eliminar el usuario'));
    }
  },

  async activarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioRepository.activarUsuario(id);
      return res.json(ResponseHelper.success(usuario,ResponseHelper.activated('usuario')));
    } catch (error) {
      console.error('Error al activar el usuario:', error);
      return res.json(ResponseHelper.error('Error al activar el usuario'));
    }
  },

  async desactivarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioRepository.desactivarUsuario(id);
      return res.json(ResponseHelper.success(usuario,ResponseHelper.desactivated('usuario')));
    } catch (error) {
      console.error('Error al desactivar el usuario:', error);
      return res.json(ResponseHelper.error('Error al desactivar el usuario' ));
    }
  },

  async usuariosConSuscripciones(req,res){
    try {
      const usuario = await usuarioRepository.usuarioSuscripciones();
      return res.json(ResponseHelper.success(usuario,ResponseHelper.listar("Usuarios Con suscripciones") ));
    } catch (error) {
      console.error('Error al desactivar el usuario:', error);
      return res.json(ResponseHelper.error('Error al desactivar el usuario' ));
    }
  },

  async detallePagoDeUsuario(req,res){
    try {
      const {id}  = req.params;
      const deuda = await detalleFactura.deudasNoCanceladasDeUnUsuario(id);
      const canceladas = await detalleFactura.detallesDeUsuarioFacturaPagados(id);
      let data = {
        "deuda": deuda,
        "pagadas": canceladas
      }
      return res.json(ResponseHelper.success(data,ResponseHelper.listar("Usuarios Con suscripciones") ));
    } catch (error) {
      console.error('Error al listar el deudas:', error);
      return res.json(ResponseHelper.error('Error al listar las deudas' ));
    }
  },
  async pagarDeudaDelUsuario(req,res){
    try {
      const {id}  = req.params;
      const {monto,detalle = ""} = req.body;
      let movimiento = await detalleFactura.pagarDeudasNoCanceladasDeUnUsuario(id,monto,detalle);
      await facturaRepository.actualizarEstadoDeLasFacturas();
      return res.json(ResponseHelper.success(movimiento,ResponseHelper.listar("Deudas pagadas correctamente") ));
    } catch (error) {
      console.error('Error al listar el deudas:', error);
      return res.json(ResponseHelper.error('Error al pagar las deudas' ));
    }
  },
 
  async test(req,res){
    await usuarioRepository.notificarPorWhatsappLasDeudasPendientes();
    return res.json("hola");
  },

  async notifyDeudasToUser(req,res){
    try {
      let {id} = req.params;
      await VeripagosDeudaFacturaService.crearVeripagosInstanceAndSendQrByManyDetalleUsuarioFacturaByUserId(id);
      return res.json(ResponseHelper.success([],"Deudas enviadas correctamente."));
    } catch (error) {
      return res.json(ResponseHelper.error(error.message));
    }
  }
};


module.exports = UsuarioController;