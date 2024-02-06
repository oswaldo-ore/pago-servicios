const axios = require("axios");
require("dotenv").config();

class VeripagosAPI {
  constructor(username, password, secretKey) {
    this.username = username;
    this.password = password;
    this.secretKey = secretKey;
    this.baseUrl = process.env.VERIPAGOS_API_URL;
  }

  async generarQR(monto, data, vigencia, detalle = null) {
    try {
      const response = await axios.post(
        `${this.baseUrl}generar-qr`,
        {
          secret_key: this.secretKey,
          monto: monto,
          data: data,
          vigencia: vigencia,
          detalle: detalle,
        },
        {
          auth: {
            username: this.username,
            password: this.password,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error al generar el QR:", error.response.data);
      return error.response.data;
    }
  }

  async verificarEstadoQR(movimientoId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}verificar-estado-qr`,
        {
          secret_key: this.secretKey,
          movimiento_id: movimientoId,
        },
        {
          auth: {
            username: this.username,
            password: this.password,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error al verificar el estado del QR:",
        error.response.data
      );
      return error.response.data;
    }
  }

  static obtenerImagenQRBase64(qrData) {
    return `data:image/png;base64,${qrData}`;
  }
}

module.exports = VeripagosAPI;
