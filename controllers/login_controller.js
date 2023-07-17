const bcrypt = require('bcrypt');
const { Admin } = require('../models');
const ResponseHelper = require('../utils/helper_response');
const jwt = require('jsonwebtoken');
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
            const token = jwt.sign(
                { email: admin.email },
                Admin.SECRET_KEY,
                { expiresIn: '1h', algorithm: 'HS512' }
            );
            const tokenExpiration = jwt.decode(token).exp;
            console.log('Token:', token);
            console.log('Tiempo de expiración:', new Date(tokenExpiration * 1000));
            return res.json({ message: 'Inicio de sesión exitoso', token: token });
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            return res.json(ResponseHelper.error('Error en el servidor'));
        }
    }
}

module.exports = LoginController;