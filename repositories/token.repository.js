const { Token } = require('../models');

class TokenRepository {
  static async getAdminByToken(token) {
    try {
      const tokenInstance = await Token.findOne({
        where: {
          token: token
        },
        include: Admin
      });

      if (tokenInstance) {
        return tokenInstance.Admin;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  static async checkTokenExpiration(token) {
    try {
      console.log("Este es el token "+token);
      const tokenInstance = await Token.findOne({
        where: {
          token: token
        }
      });
      if (tokenInstance) {
        const currentDate = new Date();
        const expiration_date = new Date(tokenInstance.expiration_date);
        console.log(expiration_date, currentDate);
        console.log(expiration_date < currentDate);
        if (expiration_date < currentDate) {
          await tokenInstance.destroy();
          return true;
        }
        return false;
      } else {
        return true;
      }
    } catch (error) {
      throw error;
    }
  }
  static async destroyToken(token){
    console.log("Destruyendo el token: "+token);
    await Token.destroy({ where: { token: token } });
  }
}
module.exports = TokenRepository;