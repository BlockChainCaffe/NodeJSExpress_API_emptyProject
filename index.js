
/*******************************************************************************

                        Node JS API NFT Project (1155)

Features
- Express
- JWT (Json Web Token) Authentication
- separate routes
- static content folder

******************************************************************************/

// Global configuration
const config = require("./config/config")


// Basic Dependecties
const fs = require('fs');
const http = require('http');
const https = require('https');


// Express & Friends
const express = require('express')
const cookieParser = require('cookie-parser')
const xss = require('xss-clean')
const helmet = require('helmet')
const log4js = require('log4js');
const logger = require('./common/logger.js').logger

/*****************************************************************************/

// Define APP
const app = express()
app.set('json spaces', 4)

app.use(xss());
app.use(helmet());
app.disable('x-powered-by');

// Log Http requests with log4js
logger.level = config.logLevel
app.use(log4js.connectLogger(logger, { level: 'auto' }))

// 
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// Serve Static content
app.use(express.static('./public'))

// Routes
// const TokenRoute = require ("./routes/token")
// app.use("/nft", TokenRoute)

// const UtilsRoute = require ("./routes/utilsroute")
// app.use("/util", UtilsRoute)

// const CommonRoute = require ("./routes/commonroute")
// app.use("/healthz", CommonRoute)

// const UserRoute = require ("./routes/userroute")
// app.use("/user", UserRoute)

// Handle multiple CORS allowed origins
app.use(function(req, res, next) {
  let origin = req.headers.origin;
  /**
   * config.cors_origin is an array of allowed origins
   * if the request origin is whitelisted make an Allow-Origin header for it
   */

  if(config.cors_origin.indexOf(origin) > -1){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-xsrf-token")
  res.setHeader("Access-Control-Allow-Credentials", true)
  next();
});


// Return a generic 500 if no other return code si already set
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});


// Start Server ----------------------------------------------------------------

let server, port 
let protocol = process.env.PROTOCOL || 'https'
if (fs.existsSync('./SSL/privkey.pem') && config.sslPort && protocol === 'https' ) {
  // Get SSL Certificate
  const privateKey = fs.readFileSync('./SSL/privkey.pem', 'utf8')
  const certificate = fs.readFileSync('./SSL/cert.pem', 'utf8')
  const ca = fs.readFileSync('./SSL/chain.pem', 'utf8')
  // Get Credentials for server
  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  }
  // Start a development HTTPS server.
  server = https.createServer(credentials,app)
  port = process.env.PORT || config.serverPort
} else {
  protocol = 'http'
  server = http.createServer(app)
  port = process.env.PORT || config.serverPort
}

server.listen( port, () => {
  logger.info("Server started on protocol "+protocol+" and port "+port+"...")
} )


