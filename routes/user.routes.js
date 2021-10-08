const express = require("express");
const User = require('../models/user.model')
const router = express.Router();
const jwt = require('node-jsonwebtoken')
const jwtd = require('jwt-decode')

router.get("/", (req, res) => {
    res.send("We are the Users!");
});

router.post("/signin", async (req, res) => {
    const vUser = await User.findOne({ username: req.body.username }).exec()
    var bool = await vUser.validatePassword(req.body.password)
    if (vUser.isActivated) {
        if (bool) {
            const un = vUser.username
            jwt.sign({user: un}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' }, (err, token) => {
                res.json({
                    token: token,
                    message: "Erfolgreicher SignIn von " + req.body.username
                });
            })
        } else {
                res.json({ message: "Fehler! Passwort falsch!" });
            }
    } else {
            res.json({ message: "Fehler! Nutzer nicht aktiviert!" });
        }

    })

router.post("/signup", async (req, res) => {
    const vUser = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    })
    try {
        await vUser.save()
            .then(res.json({ message: "Erfolgreich Registriert!" }))
    } catch (e) {
        res.json({ message: e })
    }
})

const verifyJWT = (req, res) => {
    const token = req.headers["x-access-token"]
    if(!token) {
        res.send("Token fehlt")
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decoded) =>{
            if(err) {
                if(err instanceof jwt.TokenExpiredError) {
                    res.json({login: false, exp: true})
                }
                res.json({login: false, exp:false})
                console.log(err);
            } else {
                res.json({login: true, exp: false})
            }
        })
    }
}

router.get("/isLoggedIn", verifyJWT, async (req,res) => {
    const token = jwtd(req.body.tok)
    console.log(token)
})

module.exports = router;