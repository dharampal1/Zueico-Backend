module.exports = {
  PORT: (process.env.PORT || 4000),
  DATABASE_URL: (process.env.DATABASE_URL || ''), 
  SECRET: (process.env.SECRET || 'h3sqq%pb#dHh^XcU8&Uj8brVS_*$LGHW'),
  JWT_EXPIRATION: (process.env.JWT_EXPIRATION || 600),
  smtpConfig: {
       host: 'smtp.gmail.com',
       port: 465,
       secure: true, // use SSL
       auth: {
          user: 'test@shamlatech.com',
          pass: 'technical@123'
       }
    },
    api_url:'http://13.126.36.117:4000/'
};
