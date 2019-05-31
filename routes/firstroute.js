const express = require("express");
const router = express.Router();


// router.<http-verb>("<URL*>", (req,res)=>{ ...<CODE>... })

router.get("/", (req,res)=>{ 
    //...<CODE>... 
    res.status(200).json({"message":"You hit the first route"})
})

module.exports = router;