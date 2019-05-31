
/*******************************************************************************

                        Node JS API Basic Project

******************************************************************************/


// Express
const express = require('express')
const app = express()

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
const FirstRoute = require ("./routes/firstroute")
const SecondRoute = require ("./routes/secondroute")
app.use("/first", FirstRoute)

app.use("/second", authmw.checkToken, SecondRoute)

<<<<<<< HEAD
=======
var port = process.env.PORT || 8088;
app.listen(port, () => {
  console.log("Server is up and listening on 8088...")
})
>>>>>>> 1d3e623ec638a8c324a7709f721814a332036fcc


// Public Routes ---------------------------------------------------------------

app.get("/", (req, res) => {
  console.log("Responding to root route")
  res.send("Hello from ROOOOOT")
})

app.get("/array", (req,res)=> {
  var A = {first:"the One", second:"the Two"}
  var B = {first:"other One", third:"number 3"}
  res.json([A,B])
})

app.get("/array/:id", (req,res)=> {
  var id = req.params.id
  console.log ("param is "+ id)
  res.end() // return nothing
})

app.post("/put", function(req,res) {

  var A = req.body.A
  var B = req.body.B
  var C = req.body.C
  var D = req.body.D
  console.log ("POST with " + A + B + C + D)
  res.json([A,B,C,D]) // return nothing
})

// This method should be under authentication
app.get ("/inauth", authmw.checkToken, (req,res)=>{
  res.send("You are in an authenticated area")
})


// Login -----------------------------------------------------------------------

// Login Function
// Check credentials (fake here) and setup the token
app.post("/login", (req,res) => {
  var username = req.body.username
  var password = req.body.password

  // ...some logic here...

  if ( username == "admin" && password == "password") {
      // Grant Access
      const payload = {"user": username}
      var token = jwt.sign( payload, secret, {"expiresIn": "2h"} )
      res.json({
          "success" : true,
          "message" : "Access Granted for 2 hours",
          "token" : token
      })

  } else {
      // Deny Access
      res.json({ 
          success: false, 
          message: 'Authentication failed.'
      });
  }
})


// Error Handling --------------------------------------------------------------


app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});
<<<<<<< HEAD


// Start Server ----------------------------------------------------------------

var port = process.env.PORT || 8088;
app.listen(port, () => {
  console.log("Server is up and listening on 8088...")
})
=======
>>>>>>> 1d3e623ec638a8c324a7709f721814a332036fcc
