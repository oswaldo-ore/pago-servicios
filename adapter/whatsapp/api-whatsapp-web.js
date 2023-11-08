const { default: axios } = require("axios");
const ApiWhatsapp = require("./api-whatsapp");
const QRCode = require('qrcode');
const validatePhoneNumber = require('validate-phone-number-node-js');
class ApiWhatsappWeb extends ApiWhatsapp {
    constructor() {
        super(); // Llama al constructor de la clase base
        this.URL = "http://a.tecnosoft.website:3000"; // Propiedad específica de ApiWhatsappWeb
        this.RESPONSE = {
            state: "",
            message: "",
            data: null,
        };
    }
    async startSession(sessionId = 154) {
        let url = `${this.URL}/session/start/${sessionId}`;
        try {
            let response = await axios.get(url);
            console.log(response);
            if (response.data.error) {
                throw response.data.error;
            }
            this.RESPONSE.state = response.data.success;
            this.RESPONSE.message = response.data.message;
            return this.RESPONSE;
        } catch (error) {
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }
    }
    async getSessionStatus(sessionId) {
        const url = `${this.URL}/session/status/${sessionId}`;
        try {
            let response = await axios.get(url);
            this.RESPONSE.state = response.data.success;
            this.RESPONSE.message = response.data.message;
            return this.RESPONSE;
        } catch (error) {
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }

    }

    async getQrCode(sessionId) {
        const url = `${this.URL}/session/qr/${sessionId}`;
        try {
            let response = await axios.get(url);

            const qrCode = await QRCode.toDataURL(response.data.qr);
            this.RESPONSE.state = response.data.success;
            this.RESPONSE.message = "Codigo QR en base 64";
            this.RESPONSE.data = {
                code_qr: qrCode,
            };
            return this.RESPONSE;
        } catch (error) {
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }
    }

    async getQrCodeImage(sessionId) {
        const url = `${this.URL}/session/qr/${sessionId}/image`;
        try {
            let response = await axios.get(url, {
                responseType: 'arraybuffer',
            });
            return response.data;
        } catch (error) {
            console.log("Ocurio un error :" +error);
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }
    }

    async terminateSession(sessionId) {
        const url = `${this.URL}/session/terminate/${sessionId}`;
        try {
            const response = await axios.get(url);
            this.RESPONSE.state = response.data.success;
            this.RESPONSE.message = response.data.message;
            return this.RESPONSE;
        } catch (error) {
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }
    }

    async terminateInactiveSessions() {
        const url = `${this.URL}/session/terminateInactive`;
        try {
            const response = await axios.get(url);
            this.RESPONSE.state = response.data.success;
            this.RESPONSE.message = response.data.message;
            return this.RESPONSE;
        } catch (error) {
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }
    }

    async terminateAllSessions() {
        const url = `${this.URL}/session/terminateAll`;
        try {
            const response = await axios.get(url);
            this.RESPONSE.state = response.data.success;
            this.RESPONSE.message = response.data.message;
            return this.RESPONSE;
        } catch (error) {
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }
    }

    async enviarMensajeTexto(sessionId, number, message){
        if(validatePhoneNumber.validate(number)){
            number = number.replace(/\+/g, '') + "@c.us";
        }
        const url = `${this.URL}/client/sendMessage/${sessionId}`;
        try {
            const data = {
                chatId: number,
                contentType: "string",
                content: message
              }
            const response = await axios.post(url,data);
            this.RESPONSE.state = true;
            this.RESPONSE.message = "Mensaje enviado correctamente";
            return this.RESPONSE;
        } catch (error) {
            console.log("Ocurio un error :" +error);
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }
    }
    async enviarMensajeFileForUrl(sessionId, number, urlFile){
        if(validatePhoneNumber.validate(number)){
            number = number.replace(/\+/g, '') + "@c.us";
        }
        const url = `${this.URL}/client/sendMessage/${sessionId}`;
        try {
            const data = {
                chatId: number,
                contentType: "MessageMediaFromURL",
                content: urlFile
              }
            const response = await axios.post(url,data);
            this.RESPONSE.state = true;
            this.RESPONSE.message = "Mensaje enviado correctamente";
            return this.RESPONSE;
        } catch (error) {
            console.log("Ocurio un error :" +error);
            if (error.response.data.error) {
                this.RESPONSE.state = false;
                this.RESPONSE.message = error.response.data.error;
            } else {
                this.RESPONSE.state = false;
                this.RESPONSE.message = "Ocurrio un error al conectarse al servidor";
            }
            return this.RESPONSE;
        }
    }
}

module.exports = new ApiWhatsappWeb;