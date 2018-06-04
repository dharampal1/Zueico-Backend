// Setup environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = require(`./environments/${process.env.NODE_ENV}.js`);
