const fs = require('fs');
const dotenv = require("dotenv");
// Cargar las variables de entorno desde el archivo .env
dotenv.config();
const path = require('path');
const configJsonPath = path.join(__dirname, './config.json');
// Cargar el archivo JSON
const configJson = fs.readFileSync(configJsonPath, 'utf8');
const config = JSON.parse(configJson);

// Función para obtener la configuración según el entorno
function getConfig(environment) {
  environment = environment.trim();
  const envConfig = config[environment];

  if (!envConfig) {
    throw new Error(
      `No se encontró configuración para el entorno: ${environment}`
    );
  }
  if(environment === "development"){
    environment = "DEV";
  }
  if(environment === "test"){
    environment = "TEST"
  }
  if(environment === "production"){
    environment = "PROD"
  }
  // Establecer los datos utilizando variables de entorno
  envConfig.username = process.env[`${environment}_DB_USERNAME`] || "";
  envConfig.password = process.env[`${environment}_DB_PASSWORD`] || "";
  envConfig.database = process.env[`${environment}_DB_NAME`] || "";
  envConfig.host = process.env[`${environment}_DB_HOST`] || "";
  return envConfig;
}

module.exports = {
  getConfig
};
