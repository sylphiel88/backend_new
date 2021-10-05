const express = require("express");

const router = express.Router();

router.get("/",(req, res)=>{
    res.send("We are the Users!");
});

module.exports = router;