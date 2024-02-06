const jwt = require("jsonwebtoken");
const { Admin } = require("../models");
const TokenRepository = require("../repositories/token.repository");
const AdminRepository = require("../repositories/admin.repository");
const BasicAuthHelper = require("../utils/basic-auth-helper");


async function verificarAuthToVeripagos(req, res, next) {
  const authHeader = req.headers["authorization"];
  let { username, password } = BasicAuthHelper.decodeCredentials(authHeader);
  let admin = await AdminRepository.getUserAndSettingByUserAndPassVeripago(username, password);
  if(admin){
    req.user = admin;
    next();
  }else{
    return res.status(401).json({ message: 'No se pudo encontrar el usuario Veripago' });
  }
}

module.exports = verificarAuthToVeripagos;
