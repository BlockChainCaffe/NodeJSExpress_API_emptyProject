
/*******************************************************************************

                        Node JS API Basic Project

Just an empty scaffholding for a JSon API project with
- Express
- JWT (Json Web Token) Authentication
- separate routes
- static content folder

******************************************************************************/


// Express
const express = require('express')
const app = express()
app.set('json spaces', 4)

// Log with morgan
const morgan = require('morgan')
app.use(morgan('short'))

// post body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static content
app.use(express.static('./public'))

// JWT and Auth
const config = require("./config")
const secret = config.secret
var jwt = require('jsonwebtoken')
const authmw = require("./auth/authmw")

// Separate Routes
// First "normal" route
const FirstRoute = require ("./routes/firstroute")
app.use("/first", FirstRoute)
// Second protected route
// Note that authentication token check is called before passing 
// to the second router module
const SecondRoute = require ("./routes/secondroute")
app.use("/second", authmw.checkToken, SecondRoute)



// Public Local Routes ---------------------------------------------------------

// Static route
app.get("/", (req, res) => {
  console.log("Responding to root route")
  res.send("Hello from ROOOOOT")
})

// Array
app.get("/array", (req,res)=> {
  var A = {first:"the One", second:"the Two"}
  var B = {first:"other One", third:"number 3"}
  res.json([A,B])
})

// Parametric request route
app.get("/array/:id", (req,res)=> {
  var id = req.params.id
  console.log ("param is "+ id)
  res.end() // return nothing
})

// post / submission
app.post("/put", function(req,res) {
  var A = req.body.A
  var B = req.body.B
  var C = req.body.C
  var D = req.body.D
  console.log ("POST with " + A + B + C + D)
  res.json([A,B,C,D]) // return nothing
})

// Single local route under authentication
app.get ("/inauth", authmw.checkToken, (req,res)=>{
  res.send("You are in an authenticated area")
})


// Login -----------------------------------------------------------------------

// Login Route
// Check credentials (fake here) and setup the token
// This route cannot be subject to authentication
app.post("/login", (req,res) => {
  var username = req.body.username
  var password = req.body.password

  // ...some logic here...
  // Get username and password from a DB

  if ( username == "admin" && password == "password") {
      // Grant Access, 
      // fill the payload with data that can be used later by auth'd routes
      const payload = {"user": username}
      // Sign token with a timeout (2h)
      var token = jwt.sign( payload, secret, {"expiresIn": config.expire} )
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

var port = process.env.PORT || config.port;
app.listen(port, () => {
  console.log("Server is up and listening on "+port+""...")
})
8088
