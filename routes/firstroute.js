// ... We are an express router
const express = require("express");
const router = express.Router();

// Router's routes are called like:
// router.<http-verb>("<URL*>", (req,res)=>{ ...<CODE>... })

router.get("/", (req,res)=>{ 
    //...<CODE>... 
    res.status(200).json({"message":"You hit the first route"})
})

module.exports = router;