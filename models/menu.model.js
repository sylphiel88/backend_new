const mongoose = require('mongoose')

const MenuSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    menu: {
        mainv: {
            type: String,
            required: true
        },
        mainvk: {
            type: String,
            required: true
        },
        soupv: {
            type: String,
            required: true
        },
        soupvk: {
            type: String,
            required: true
        },
        dessert: {
            type: String,
            required: true
        },
    }
});

module.exports = mongoose.model('menu', MenuSchema,'menu');