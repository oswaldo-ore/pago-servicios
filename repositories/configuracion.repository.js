const { Admin } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {Configuracion} = require('../models');
const apiWhatsapp = require('../adapter/whatsapp/api-whatsapp-web');

class ConfiguracionRepository {
    async getConfiguracion() {
        let sessionState = await apiWhatsapp.getSessionStatus();
        let configuracion = await Configuracion.findOne();
        if (!configuracion) {
            // Aquí puedes agregar la lógica para crear una nueva configuración si no existe
            configuracion = await Configuracion.create({
                codigo_pais: "+591",
                numero_telefono: "",
                instancia_id: apiWhatsapp.INSTANCEID,
                estado_conexion: false,
            });
            await apiWhatsapp.startSession();
        }
        if(!sessionState.state){
            configuracion.codigo_pais = "";
            configuracion.numero_telefono = "";
            configuracion.estado_conexion = false;
            await configuracion.save();
        }
        return configuracion;
    }
    async generarCodigoQr(){
        let session = await apiWhatsapp.getSessionStatus();
        let configuracion = await this.getConfiguracion();
        if(session.state && configuracion.numero_telefono != "")  throw new Error("Tienes una session activa");
        return await apiWhatsapp.getQrCode();
    }
    async verificarConexionQr(){
        let client = await apiWhatsapp.getClientInfo();
        let configuracion = await this.getConfiguracion();
        if(!client.state) throw new Error("No se pudo conectar!");
        while (!client.data) {
            if(!client.state) throw new Error("No se pudo conectar!");
            client = await apiWhatsapp.getClientInfo();
        }
        console.log(client);
        let numero = client.data.me.user;
        numero = numero.replace("591","");
        configuracion.codigo_pais = "591";
        configuracion.numero_telefono = numero;
        configuracion.estado_conexion = true;
        await configuracion.save();
        return configuracion;
    }

    async desconectarNroWhatsapp(){
        let configuracion = await this.getConfiguracion();
        if(!configuracion.estado_conexion) return configuracion;
        let teminate = await apiWhatsapp.terminateSession();
        if(!teminate.state)
            throw new Error("No se pudo desconectar, intente nuevamente.");
        configuracion.codigo_pais = "";
        configuracion.numero_telefono = "";
        configuracion.estado_conexion = false;
        await configuracion.save();
        await apiWhatsapp.startSession();
        return configuracion;
    }
}

module.exports = ConfiguracionRepository;