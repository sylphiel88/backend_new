const mongoose = require('mongoose')

const DozentSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'classes'
    }],
    departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department'
    }] 
});

module.exports = mongoose.model('dozent', DozentSchema,'dozent');