const ApiWhatsappWeb = require("../adapter/whatsapp/api-whatsapp-web");
const FacturaRepository = require("../repositories/factura.repository");
const ResponseHelper = require("../utils/helper_response");

const WhatsappController = {
    async startSession(req,res){
        let { session } = req.body;
        try {
            let response = await ApiWhatsappWeb.startSession(session);
            console.log(response);
            return res.json(response);
        } catch (error) {
            return res.json(ResponseHelper.error(error));
        }
    },
    async statusSession(req,res){
        let { session } = req.body;
        try {
            let response = await ApiWhatsappWeb.getSessionStatus(session);
            console.log(response);
            return res.json(response);
        } catch (error) {
            return res.json(ResponseHelper.error(error));
        }
    },
    async getSessionQrBase64(req,res){
        let { session } = req.body;
        try {
            //areglar devuelve el codigo no la imagen en base 64
            let getStatusResponse = await ApiWhatsappWeb.getSessionStatus(session);
            if(getStatusResponse.state){
                return res.json(getStatusResponse);
            }
            await ApiWhatsappWeb.startSession(session);
            let response = await ApiWhatsappWeb.getQrCode(session);
            return res.json(response);
        } catch (error) {
            return res.json(ResponseHelper.error(error));
        }
    },
    async getSessionQrImage(req,res){
        let { session } = req.body;
        try {
            //areglar devuelve el codigo no la imagen en base 64
            let getStatusResponse = await ApiWhatsappWeb.getSessionStatus(session);
            if(getStatusResponse.state){
                return res.json(getStatusResponse);
            }
            let sessionStart = await ApiWhatsappWeb.startSession(session);
            if(sessionStart.state){
                await new Promise(resolve => setTimeout(resolve, 4500));
            }
            let image = await ApiWhatsappWeb.getQrCodeImage(session);
            console.log(image);
            res.set('Content-Type', 'image/png'); // Establece el tipo de contenido en la respuesta
            res.send(image); 
        } catch (error) {
            console.log(error);
            return res.json(ResponseHelper.error(error));
        }
    },
    async enviarMensaje(req,res){
        let { sessionId="12345", number="59177809390",message="Hola" } = req.body;
        try {
            const facturaRepository = new FacturaRepository();
            let response = await ApiWhatsappWeb.enviarMensajeTexto(sessionId,number,message);
            
            // let factura = await facturaRepository.enviarFacturaASuscriptores(5,sessionId);
            return res.json("holaclce");
        } catch (error) {
            console.log(error);
            return res.json(ResponseHelper.error(error));
        }
    },

    async actualizarFacturas(req,res){
        const facturaRepository = new FacturaRepository();
        await facturaRepository.actualizarEstadoDeLasFacturas();
        return res.json("holaclce");
    }
}

module.exports = WhatsappController;