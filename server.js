// Setup environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Dependencies
import config from './config/environment';
import express from './config/express';
import colors from 'colors';
import session from 'express-session';
import cron from 'node-cron';
import request from 'request';

import { getCurrentIco } from './helpers/socketHelper';

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
  getCurrentIco(socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});


function  getCurrentStats(socket) {
  cron.schedule('*/15 * * * * *', function(){
       console.log("running stats");

     const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';

      request.get({url},function(err,httpResponse,body ){
        if(err){
           console.log(err);
        } else {

            var pasedCoin=JSON.parse(body);

            var btc = pasedCoin.ETH.BTC,
                usd = pasedCoin.ETH.USD,

                ethervalue = (1 / usd) * 0.60,
                btcvalue = ethervalue * btc,
                usdvalue = 0.60,
                data = {
                  ethervalue:ethervalue.toString(),
                  btcvalue:btcvalue.toString(),
                  usdvalue:usdvalue.toString()
                };
               socket.emit("currentPrice", data); // Emitting a new stats.
           }   
      });
   });
};

// Start listening
server.listen(config.PORT, () => {
  console.log(colors.white(`Listening with ${process.env.NODE_ENV} config on port ${config.PORT}`));
});