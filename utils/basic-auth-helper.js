class BasicAuthHelper {
    static encodeCredentials(username, password) {
      const credentials = `${username}:${password}`;
      const base64Credentials = Buffer.from(credentials, 'utf-8').toString('base64');
      return `Basic ${base64Credentials}`;
    }
  
    static decodeCredentials(basicAuthHeader) {
      const base64Credentials = basicAuthHeader.split(' ')[1];
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = decodedCredentials.split(':');
      return { username, password };
    }
  }

  module.exports = BasicAuthHelper;