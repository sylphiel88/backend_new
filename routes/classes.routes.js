const express = require("express");
const router = express.Router();
const City = require('../models/city.model')
const Department = require('../models/department.model')
const Classes = require('../models/classes.model')
const Dozent = require('../models/dozent.model');
const User = require('../models/user.model')
const moment = require('moment');
const { deepmerge } = require("@mui/utils");

router.get('/', (req, res) => {
    res.send("we are the classes")
})

router.post('/city', async (req, res) => {
    const cs = req.body.cs;
    const cl = req.body.cl;
    const cn = new City({ nameShort: cs, nameLong: cl });
    try {
        await cn.save()
            .then(() => { res.json({ msg: cn.nameLong }) });
    } catch (e) {

    }
})

router.post('/department', async (req, res) => {
    const ds = req.body.ds;
    const dl = req.body.dl;
    const dn = new Department({ nameShort: ds, nameLong: dl });
    try {
        await dn.save()
            .then(() => { res.json({ msg: dn.nameLong }) });
    } catch (e) {

    }
})

router.post('/departmentDel', async(req,res)=>{
    var dep = req.body.dep
    var doc = req.body.doc
    var docId = await User.findOne({username:doc},"_id")
    docId = docId._id
    var depId = await Department.findOne({nameLong:dep},"_id")
    depId = depId._id
    await Dozent.updateOne({userId:docId}, {$pull: {departments:depId}})
    res.end()
})

router.post('/departmentUpd', async(req, res)=>{
    const dep = req.body.dep
    const doc = req.body.doc
    var docId = await User.findOne({username:doc},"_id")
    docId = docId._id
    var depId = await Department.findOne({nameLong:dep},"_id")
    depId = depId._id
    await Dozent.updateOne({userId:docId}, {$push: {departments:depId}})
    res.end()
})

router.post('/class', async (req, res) => {
    const cs = req.body.cs;
    const ds = req.body.ds;
    const ns = req.body.ns;
    const city = await City.findOne({ nameShort: cs }).exec()
    const department = await Department.findOne({ nameShort: ds }).exec()
    const newCl = await new Classes({ year: Date.now(), num: ns });
    newCl.city = city
    newCl.department = department
    try {
        await newCl.save()
            .then(() => { res.json({ msg: newCl.nameLong }) });
    } catch (e) {
        res.json({ error: e })
    }
})

router.get('/getAllClasses', async (req, res) => {
    const classes = await Classes.find({}).populate('city').populate('department').exec()
    res.json({ classes: classes })
})

router.get('/getAllDepartments', async (req, res) => {
    var depArr = []
    const deps = await Department.find({}, 'nameLong').exec()
    deps.map(x => { depArr.push(x.nameLong) })
    res.json({ deps: depArr })
})

router.get('/getDocents', async (req, res) => {
    var docArr = []
    await Dozent.find({}).populate('departments').populate('userId').exec()
        .then(res => {
            res.map(x => {
                const un = x.userId.username
                const id = x.userId._id
                docArr.push({ un: un, id: id });
            })
        })
    res.json({ docs: docArr });
})

router.post('/getDepsClasses', async (req, res) => {
    var clsNL = []
    var clsIds = []
    const deps = req.body.deps
    const depIds = await Department.find({ 'nameLong': { $in: deps } });
    const classes = await Classes.find({ 'department': { $in: depIds } }).populate('city').populate('department');
    classes.forEach(x => {
        const year = moment(x.year).format('YY')
        var num = x.num.toString()
        num = num.length == 1 ? "0" + num : num
        clsNL.push(x.department.nameShort + "-" + x.city.nameShort + "-" + year + "-" + num)
        clsIds.push(x._id)
    })
    res.json({ classes: clsNL, ids: clsIds})
})

router.post('/getDocentsDepartments', async (req, res) => {
    const un = req.body.un
    if (un != "") {
        var depArr = []
        const fUser = await User.findOne({ username: un }, "_id").exec()
        const userId = fUser._id
        await Dozent.findOne({ userId: userId }).populate([{ path: "departments", model: "department" }]).exec()
            .then(res => res.departments.map(x => depArr.push(x.nameLong)))
        res.json({ deps: depArr })
    } else {
        res.json([])
    }
})

router.post('/getDocentsFromDep', async (req, res) => {
    const dep = req.body.dep
    var docArr = []
    var depId = await Department.findOne({ "nameLong": dep }, '_id').exec()
    const cls = await Dozent.find({ "departments": depId._id }).populate([{ path: "userId", model: "user" }]).exec()
        .then(res => { res.map(x => docArr.push(x.userId.username)) });
    res.json({ doc: docArr })
})

router.post('/getClassesOfDocent', async (req, res) => {
    const doz = req.body.username
    if (doz != "") {
        var classArr = []
        var classIds = []
        var dozId = await User.findOne({ username: doz }, '_id')
        dozId = dozId._id
        var classes = await Dozent.findOne({ userId: dozId }, 'classes').populate([{ path: "classes", populate: [{ path: "city", model: "city" }, { path: "department", model: "department" }] }])
        classes = classes.classes
        classes.forEach(klasse => {
            var year = moment(klasse.year).format("YY")
            var num = klasse.num.toString().length == 1 ? "0" + klasse.num.toString() : klasse.num.toString()
            var nameLong = klasse.department.nameShort + "-" + klasse.city.nameShort + "-" + year + "-" + num
            classArr.push(nameLong)
            classIds.push(klasse._id)
        });
    }
    res.json({ classN: classArr, classIds: classIds })
})

router.post('/classDel', async(req,res)=>{
    var clsId = req.body.cls
    var doc = req.body.doc
    var docId = await User.findOne({username:doc},"_id")
    docId = docId._id
    await Dozent.updateOne({userId:docId}, {$pull: {classes:clsId}})
    res.end()
})

router.post('/classUpd', async(req,res)=>{
    var clsId = req.body.cls
    var doc = req.body.doc
    var docId = await User.findOne({username:doc},"_id")
    docId = docId._id
    await Dozent.updateOne({userId:docId}, {$push: {classes:clsId}})
    res.end()
})


module.exports = router;