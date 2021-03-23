
/*******************************************************************************

                        Node JS API Basic Project

Just an empty scaffholding for a JSon API project with
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
const ipfilter = require('express-ipfilter').IpFilter
const xss = require('xss-clean')
const helmet = require('helmet')
const log4js = require('log4js');
const logger = require('./common/logger.js').logger
const bodyParser = require('body-parser');

/*****************************************************************************/

// Define APP
const app = express()
app.set('json spaces', 4)
<<<<<<< HEAD

// Whitelist only some IP addresses
if (config.ip_whitelist) {
  app.use(ipfilter(config.ip_whitelist, { mode: 'allow' }))
}
app.use(xss());
app.use(helmet());
app.disable('x-powered-by');

// Log Http requests with log4js
logger.level = config.loglevel
app.use(log4js.connectLogger(logger, { level: 'auto' }))
=======
>>>>>>> 8db14f6528873d189d640705315836cf73b1f203


// post body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// Serve Static content
app.use(express.static('./public'))

// // JWT and Auth
// const secret = config.secret
// let jwt = require('jsonwebtoken')
// const authmw = require("./auth/authmw")

// Separate Routes -------------------------------------------------------------

// Note that authentication token check is called before second router module
// const SecondRoute = require ("./routes/secondroute")
// app.use("/second", authmw.checkToken, SecondRoute)

const FirstRoute = require ("./routes/firstroute")
app.use("/first", FirstRoute)

const SecondRoute = require ("./routes/secondroute")
app.use("/second", SecondRoute)


// Public Local Routes ---------------------------------------------------------

// // Static route
// app.get("/", (req, res) => {
//   console.log("Responding to root route")
//   res.send("Hello from ROOOOOT")
// })

// // Single local route under authentication
// app.get ("/inauth", authmw.checkToken, (req,res)=>{
//   res.send("You are in an authenticated area")
// })


// Login -----------------------------------------------------------------------

// Login Route
// Check credentials (fake here) and setup the token
// This route cannot be subject to authentication
app.post("/login", (req,res) => {
  let username = req.body.username
  let password = req.body.password

  // ...some logic here...
  // Get username and password from a DB

  if ( username == "admin" && password == "password") {
      // Grant Access, 
      // fill the payload with data that can be used later by auth'd routes
      const payload = {"user": username}
      // Sign token with a timeout (2h)
      let token = jwt.sign( payload, secret, {"expiresIn": config.expire} )
      // Prepare the reply
      res.json({
          "success" : true,
          "message" : "Access Granted for 2 hours",
          "token" : token
      })

  } else {
      // Deny Access
      res.status(403).json({ 
          success: false, 
          message: 'Authentication failed.'
      });
  }
})


// Error Handling --------------------------------------------------------------
// If execution got to this point without returning a response 
// there's something wrong (possibly a 404)

app.use((req, res, next) => {
  logger.error("404 not found !")
  // Create a 404 error
  const error = new Error("Not found");
  error.status = 404;
  // Return it and pass it to subsequent error (if any)
  next(error);
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

<<<<<<< HEAD
let server, port 
let protocol = process.env.PROTOCOL || 'https'
if (fs.existsSync('./SSL/privkey.pem') && config.portSSL && protocol === 'https' ) {
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
  port = process.env.PORT || config.portSSL
} else {
  protocol = 'http'
  server = http.createServer(app)
  port = process.env.PORT || config.port
}

server.listen( port, () => {
  console.log("Server started on protocol "+protocol+" and port "+port+"...")
} )


=======
var port = process.env.PORT || config.port;
app.listen(port, () => {
  console.log("Server is up and listening on "+port+"...")
})
>>>>>>> 8db14f6528873d189d640705315836cf73b1f203
