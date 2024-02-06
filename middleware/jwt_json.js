const jwt = require('jsonwebtoken');
const {Admin} = require('../models');
const TokenRepository = require('../repositories/token.repository');
const AdminRepository = require('../repositories/admin.repository');
async function jwtMiddleware(req, res, next) {
  const token = req.headers.authorization;
  console.log(token);
  const tokenWithoutBearer = token.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token de autenticación' });
  }

  try {
    const decodedToken = jwt.verify(tokenWithoutBearer, Admin.SECRET_KEY, { algorithm: 'HS512' });
    if(!(await TokenRepository.checkTokenExpiration(tokenWithoutBearer))){
      req.user = await AdminRepository.findUserByCorreo(decodedToken.email);
      // req.userLogged = await AdminRepository.findUserByCorreo(decodedToken.email);
      next();
    }else{
      return res.status(401).json({ message: 'El token ya expiro' });
    }
  } catch (error) {
    console.log(error);
    await TokenRepository.destroyToken(tokenWithoutBearer);
    return res.status(401).json({ message: 'Token de autenticación inválido' });
  }
}

module.exports = jwtMiddleware;