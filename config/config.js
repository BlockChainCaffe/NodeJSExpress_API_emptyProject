const logger = require('../common/logger.js').logger
const dotenv = require('dotenv');

// ------------------------------------------------------------------------------
//                          ENVIRONMENT DEPENDENT PARAMETERS
// ------------------------------------------------------------------------------

const result = dotenv.config();
if (result.error) {
    logger.warn("Could not find .env file. Proceeding with defaul values for localhost/dev")
}


// Networking
let serverPort      = process.env.HTTP_PORT         || '8088'
let sslPort         = process.env.SSL_PORT          || '8089'
let logLevel        = process.env.LOGLEVEL          || 'all'
let corsOrigin      = process.env.CORS_ORIGINS.split(' ')

// 'Salt' to be added to hashing functions
let hash_salt       = process.env.hashSalt          || 'e5e424e7d32a1af38d36f44e92428b503a3e1747bd4b9daf0da6c128a3625c420763dd5abe75a7778af1ae539b45e3099fd7956b89a54649e83d93361c86ae23'


//  JWT Token parameters
let jwt_tokenName   = process.env.JWT_TOKENNAME     || 'GUTJWTApiAuth'
let jwt_expire      = process.env.JWT_EXPIRE        || 604800
let jwt_secret      = process.env.JWT_SECRET        || 'ed28f99d5a4333eb5989371bd915dc38f2666e3e1101108c6127f801f83d0fa2'


//  Security
let shared_secrets  = process.env.SHAREDSECRET         || '41ed3d2307c333ab3afce935fe0b0ab5b627f45417f7447c7ddfc5fa10b711f4'


// Other endpoints for other apis



// SMTP Data
let SMTP_User       = process.env.STMP_USER
let SMTP_Pass       = process.env.STMP_PASS
let SMTP_Host       = process.env.STMP_HOST

/* ------------------------------------------------------------------
    MODULE EXPORTS
-------------------------------------------------------------------*/


module.exports = {    
    serverPort      ,
    sslPort         ,
    logLevel        ,
    corsOrigin      ,
    
    hash_salt       ,
    jwt_tokenName   ,
    jwt_expire      ,
    jwt_secret      ,

    shared_secrets  ,

    SMTP_User       ,
    SMTP_Pass       ,
    SMTP_Host       ,
};
