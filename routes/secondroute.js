const express = require("express");
const router = express.Router();


// router.<http-verb>("<URL*>", (req,res)=>{ ...<CODE>... })

router.get("/", (req,res)=>{ 
    //...<CODE>... 
    res.status(200).json({"message":"You hit the second route"})
})


router.get("/error", (req,res) => {
    // Trow and error on purpouse
    throw new Error('I shoot my foot')
})

module.exports = router;