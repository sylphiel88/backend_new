const express = require("express");

const router = express.Router();

router.get("/",(req, res)=>{
    res.send("We are the Users!");
}); 

router.post("/signin",async (req,res)=>{
    const User = require('../models/user.model')
    const vUser=await User.findOne({username: req.body.username}).exec()
    console.log(vUser);
    var bool = await vUser.validatePassword(req.body.password)
    console.log(bool);
    if(await vUser.validatePassword(req.body.password)) {
        res.json({message: "Erfolgreicher SignIn von " + req.body.username});
    } else {
        res.json({message: "Fehler! Login von " + req.body.username +" nicht möglich!"});
    }
    
})

router.post("/signup",async(req,res)=>{
    const User = require('../models/user.model')
    const vUser = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.password
    })
    
    vUser.save()
})


const handleError = (err,res) => {
    res.json({message: "Fehler: "+err})
}

module.exports = router;