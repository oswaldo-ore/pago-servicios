const { Admin } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {Configuracion} = require('../models');
const apiWhatsapp = require('../adapter/whatsapp/api-whatsapp-web');
const nonoid = require('nanoid');
const moment = require('moment');

class ConfiguracionRepository {
    alphaNumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    static SESSION_NOT_CONNECTED = "session_not_connected";
    static SESSION_NOT_FOUND = "session_not_found";
    //session_connected
    static SESSION_CONNECTED = "session_connected";
    static QR_CODE_NOT_READY = "qr code not ready or already scanned";

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
        if(sessionState.message != ConfiguracionRepository.SESSION_CONNECTED){
            configuracion.codigo_pais = "";
            configuracion.numero_telefono = "";
            configuracion.estado_conexion = false;
            await configuracion.save();
        }
        return configuracion;
    }

    async getConfiguracionByAdminId(admin_id) {
        let configuracion = await Configuracion.findOne({
            where: {
                admin_id: admin_id
            }
        });
        let sessionState = await apiWhatsapp.getSessionStatus(configuracion.instancia_id);
        if(sessionState.message != ConfiguracionRepository.SESSION_CONNECTED ){
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
    async generarCodigoQrByAdminId(admin_id){
        let configuracion = await this.getConfiguracionByAdminId(admin_id);
        if(!configuracion.estado_conexion){
            await apiWhatsapp.startSession(configuracion.instancia_id);
        }
        let session = await apiWhatsapp.getSessionStatus(configuracion.instancia_id);
        let response = session;
        if(session.message == ConfiguracionRepository.SESSION_NOT_CONNECTED){
            response = await apiWhatsapp.getQrCode(configuracion.instancia_id);
            while (response.message == ConfiguracionRepository.QR_CODE_NOT_READY) {
                await new Promise(resolve => setTimeout(resolve,2000));
                response = await apiWhatsapp.getQrCode(configuracion.instancia_id);
            }
        }
        return response;
    }
    async verificarConexionQr(){
        let client = await apiWhatsapp.getClientInfo();
        let configuracion = await this.getConfiguracion();
        if(!client.state) throw new Error("No se pudo conectar!");
        while (!client.data) {
            if(!client.state) throw new Error("No se pudo conectar!");
            client = await apiWhatsapp.getClientInfo();
        }
        let numero = client.data.me.user;
        numero = numero.replace("591","");
        configuracion.codigo_pais = "591";
        configuracion.numero_telefono = numero;
        configuracion.estado_conexion = true;
        await configuracion.save();
        return configuracion;
    }

    async verificarConexionQrByAdminId(admin_id){
        let configuracion = await this.getConfiguracionByAdminId(admin_id);
        let client = await apiWhatsapp.getClientInfo(configuracion.instancia_id);
        if(client.message && client.message != ConfiguracionRepository.SESSION_CONNECTED) throw new Error("Whatsapp no conectado");
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
    async desconectarNroWhatsappByAdminId(admin_id){
        let configuracion = await this.getConfiguracionByAdminId(admin_id);
        if(!configuracion.estado_conexion) return configuracion;
        let teminate = await apiWhatsapp.terminateSession(configuracion.instancia_id);
        if(!teminate.state)
            throw new Error("No se pudo desconectar, intente nuevamente.");
        configuracion.estado_conexion = false;
        await configuracion.save();
        return configuracion;
    }

    async createConfiguracion(codigo_pais,numero_telefono, admin_id,transaction=null) {
        let codeWhatsapp =  (nanoid(12).replace(/[^a-zA-Z0-9]/g, '')).toUpperCase();
        let configuracion = await Configuracion.create({
            codigo_pais: codigo_pais,
            numero_telefono: numero_telefono,
            instancia_id: codeWhatsapp,
            estado_conexion: false,
            veripagos_secret_key: "",
            veripagos_username: "",
            veripagos_password: "",
            admin_id: admin_id
        },{transaction:transaction});
        return configuracion;
    }

    async updateVeripagosConfiguracion(secretKey,username,password, admin_id) {
        let configuracionDB = await Configuracion.findOne({
            where: {
                admin_id: admin_id
            }
        });
        configuracionDB.veripagos_secret_key = secretKey;
        configuracionDB.veripagos_username = username;
        configuracionDB.veripagos_password = password == ""?configuracionDB.veripagos_password:password;
        await configuracionDB.save();
        return configuracionDB;
    }
}

module.exports = ConfiguracionRepository;