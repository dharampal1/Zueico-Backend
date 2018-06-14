// Setup environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Dependencies
import config from './config/environment';
import express from './config/express';
import colors from 'colors';
import session from 'express-session';
import cron from 'node-cron';
import axios from 'axios';
const api_url = 'http://13.126.28.220:5000';


// Create server
const app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(session({
  secret: config.SECRET,
  resave: false,
  saveUninitialized: true,
  proxy: true,
  cookie:{
    secure: false,
    domain: 'localhost',
    maxAge: 1000 * 60 * 24 // 24 hours
    },
}));

io.on("connection", (socket) => {
  console.log("New client connected");

  getCurrentStats(socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});


function  getCurrentStats(socket) {
  cron.schedule('*/15 * * * * *', function(){
       console.log("running stats");
     axios.get(`${api_url}/getICOstats`)
      .then(response => {
        if(response.status === 200){
          socket.emit("currentStats", res.data.data); // Emitting a new stats.
        } 
      })
      .catch(err => {
        res.status(500).json(err);
     }); 
   });
};

// Start listening
server.listen(config.PORT, () => {
  console.log(colors.white(`Listening with ${process.env.NODE_ENV} config on port ${config.PORT}`));
});