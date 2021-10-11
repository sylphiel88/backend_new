const express = require("express");
const User = require('../models/user.model')
const router = express.Router();
const jwt = require('node-jsonwebtoken')
const jwtd = require('jwt-decode')
const UserGroup = require('../models/usergroup.model')
router.get("/", (req, res) => {
    res.send("We are the Users!");
});

router.post("/signin", async (req, res) => {
    const vUser = await User.findOne({ username: req.body.username }).exec()
    var bool = await vUser.validatePassword(req.body.password)
    if (vUser.isActivated) {
        if (bool) {
            const un = vUser.username
            jwt.sign({ user: un }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' }, (err, token) => {
                res.json({
                    authorization: token,
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
    const token = req.headers.authorization
    if (token === undefined) {
        res.json({ login: false, exp: false, msg: "Token fehlt!  " })
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    res.json({ login: false, exp: true, dec: "" })
                }
                res.json({ login: false, exp: false, dec: "" })
            } else {
                res.json({ login: true, exp: false, dec: decoded.user })
            }
        })
    }
}


router.get("/isLoggedIn", verifyJWT, (req, res) => {
    console.log("hallo");
    const token = req.headers.authorization
    const un = jwtd(token, process.env.ACCESS_TOKEN_SECRET)
    console.log(res)
})

router.get("/usergroup", async (req, res) => {
    var ObjectId = (require('mongoose').Types.ObjectId);
    const UserGroup = require('../models/usergroup.model')
    const user = req.headers.user
    try {
        if (user != "") {
            const fUser = await User.findOne({ username: user }).exec()
            const userGroup = await UserGroup.findOne({groupshort: fUser.userGroup}).exec()
            res.json({
                ug: userGroup.grouplong
            })
        } else {
            res.json({
                ug: ""
            })
        }
    } catch (e) {
        console.log(e);
    }
})
module.exports = router;