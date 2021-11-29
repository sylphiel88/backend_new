const mongoose = require('mongoose')

const ClassesSchema = mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'department'
    },
    city: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'city'
    },
    year: {
        type: Date,
        default: Date.now()
    },
    num: {
        type: Number,
        default: 1
    },
    part: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('classes', ClassesSchema,'classes');