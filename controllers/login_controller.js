const bcrypt = require('bcrypt');
const { Admin,Token } = require('../models');
const ResponseHelper = require('../utils/helper_response');
const jwt = require('jsonwebtoken');
const TokenRepository = require('../repositories/token.repository');
const LoginController = {
    async loginAdmin(req, res) {
        const { email, password } = req.body;

        try {
            const admin = await Admin.findOne({ where: { email } });
            if (!admin) {
                return res.json(ResponseHelper.error('Credenciales inválidas.'));
            }
            const passwordMatch = await bcrypt.compare(password, admin.password);
            if (!passwordMatch) {
                return res.json(ResponseHelper.error('Credenciales inválidas.'));
            }
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 1);
            const token = jwt.sign(
                { email: admin.email },
                Admin.SECRET_KEY,
                { expiresIn: '1h', algorithm: 'HS512' }
            );
            const tokenExpiration = jwt.decode(token).exp;
            console.log('Token:', token);
            console.log('Tiempo de expiración:', new Date(tokenExpiration * 1000));
            admin.token = token;
            await admin.save();
            await Token.create({
                token: token,
                user_id: admin.id,
                expiration_date: expirationDate
            });
            return res.json({ message: 'Inicio de sesión exitoso', token: token });
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            return res.json(ResponseHelper.error('Error en el servidor'));
        }
    },
    async logoutAdmin(req,res) {
        const token = req.headers.authorization;
        const tokenWithoutBearer = token.replace('Bearer ', '');

        try {
            const decodedToken = jwt.verify(tokenWithoutBearer, Admin.SECRET_KEY);
            await TokenRepository.destroyToken(tokenWithoutBearer);
            return res.status(401).json({ message: 'Cierre de sesión exitoso', success:true});
        } catch (error) {
            console.error('Error en el cierre de sesión:', error);
            return res.json(ResponseHelper.error('Error en el servidor'));
        }
    }
}

module.exports = LoginController;