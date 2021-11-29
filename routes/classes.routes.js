const express = require('express');
const router = express.Router();
const City = require('../models/city.model');
const Department = require('../models/department.model');
const Classes = require('../models/classes.model');
const Dozent = require('../models/dozent.model');
const User = require('../models/user.model');
const moment = require('moment');
const { ObjectID } = require('mongodb');

router.get('/', (req, res) => {
	res.send('we are the classes');
});

router.post('/city', async (req, res) => {
	const cs = req.body.cs;
	const cl = req.body.cl;
	const cn = new City({ nameShort: cs, nameLong: cl });
	try {
		await cn.save().then(() => {
			res.json({ msg: cn.nameLong });
		});
	} catch (e) {}
});

router.post('/department', async (req, res) => {
	const ds = req.body.ds;
	const dl = req.body.dl;
	const dn = new Department({ nameShort: ds, nameLong: dl });
	try {
		await dn.save().then(() => {
			res.json({ msg: dn.nameLong });
		});
	} catch (e) {}
});

router.post('/departmentD', async (req, res) => {
	const ds = req.body.ds;
	var dId = Department.findOne({ nameShort: ds }, '_id');
	dId = dId._id;
	Classes.deleteMany({ departments: dId });
	Dozent.updateMany({ $in: { departments: dId } }, { $pull: { departments: dId } });
	await Department.deleteOne({ nameShort: ds });
	res.end();
});

router.post('/departmentDel', async (req, res) => {
	var dep = req.body.dep;
	var doc = req.body.doc;
	var docId = await User.findOne({ username: doc }, '_id');
	docId = docId._id;
	var depId = await Department.findOne({ nameLong: dep }, '_id');
	depId = depId._id;
	await Dozent.updateOne({ userId: docId }, { $pull: { departments: depId } });
	res.end();
});

router.post('/departmentUpd', async (req, res) => {
	const dep = req.body.dep;
	const doc = req.body.doc;
	var docId = await User.findOne({ username: doc }, '_id');
	docId = docId._id;
	var depId = await Department.findOne({ nameLong: dep }, '_id');
	depId = depId._id;
	await Dozent.updateOne({ userId: docId }, { $push: { departments: depId } });
	res.end();
});

router.post('/class', async (req, res) => {
	const cs = req.body.cs;
	const ds = req.body.ds;
	const ns = req.body.ns;
	const pn = req.body.pn;
	const y = parseInt(req.body.y) + 2000;
	var city = await City.findOne({ nameShort: cs }, '_id');
	city = city._id;
	var department = await Department.findOne({ nameShort: ds }, '_id');
	department = department._id;
	const newCl = await new Classes({
		year: new Date(y.toString() + '-01-01T00:00:00.000+00:00'),
		num: ns,
		city: city,
		department: department,
		part: pn
	});
	newCl.save();
	num = parseInt(ns) + 1;
	res.json({ num: num });
});

router.post('/classD', async (req, res) => {
	const cs = req.body.cs;
	const ds = req.body.ds;
	const ns = req.body.ns;
	const y = parseInt(req.body.y) + 2000;
	const city = await City.findOne({ nameShort: cs });
	const department = await Department.findOne({ nameShort: ds });
	const firstDay = new Date(y.toString() + '-01-01T00:00:00.000+00:00');
	const lastDay = new Date(y.toString() + '-12-31T23:59:59.999+00:00');
	await Classes.deleteOne({
		city: { $in: city },
		department: { $in: department },
		year: {
			$gte: firstDay,
			$lt: lastDay
		},
		num: { $in: ns }
	});
	res.json({ num: ns });
});

router.post('/classU', async (req, res) => {
	const id = req.body.id;
	const part = req.body.part;
	await Classes.updateOne({ _id: id }, { $set: { part: part } });
});

router.get('/getAllClasses', async (req, res) => {
	const classes = await Classes.find({}).populate('city').populate('department').exec();
	res.json({ classes: classes });
});

router.post('/getAllDepartments', async (req, res) => {
	var page = req.body.page;
	var depArr = [];
	const deps = await Department.find({}, 'nameLong').limit(6).skip((page - 1) * 6);
	const depNum = await Department.find({}, 'nameLong').count();
	var pages = Math.floor((depNum - 1) / 6) + 1;
	deps.map((x) => {
		depArr.push(x.nameLong);
	});
	res.json({ deps: depArr, pages: pages });
});

router.get('/getAllDepartmentsX', async (req, res) => {
	var depArr = [];
	const deps = await Department.find({}, 'nameLong');
	deps.map((x) => {
		depArr.push(x.nameLong);
	});
	res.json({ deps: depArr });
});

router.get('/getAllDepartmentsS', async (req, res) => {
	var depArr = [];
	const deps = await Department.find({}, 'nameShort');
	deps.map((x) => {
		depArr.push(x.nameShort);
	});
	res.json({ deps: depArr });
});

router.post('/getAllDepartmentsSP', async (req, res) => {
	const skip = req.body.skipDeps;
	var depArr = [];
	const deps = await Department.find({}, 'nameShort').limit(8).skip(skip);
	const num = await Department.find({}, 'nameShort').count();
	deps.map((x) => {
		depArr.push(x.nameShort);
	});
	res.json({ deps: depArr, num: num });
});

router.get('/getAllCitysS', async (req, res) => {
	var cityArr = [];
	const citys = await City.find({}, 'nameShort').exec();
	citys.map((x) => {
		cityArr.push(x.nameShort);
	});
	res.json({ citys: cityArr });
});

router.get('/getDocents', async (req, res) => {
	var docArr = [];
	await Dozent.find({}).populate('departments').populate('userId').exec().then((res) => {
		res.map((x) => {
			const un = x.userId.username;
			const id = x.userId._id;
			docArr.push({ un: un, id: id });
		});
	});
	res.json({ docs: docArr });
});

router.post('/getDepsClasses', async (req, res) => {
	var clsNL = [];
	var clsIds = [];
	const deps = req.body.deps;
	const pageDep = req.body.page;
	const depIds = await Department.find({ nameLong: { $in: deps } });
	const classes = await Classes.find({ department: { $in: depIds } })
		.limit(6)
		.skip((pageDep - 1) * 6)
		.populate('city')
		.populate('department');
	const numDeps = await Classes.where({ department: { $in: depIds } }).count();
	const pages = Math.floor((numDeps - 1) / 6) + 1;
	classes.forEach((x) => {
		const year = moment(x.year).format('YY');
		var num = x.num.toString();
		num = num.length == 1 ? '0' + num : num;
		clsNL.push(x.department.nameShort + '-' + x.city.nameShort + '-' + year + '-' + num);
		clsIds.push(x._id);
	});
	res.json({ classes: clsNL, ids: clsIds, pages: pages });
});

router.post('/getDepsClassesP', async (req, res) => {
	var clsNL = [];
	var clsIds = [];
	const dep = req.body.dep;
	const skipCls = req.body.skipCls;
	const depId = await Department.findOne({ nameShort: { $in: dep } });
	const classes = await Classes.find({ department: { $in: depId } })
		.limit(8)
		.skip(skipCls)
		.populate('city')
		.populate('department');
	const num = await Classes.where({ department: { $in: depId } }).count();
	classes.forEach((x) => {
		const year = moment(x.year).format('YY');
		var num = x.num.toString();
		num = num.length == 1 ? '0' + num : num;
		clsNL.push(x.department.nameShort + '-' + x.city.nameShort + '-' + year + '-' + num);
		clsIds.push(x._id);
	});
	res.json({ classes: clsNL, ids: clsIds, num: num });
});

router.post('/getAllNums', async (req, res) => {
	var numArr = [];
	var dep = req.body.dep;
	var town = req.body.town;
	var year = parseInt(req.body.year) + 2000;
	var depId = await Department.findOne({ nameShort: dep }, '_id');
	console.log(depId);
	if (depId != null) {
		depId = depId._id;
		var tId = await City.findOne({ nameShort: town });
		tId = tId._id;
		const firstDay = new Date(year.toString() + '-01-01T00:00:00.000+00:00');
		const lastDay = new Date(year.toString() + '-12-31T23:59:59.999+00:00');
		var num = await Classes.find(
			{
				city: { $in: tId },
				department: { $in: depId },
				year: {
					$gte: firstDay,
					$lt: lastDay
				}
			},
			'num'
		);
		num.forEach((n) => numArr.push(n.num));
		res.json({ nums: numArr });
	}
});

router.get('/getAllClassesNL', async (req, res) => {
	var clsNL = [];
	var clsIds = [];
	const classes = await Classes.find({}).populate('city').populate('department');
	classes.forEach((x) => {
		const year = moment(x.year).format('YY');
		var num = x.num.toString();
		num = num.length == 1 ? '0' + num : num;
		clsNL.push(
			x.department != null ? x.department.nameShort + '-' + x.city.nameShort + '-' + year + '-' + num : null
		);
		x.department != null ? clsIds.push(x._id) : null;
	});
	res.json({ classes: clsNL, ids: clsIds });
});

router.post('/getDocentsDepartments', async (req, res) => {
	const un = req.body.un;
	if (un != '') {
		var depArr = [];
		const fUser = await User.findOne({ username: un }, '_id').exec();
		const userId = fUser._id;
		await Dozent.findOne({ userId: userId })
			.populate([ { path: 'departments', model: 'department' } ])
			.exec()
			.then((res) => res.departments.map((x) => depArr.push(x.nameLong)));
		res.json({ deps: depArr });
	} else {
		res.json([]);
	}
});

router.post('/getDocentsFromDep', async (req, res) => {
	const dep = req.body.dep;
	var docArr = [];
	var depId = await Department.findOne({ nameLong: dep }, '_id').exec();
	const cls = await Dozent.find({ departments: depId._id })
		.populate([ { path: 'userId', model: 'user' } ])
		.exec()
		.then((res) => {
			res.map((x) => docArr.push(x.userId.username));
		});
	res.json({ doc: docArr });
});

router.post('/getClassesOfDocent', async (req, res) => {
	const doz = req.body.username;
	if (doz != '') {
		var classArr = [];
		var classIds = [];
		var dozId = await User.findOne({ username: doz }, '_id');
		dozId = dozId._id;
		var classes = await Dozent.findOne({ userId: dozId }, 'classes').populate([
			{
				path: 'classes',
				populate: [ { path: 'city', model: 'city' }, { path: 'department', model: 'department' } ]
			}
		]);
		classes = classes.classes;
		classes.forEach((klasse) => {
			var year = moment(klasse.year).format('YY');
			var num = klasse.num.toString().length == 1 ? '0' + klasse.num.toString() : klasse.num.toString();
			var nameLong =
				klasse.department != null
					? klasse.department.nameShort + '-' + klasse.city.nameShort + '-' + year + '-' + num
					: null;
			classArr.push(nameLong);
			classIds.push(klasse._id);
		});
	}
	res.json({ classN: classArr, classIds: classIds });
});

router.post('/classDel', async (req, res) => {
	var clsId = req.body.cls;
	var doc = req.body.doc;
	var docId = await User.findOne({ username: doc }, '_id');
	docId = docId._id;
	await Dozent.updateOne({ userId: docId }, { $pull: { classes: clsId } });
	res.end();
});

router.post('/classUpd', async (req, res) => {
	var clsId = req.body.cls;
	var doc = req.body.doc;
	var docId = await User.findOne({ username: doc }, '_id');
	docId = docId._id;
	await Dozent.updateOne({ userId: docId }, { $push: { classes: clsId } });
	res.end();
});

router.post('/getNum', async (req, res) => {
	const town = req.body.town;
	const dep = req.body.dep;
	var year = req.body.year;
	year = parseInt(year) + 2000;
	var townId = await City.findOne({ nameShort: town }, '_id');
	townId = townId._id;
	var depId = await Department.findOne({ nameShort: dep }, '_id');
	if (depId != null) {
		depId = depId._id;
		const firstDay = new Date(year.toString() + '-01-01T00:00:00.000+00:00');
		const lastDay = new Date(year.toString() + '-12-31T23:59:59.999+00:00');
		var num = await Classes.find({
			city: { $in: townId },
			department: { $in: depId },
			year: {
				$gte: firstDay,
				$lt: lastDay
			}
		})
			.sort({ num: -1 })
			.limit(1);
		const numb = num.length > 0 ? num[0].num + 1 : 1;
		res.json({ num: numb });
	}
});

router.post('/getClassParts', async (req, res) => {
	const id = req.body.clsId;
	if (typeof id != 'undefined' && id != '') {
		const cls = await Classes.findOne({ _id: id }, 'part');
		res.json({ anz: cls.part });
	}
});

module.exports = router;
