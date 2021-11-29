const express = require('express');
const Menu = require('../models/menu.model');
const ReportMeal = require('../models/reportMeal.model');
const moment = require('moment');
const { json } = require('body-parser');

const router = express.Router();

router.get('/', (req, res) => {
	res.send('We are the reported Meals');
});

router.post('/clsReportedMeals', async (req, res) => {
	const cls = req.body.cls;
	var datex = moment().subtract('1', 'days');
	datex.hour(23);
	datex.minute(59);
	datex.second(59);
	await ReportMeal.deleteMany({ date: { $lte: datex } });
	var date = moment();
	date.hour(0);
	date.minute(0);
	date.second(0);
	try {
		if (cls != '') {
			const clsReportedMeals = await ReportMeal.findOne({ class: cls, date: { $gte: date } });
			if (clsReportedMeals != null) {
				const vk = clsReportedMeals.vkMeal;
				const vg = clsReportedMeals.vgMeal;
				const sp = clsReportedMeals.soup;
				const sa = clsReportedMeals.salad;
				const ds = clsReportedMeals.dessert;
				res.json({ vk: vk, vg: vg, sp: sp, sa: sa, ds: ds, err: false });
			} else {
				res.json({ err: true });
			}
		}
	} catch (e) {
		console.log(e);
	}
});

router.post('/reportMealsOfClass', async (req, res) => {
	const cls = req.body.cls;
	const vk = req.body.vk;
	const vg = req.body.vg;
	const sp = req.body.sp;
	const sa = req.body.sa;
	const ds = req.body.ds;
	console.log(cls, vk, vg, sp, sa, ds);
	var datex = moment().subtract('1', 'days');
	datex.hour(23);
	datex.minute(59);
	datex.second(59);

	await ReportMeal.deleteMany({ date: { $lte: datex } });

	var repMeal = null;
	var upd = null;

	var datet = moment();
	datet.hour(0);
	datet.minute(0);
	datet.second(0);

	try {
		const clsReportedMeals = await ReportMeal.findOne({ class: cls, date: { $gte: datet } });
		console.log(clsReportedMeals);
		if (clsReportedMeals != null) {
			repMeal = await ReportMeal.findOneAndUpdate(
				{ class: cls, $gte: { date: datet } },
				{ vkMeal: vk, vgMeal: vg, soup: sp, salad: sa, dessert: ds }
			);
			upd = true;
		} else {
			repMeal = await new ReportMeal({
				class: cls,
				vkMeal: vk,
				vgMeal: vg,
				soup: sp,
				salad: sa,
				dessert: ds
			}).save();
			upd = false;
		}
	} catch (e) {
		console.log(e);
	}
	console.log(repMeal, upd);
	res.json({ erg: repMeal, upd: upd });
});

module.exports = router;
