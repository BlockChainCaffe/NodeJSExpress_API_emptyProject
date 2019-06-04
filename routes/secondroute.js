// ... We are an express router
const express = require("express");
const router = express.Router();

// Router's routes are called like:
// router.<http-verb>("<URL*>", (req,res)=>{ ...<CODE>... })

// You get to this route calling .../second/
router.get("/", (req,res)=>{ 
    //...<CODE>... 
    res.status(200).json({
        "message":"You hit the second route",
        "decoded":req.decoded
    })
})

// This route trows an error on purpouse
router.get("/error", (req,res) => {
    // Trow and error on purpouse
    throw new Error('I shoot my foot')
})

module.exports = router;