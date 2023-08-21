// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    console.info('Authorization header missing');
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    console.warn('Invalid authorization type');
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      console.error('Token verification failed:', err);
      return resp.status(403).send('Acesso proibido');
    }

    console.info('Token verified:', decodedToken);
    req.user = decodedToken;
    next();
  });
};

// Verifica se o usuário está autenticado
module.exports.isAuthenticated = (req) => {
  const { user } = req;
  return user !== undefined;
};

// Verifica se o usuário possui a role "admin"
module.exports.isAdmin = (req) => {
  const { user } = req;
  return user && user.role && user.role === 'admin';
};

// Requer autenticação para acessar rotas protegidas
module.exports.requireAuth = (req, resp, next) => {
  if (!module.exports.isAuthenticated(req)) {
    return resp.status(401).send('Autenticação necessária');
  }
  next();
};

// Requer autenticação e que o usuário seja admin para acessar rotas protegidas pelo admin
module.exports.requireAdmin = (req, resp, next) => {
  if (!module.exports.isAuthenticated(req)) {
    return resp.status(401).send('Autenticação necessária');
  }
  if (!module.exports.isAdmin(req)) {
    return resp.status(403).send('Acesso proibido');
  }
  next();
};
