// ... We are an express router
const express = require("express");
const { logger } = require("../common/logger");
const router = express.Router();

// Router's routes are called like:
// router.<http-verb>("<URL*>", (req,res)=>{ ...<CODE>... })

router.get("/", (req,res)=>{ 
    //...<CODE>... 
    logger.info("In first rotue")
    res.status(200).json({"message":"You hit the first route"})
})

module.exports = router;