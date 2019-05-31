
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

// External Routes
const FirstRoute = require ("./routes/firstroute")
const SecondRoute = require ("./routes/secondroute")
app.use("/first", FirstRoute)
app.use("/second", SecondRoute)

// Start Server ----------------------------------------------------------------

app.listen(8088, () => {
  console.log("Server is up and listening on 8088...")
})

// Routes ----------------------------------------------------------------------

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