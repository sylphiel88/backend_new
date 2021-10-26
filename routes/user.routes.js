const express = require("express");
const User = require('../models/user.model')
const router = express.Router();
const jwt = require('node-jsonwebtoken')
const jwtd = require('jwt-decode')
const UserGroup = require('../models/usergroup.model');

router.get("/", (req, res) => {
    res.send("We are the Users!");
});

router.post("/signin", async (req, res) => {
    const vUser = await User.findOne({ username: req.body.username }).exec()
    var bool = await vUser.validatePassword(req.body.password)
    if (vUser.isActivated && !vUser.isDeleted) {
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
    let isDel = false;
    let isExist = false;
    try {
        const luUser = User.findOne({ username: req.body.username }).exec()
        isExist = true;
        isDel = luUser.isDeleted
        msg = !isDel ? "Nutzername bereits vorhanden!" : "Nutzer wurde gelöscht. Bitte Administrator kontaktieren!";
        res.json({ message: message })
    } catch (e) {
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
    }
})

router.post("/activateUser", async (req, res) => {
    let un = req.body.username;
    const aUser = await User.findOne({ username: un }).exec()
    if (!aUser.isDeleted) {
        await User.updateOne({ username: un }, { isActivated: true }).exec()
    }
    res.json({ msg: "erfolg" })
})

router.post("/deleteUser", async (req, res) => {
    let un = req.body.username;
    await User.updateOne({ username: un }, { isDeleted: true }).exec()
    res.json({ msg: "erfolg" })
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


router.get("/isLoggedIn", (req, res) => {
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
})

router.get("/usergroup", async (req, res) => {
    const UserGroup = require('../models/usergroup.model')
    const user = req.headers.user
    try {
        if (user != "") {
            const fUser = await User.findOne({ username: user }).exec()
            const userGroup = await UserGroup.findOne({ groupshort: fUser.userGroup }).exec()
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

router.get("/notactivatedusers", async (req, res) => {
    const page = parseInt(req.query.page)
    const perPage = parseInt(req.query.perPage)
    const search = req.query.search;
    let naUsers;
    console.log(perPage, page, search)
    try {
        if (search != "") {
            const unquery = new RegExp(search, 'i')
            naUsers = await User.find({ isActivated: false, isDeleted: false, username: unquery }).limit(perPage).skip((page - 1) * perPage).sort({ username: 1 });
        } else {
            naUsers = await User.find({ isActivated: false, isDeleted: false }).limit(perPage).skip((page - 1) * perPage).sort({ username: 1 });
        }
        res.json(naUsers)
    }
    catch (e) {
        res.json({ msg: "fehler" })
    }
})

router.get("/getCountUsers", async (req, res) => {
    let perPage = req.query.perPage
    const search = req.query.search;
    const unquery = new RegExp(search, 'i')
    let gotPages
    let results = []
    if (search != "") {
        results = await User.count({ isActivated: false, username: unquery }).then(results => gotPages = Math.floor((results - 1) / perPage) + 1)
    } else {
        results = await User.count({ isActivated: false }).then(results => gotPages = Math.floor((results - 1) / perPage) + 1)
    }
    if (gotPages == 0) {
        gotPages = 1
        results = 0
    }
    res.json({ pages: gotPages, userCount: results })
})

module.exports = router;