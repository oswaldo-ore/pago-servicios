const DetalleUsuarioFacturaRepository = require("../repositories/detalle.factura.repository");
const ConfiguracionRepository = require("../repositories/configuracion.repository");
const VeripagosAPI = require("../adapter/veripagos/veripagos-api");
const VeripagosInstanceRepository = require("../repositories/veripagos-instance.repository");
const { DetalleUsuarioFactura } = require("../models");
const apiWhatsappWeb = require("../adapter/whatsapp/api-whatsapp-web");
const configuracionRepository = new ConfiguracionRepository();
const detalleUsuarioFacturaRepository = new DetalleUsuarioFacturaRepository();

class VeripagosDeudaFacturaService {
    static async crearVeripagosInstanceAndSendQrBySingleDetalleUsuarioFactura(
        detalleUsuarioFacturaId
    ) {
        let detalleUsuarioFactura =
            await detalleUsuarioFacturaRepository.getDetalleUsuarioFacturaById(
                detalleUsuarioFacturaId
            );
        if(detalleUsuarioFactura.estado == DetalleUsuarioFactura.COMPLETADO ){
            throw new Error("La factura ya fue completada");
        }
            //analizar la base de datos para sacar los datos del usuario
        let setting = await configuracionRepository.getConfiguracionByAdminId(
            1
        );
        let veripagosApi = new VeripagosAPI(
            setting.veripagos_username,
            setting.veripagos_password,
            setting.veripagos_secret_key
        );
        let {veripagosInstance, detalle} = await VeripagosInstanceRepository.createVeripagosInstanceWithDetalle(null,detalleUsuarioFactura.monto,"Pendiente",[detalleUsuarioFactura]);
        let result = await veripagosApi.generarQR(
            detalleUsuarioFactura.monto,
            [ veripagosInstance ],
            "1/00:00",
            "Get Pay Family"
            );
        veripagosInstance.movimiento_id = result.Data.movimiento_id;
        await veripagosInstance.save();
        await apiWhatsappWeb.enviarMensajeTextoWithFile("59162008498","Ahora puedes pagar tu servicio por el QR.",setting.instancia_id,result.Data.qr,"Qr.png",);
        return result;
    }

    
}

module.exports = VeripagosDeudaFacturaService;
