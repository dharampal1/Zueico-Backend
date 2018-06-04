
module.exports = function (app) {

  // localhost:port/api/
  app.use('/api', require('./api.routes'));
};
