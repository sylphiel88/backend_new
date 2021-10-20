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
            jwt.sign({ user: un }, process.env.ACCESS_TOKEN_SECRET, {}, (err, token) => {
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

router.post("/activateUser", async(req,res)=> {
    let un = req.body.username;
    await User.updateOne({username: un}, {isActivated: true}).exec()
    res.json({msg: "erfolg"})
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
    const token = req.headers.authorization
    const un = jwtd(token, process.env.ACCESS_TOKEN_SECRET)
    console.log(res)
})

router.get("/usergroup", async (req, res) => {
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

router.get("/notactivatedusers", async(req,res) => {
    let page=parseInt(req.query.page)
    let perPage=parseInt(req.query.perPage)
    const naUsers = await User.find({ isActivated: false }).limit(perPage).skip((page-1)*perPage).sort({username: 1});
    res.json(naUsers)
})

router.get("/getCountUsers",async(req,res)=> {
    let perPage=req.query.perPage
    let results = await User.count({ isActivated: false }).then(results => gotPages = Math.floor((results-1)/perPage)+1)
    res.json({pages: gotPages, userCount: results})
})

module.exports = router;