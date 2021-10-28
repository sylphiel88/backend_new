const express = require("express");
const router = express.Router();
const City = require('../models/city.model')
const Department = require('../models/department.model')
const Classes = require('../models/classes.model')

router.get('/',(req,res)=>{
    res.send("we are the classes")
})

router.post('/city',async(req,res)=>{
    const cs=req.body.cs;
    const cl=req.body.cl;
    const cn = new City({nameShort:cs, nameLong:cl});
    try{
        await cn.save()
        .then(()=>{res.json({msg:cn.nameLong})});
    } catch(e){

    }
})

router.post('/department',async(req,res)=>{
    const ds=req.body.ds;
    const dl=req.body.dl;
    const dn = new Department({nameShort:ds, nameLong:dl});
    try{
        await dn.save()
        .then(()=>{res.json({msg:dn.nameLong})});
    } catch(e){

    }
})

router.post('/class',async(req,res)=>{
    const cs=req.body.cs;
    const ds=req.body.ds;
    const ns=req.body.ns;
    const city = await City.findOne({nameShort:cs}).exec()
    const department = await Department.findOne({nameShort:ds}).exec()
    const newCl = await new Classes({year: Date.now(),num:ns});
    newCl.city=city
    newCl.department=department
    try{
        await newCl.save()
        .then(()=>{res.json({msg:newCl.nameLong})});
    } catch(e){
        res.json({error:e})
    }
})

router.get('/getAllClasses', async (req,res)=>{
    const classes = await Classes.find({}).populate('city').populate('department').exec()
    res.json({classes: classes})
})

router.get('/getAllDepartments', async(req,res)=>{
    const deps = await Department.find({},'nameLong').exec()
    res.json({deps:deps})
})

module.exports = router;