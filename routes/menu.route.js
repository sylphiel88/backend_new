const express = require("express");
const Menu = require("../models/menu.model")

const router = express.Router();

router.get("/", async (req, res)=>{
    try {
        const menu = await Menu.find().limit(5);
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

module.exports = router;