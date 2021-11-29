const mongoose = require('mongoose')

const ReportMealSchema = mongoose.Schema({
    date:{
        type: mongoose.Schema.Types.Date,
        default: Date.now
    },
    class:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'classes'
    },
    vgMeal: {
        type: mongoose.Schema.Types.Number,
        default: 0
    },
    vkMeal: {
        type: mongoose.Schema.Types.Number,
        default: 0
    },
    soup: {
        type: mongoose.Schema.Types.Number,
        default: 0
    },
    salad: {
        type: mongoose.Schema.Types.Number,
        default: 0
    },
    dessert: {
        type: mongoose.Schema.Types.Number,
        default: 0
    }
});

module.exports = mongoose.model('reportMeal', ReportMealSchema,'reportMeal');