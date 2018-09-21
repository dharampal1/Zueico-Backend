module.exports = {
  PORT: (process.env.PORT || 4000),
  DATABASE_URL: (process.env.DATABASE_URL || ''), 
  SECRET: (process.env.SECRET || 'h3sqq%pb#dHh^XcU8&Uj8brVS_*$LGHW'),
  JWT_EXPIRATION: (process.env.JWT_EXPIRATION || 600),
  smtpConfig: {
       // host: 'smtp.gmail.com',
       // port: 465,
       // secure: true, // use SSL
       service:'gmail',
       auth: {
          user: 'test@shamlatech.com',
          pass: 'technical@123'
       }
    },
    gapi_url:'https://zuenchain.net:5000',
    refund_ContractAddress :'0xba0619b9c8e99b1748a3462f4cb05b6b243db3a2',
    sale_ContractAddress: '0x3164afeadb754210c077b723fb2c32106cf0df65',
    token_ContractAddress :'0x6806a1fb780173323ad41902539e12214ed3d994',
    veting_ContractAddress: '0xf8cce07533c801e097aed9d26e29641a51af8483',
    airdrop_ContractAddress :'0x9c0a941196c7795cc9c42ce1b3fab5d1df4b6abd',
    http_provider:"https://zuenchain.net:8899"
};
