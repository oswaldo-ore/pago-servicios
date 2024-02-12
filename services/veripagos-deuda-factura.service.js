const DetalleUsuarioFacturaRepository = require("../repositories/detalle.factura.repository");
const ConfiguracionRepository = require("../repositories/configuracion.repository");
const VeripagosAPI = require("../adapter/veripagos/veripagos-api");
const VeripagosInstanceRepository = require("../repositories/veripagos-instance.repository");
const { DetalleUsuarioFactura } = require("../models");
const apiWhatsappWeb = require("../adapter/whatsapp/api-whatsapp-web");
const UsuarioRepository = require("../repositories/usuario.repository");
const configuracionRepository = new ConfiguracionRepository();
const usuarioRepository = new UsuarioRepository();
const detalleUsuarioFacturaRepository = new DetalleUsuarioFacturaRepository();

class VeripagosDeudaFacturaService {
  static async crearVeripagosInstanceAndSendQrBySingleDetalleUsuarioFactura(
    detalleUsuarioFacturaId
  ) {
    let detalleUsuarioFactura =
      await detalleUsuarioFacturaRepository.getDetalleUsuarioFacturaById(
        detalleUsuarioFacturaId
      );
    if (detalleUsuarioFactura.estado == DetalleUsuarioFactura.COMPLETADO) {
      throw new Error("La factura ya fue completada");
    }
    //analizar la base de datos para sacar los datos del usuario

    let { result, setting } =
      await VeripagosDeudaFacturaService.crearVeripagosInstanceAndQr(
        1,
        detalleUsuarioFactura.monto,
        [detalleUsuarioFactura]
      );

    await apiWhatsappWeb.enviarMensajeTextoWithFile(
      "59162008498",
      "Ahora puedes pagar tu servicio por el QR.",
      setting.instancia_id,
      result.Data.qr,
      "Qr.png"
    );
    return result;
  }

  static async crearVeripagosInstanceAndQr(userId = 1, monto, detallesDeuda) {
    let setting = await configuracionRepository.getConfiguracionByAdminId(
      userId
    );
    let veripagosApi = new VeripagosAPI(
      setting.veripagos_username,
      setting.veripagos_password,
      setting.veripagos_secret_key
    );
    let { veripagosInstance, detalle } =
      await VeripagosInstanceRepository.createVeripagosInstanceWithDetalle(
        null,
        monto,
        "Pendiente",
        detallesDeuda
      );
    let result = await veripagosApi.generarQR(
      monto,
      [veripagosInstance],
      "1/00:00",
      "Get Pay Family"
    );
    veripagosInstance.movimiento_id = result.Data.movimiento_id;
    await veripagosInstance.save();
    return { veripagosInstance, result, setting };
  }

  static async crearVeripagosInstanceAndSendQrByManyDetalleUsuarioFactura() {
    let users = await usuarioRepository.getUserConFacturasNoPagadas();
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      if (user.cod_pais != "" && user.telefono != "") {
        let message = user.nombre + " " + user.apellidos + "\r\n";
        message += "*Tienes deudas pendientes.*" + "\r\n\r\n";
        let montoTotal = 0;
        user.DetalleUsuarioFactura.forEach((detalle) => {
          message += `*Servicio:* ${detalle.Servicio.nombre}\r\n`;
          message += `*Fecha:* ${detalle.getFechaFormateada()}\r\n`;
          message += `*Monto:* Bs. ${detalle.monto.toFixed(2)}\r\n`;
          message += `*Pago:* Bs. ${detalle.monto_pago.toFixed(2)}\r\n`;
          message += `*Debe:* Bs. ${(
            detalle.monto - detalle.monto_pago
          ).toFixed(2)}\r\n`;
          message += `-------------------------------------\r\n\r\n`;
          let saldo = detalle.monto - detalle.monto_pago;
          montoTotal += saldo < 0 ? 0 : saldo;
        });
        message += `*Monto Total Debe: Bs. ${montoTotal.toFixed(2)}*\r\n\r\n`;
        message += `*AHORA PUEDES PAGAR POR QR*\r\n`;
        console.log(user.id,user.nombre);
        // if (user.id == 5) {
          let { result, setting } =
            await VeripagosDeudaFacturaService.crearVeripagosInstanceAndQr(
              1,
              montoTotal,
              user.DetalleUsuarioFactura
            );
          await apiWhatsappWeb.enviarMensajeTextoWithFile(
            user.cod_pais + user.telefono,
            message,
            setting.instancia_id,
            result.Data.qr,
            "Qr.png"
          );
        // }
      }
    }
  }

  static async crearVeripagosInstanceAndSendQrByManyDetalleUsuarioFacturaByUserId(usuarioid) {
    const user = await usuarioRepository.getUserConFacturasNoPagadasDeUnUsuario(usuarioid);
    console.log(user);
    let configuracion = user.Configuracion;
    if(user.DetalleUsuarioFactura.length == 0){
      throw new Error("El usuario no tiene deudas pendientes.");
    }
    if(!configuracion.estado_conexion){
      throw new Error("No habilitado para el envio de mensajes a Whatsapp.");
    }
    if(user.telefono == "" && user.cod_pais == ""){
      throw new Error("El usuario no tiene telefono registrado.");
    }
    if (user.cod_pais != "" && user.telefono != "") {
      let message = user.nombre + " " + user.apellidos + "\r\n";
      message += "*Tienes deudas pendientes.*" + "\r\n\r\n";
      let montoTotal = 0;
      user.DetalleUsuarioFactura.forEach((detalle) => {
        message += `*Servicio:* ${detalle.Servicio.nombre}\r\n`;
        message += `*Fecha:* ${detalle.getFechaFormateada()}\r\n`;
        message += `*Monto:* Bs. ${detalle.monto.toFixed(2)}\r\n`;
        message += `*Pago:* Bs. ${detalle.monto_pago.toFixed(2)}\r\n`;
        message += `*Debe:* Bs. ${(
          detalle.monto - detalle.monto_pago
        ).toFixed(2)}\r\n`;
        message += `-------------------------------------\r\n\r\n`;
        let saldo = detalle.monto - detalle.monto_pago;
        montoTotal += saldo < 0 ? 0 : saldo;
      });
      message += `*Monto Total Debe: Bs. ${montoTotal.toFixed(2)}*\r\n\r\n`;

      let phoneNumber = user.cod_pais + user.telefono;
      apiWhatsappWeb.enviarMensajeTexto(
        phoneNumber,
        message,
        configuracion.instancia_id
      );
      try {
        let message2 = `*Monto Total a pagar: Bs. ${montoTotal.toFixed(2)}*\r\n\r\n`;
        message2 += `*AHORA PUEDES PAGAR POR QR*\r\n`;
        let { result, setting } =
          await VeripagosDeudaFacturaService.crearVeripagosInstanceAndQr(
            1,
            montoTotal,
            user.DetalleUsuarioFactura
          );
        await apiWhatsappWeb.enviarMensajeTextoWithFile(
          user.cod_pais + user.telefono,
          message2,
          setting.instancia_id,
          result.Data.qr,
          "Qr.png"
        );
      } catch (error) {
        console.log("Ocurrio un error al enviar el qr de veripagos",error);
      }
    }
  }
}

module.exports = VeripagosDeudaFacturaService;
