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
    gapi_url:'http://13.126.36.117:5000',
    refund_ContractAddress :'0xba0619b9c8e99b1748a3462f4cb05b6b243db3a2',
    sale_ContractAddress: '0x3164afeadb754210c077b723fb2c32106cf0df65',
    token_ContractAddress :'0x6806a1fb780173323ad41902539e12214ed3d994',
    veting_ContractAddress: '0x5dc86ae96b456b1887bae090ff27f48cbd008b0f',
    airdrop_ContractAddress :'0xeddc650bcba054015810aa93077ef41878b8af3d',
    http_provider:"https://zuenchain.net:8899"
};
