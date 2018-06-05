
module.exports = function (app) {

  // auth api routes
  app.use('/api/auth', require('./auth-api-routes'));

  // user api routes
  app.use('/api/users', require('./user-api-routes'));

  // admin api routes
  app.use('/api/admin', require('./admin-api-routes'));
};
