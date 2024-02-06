const { Admin } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {Configuracion} = require('../models');
const apiWhatsapp = require('../adapter/whatsapp/api-whatsapp-web');
const { customAlphabet } = require('nanoid');

class ConfiguracionRepository {
    alphaNumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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

    async getConfiguracionByAdminId(admin_id) {
        let configuracion = await Configuracion.findOne({
            where: {
                admin_id: admin_id
            }
        });
        let sessionState = await apiWhatsapp.getSessionStatus(configuracion.instancia_id);
        if(!sessionState.state){
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
        let session = await apiWhatsapp.getSessionStatus(configuracion.instancia_id);
        // let configuracion = await this.getConfiguracion();
        if(session.state && configuracion.numero_telefono != "")  throw new Error("Tienes una session activa");
        return await apiWhatsapp.getQrCode(configuracion.instancia_id);
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

    async verificarConexionQrByAdminId(admin_id){
        let configuracion = await this.getConfiguracionByAdminId(admin_id);
        console.log(configuracion);
        let client = await apiWhatsapp.getClientInfo(configuracion.instancia_id);
        if(!client.state) throw new Error("No se pudo conectar!");
        while (!client.data) {
            if(!client.state) throw new Error("No se pudo conectar!");
            client = await apiWhatsapp.getClientInfo(configuracion.instancia_id);
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
    async desconectarNroWhatsappByAdminId(admin_id){
        let configuracion = await this.getConfiguracionByAdminId(admin_id);
        if(!configuracion.estado_conexion) return configuracion;
        let teminate = await apiWhatsapp.terminateSession(configuracion.instancia_id);
        if(!teminate.state)
            throw new Error("No se pudo desconectar, intente nuevamente.");
        // configuracion.codigo_pais = "";
        // configuracion.numero_telefono = "";
        configuracion.estado_conexion = false;
        await configuracion.save();
        await apiWhatsapp.startSession(configuracion.instancia_id);
        return configuracion;
    }

    async createConfiguracion(codigo_pais,numero_telefono, admin_id) {
        let codeWhatsapp = customAlphabet(this.alphaNumeric, 10)();
        let configuracion = await Configuracion.create({
            codigo_pais: codigo_pais,
            numero_telefono: numero_telefono,
            instancia_id: codeWhatsapp,
            estado_conexion: false,
            veripagos_secret_key: "",
            veripagos_username: "",
            veripagos_password: "",
            admin_id: admin_id
        });
        await apiWhatsapp.startSession(codeWhatsapp);
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