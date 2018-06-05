// Setup environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Dependencies
import config from './config/environment';
import express from './config/express';
import colors from 'colors';
import session from 'express-session';

// Create server
const app = express();

app.use(session({
  secret: config.SECRET,
  resave: false,
  saveUninitialized: true
}));



// Start listening
app.listen(config.PORT, () => {
  console.log(colors.white(`Listening with ${process.env.NODE_ENV} config on port ${config.PORT}`));
});