const dotEnv = require('dotenv').config();
module.exports = {
  development: {
    dialect: "mysql",
    host: process.env.DEV_DB_HOST || "",
    username: process.env.DEV_DB_USERNAME || "",
    password: process.env.DEV_DB_PASSWORD || "",
    database: process.env.DEV_DB_NAME || "",
    port: process.env.DEV_DB_PORT || 3306,
    logging: false,
  },
  test: {
    dialect: "mysql",
    username: process.env.TEST_DB_USERNAME || "",
    password: process.env.TEST_DB_PASSWORD || "",
    database: process.env.TEST_DB_NAME || "",
    host: process.env.TEST_DB_HOST || "",
    port: process.env.TEST_DB_PORT || 3306,
    logging: false,
  },
  production: {
    dialect: "mysql",
    username: process.env.PROD_DB_USERNAME || "",
    password: process.env.PROD_DB_PASSWORD || "",
    database: process.env.PROD_DB_NAME || "",
    host: process.env.PROD_DB_HOST || "",
    port: process.env.PROD_DB_PORT || 3306,
  },
};
