const jwt = require('jsonwebtoken');
const {Admin} = require('../models');
function jwtMiddleware(req, res, next) {
  const token = req.headers.authorization;
  const tokenWithoutBearer = token.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token de autenticación' });
  }

  try {
    const decodedToken = jwt.verify(tokenWithoutBearer, Admin.SECRET_KEY, { algorithm: 'HS512' });
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Token de autenticación inválido' });
  }
}

module.exports = jwtMiddleware;