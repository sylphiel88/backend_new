const express = require("express");
const Menu = require("../models/menu.model")

const router = express.Router();

router.get("/", async (req, res)=>{
    try {
        const menu = await Menu.find().limit(5).sort({date: 1}).exec();
        res.json(menu)
    } catch(err) {
        res.json({ message: err });
    }
});

router.post("/", async (req,res)=>{
    const menu = new Menu({
        menu: {
            mainv: req.body.mainv,
            mainvk: req.body.mainvk,
            soupv: req.body.soupv,
            soupvk: req.body.soupvk,
            dessert: req.body.dessert
        }
    });
    try{
        const savedMenu = await menu.save();
        res.json(savedMenu);
    } catch(err) {
        res.send(err);
    }
});

router.post("/update", async(req,res)=>{
    const vk = req.body.vk
    const vg = req.body.vg
    const date=req.body.date
    const svk=req.body.svk
    const svg=req.body.svg
    const dessert=req.body.dessert
    await Menu.updateOne({date: date},{date:date, menu:{mainvk: vk, mainv:vg, soupvk:svk, soupv:svg, dessert:dessert}}).exec();
    res.json({msg: "update erfolgreich"})
})

module.exports = router;