const express = require("express");
const router = express.Router();
const User = require('../models/user.model')
const jwt = require('node-jsonwebtoken')
const fs = require('fs')
const upload = require('../middleware/upload');
const Dozent = require('../models/dozent.model');
const Classes = require("../models/classes.model");
const Department = require("../models/department.model")

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
            email: req.body.email,
            userGroup: req.body.usergr
        })
        try {
            await vUser.save()
                .then(res.json({ message: "Erfolgreich Registriert!" }))
            if (vUser.userGroup == "doz") {
                var depId = await Department.findOne({nameLong:req.body.dep},'_id').exec()
                depId = depId._id
                const newDoz = new Dozent({departments:[depId]})
                newDoz.userId = vUser
                await newDoz.save()
            }
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

router.get("/getUserData", async (req, res) => {
    const UserGroup = require('../models/usergroup.model')
    const user = req.headers.user
    try {
        if (user != "") {
            const fUser = await User.findOne({ username: user }).exec()
            const userGroup = await UserGroup.findOne({ groupshort: fUser.userGroup }).exec()
            res.json({
                ug: userGroup.grouplong,
                email: fUser.email
            })
        } else {
            res.json({
                ug: "",
                email: ""
            })
        }
    } catch (e) {
        console.log(e);
    }
})

router.get("/getEmail", async (req, res) => {
    const user = req.headers.user
    try {
        if (user != "") {
            const email = await User.findOne({ username: user }, 'email').exec()
            res.json({
                email: email
            })
        } else {
            res.json({
                email: ""
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

router.get("/getProfilePic", (req, res) => {
    const un = req.query.username;
    User.findOne({ username: un }, 'hasImg img', function (err, img) {
        if (err)
            res.json(err)
        if (img.hasImg) {
            res.contentType('json');
            res.send(img);
        } else {
            res.json({ noPic: true })
        }
    })
})

router.post('/uploadProfilepic', upload.single('filename'), async (req, res, next) => {
    const cont = 'image/jpg';
    const data = fs.readFileSync('./uploads/' + req.file.filename)
    const un = req.body.username;
    const resu = await User.updateOne({ username: un }, { img: { data: data, contentType: cont }, hasImg: true })
    res.json({ msg: "Hurra", res: resu })
});

router.get('/deleteProfilepic', async (req, res) => {
    await User.updateOne({ username: req.query.username }, { img: { data: "", contentType: "" }, hasImg: false })
    res.json({ msg: "hurra" })
})

router.post('/addClassToDoz', async (req, res) => {
    const dozId = req.body.dozId
    const classId = req.body.classId
    const fUser = await User.findById(dozId).exec()
    const fclass = await Classes.findById(classId).exec()
    const fDoz = await Dozent.findOne({ userId: fUser }).exec()
    console.log(fclass, fDoz, fUser);
    fDoz.classes.push(fclass)
    await fDoz.save()
    res.json({ class: fDoz.class })
})


router.get('/getAllDocents', async (req, res) => {
    const dozenten = await Dozent.find({nameShort: 'ST'}).populate([{ path: 'classes', model: 'classes', populate: [{ path: 'city', model: 'city' }, { path: 'department', model: 'department' }] }, { path: 'userId', model: 'user' }]).where('dozenten.classes.department.nameShort').equals('ST').exec()
    res.json({ dozenten: dozenten})
})
module.exports = router;