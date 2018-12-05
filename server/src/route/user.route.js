const users = require('../controller/user.controller');
const verifyToken = require('../verify-token');
const requireAdmin = require('../require-admin');

module.exports = (app) => {
  app.get('/user', [verifyToken, requireAdmin], users.findAll);
  app.post('/user', verifyToken, users.create);
  app.post('/user/login', users.login);
};
