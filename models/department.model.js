const mongoose = require('mongoose')

const DepartmentSchema = mongoose.Schema({
    nameShort: {
        type: String,
        minlength:2,
        maxlength:2
    },
    nameLong: {
        type: String,
    }
});

module.exports = mongoose.model('department', DepartmentSchema,'department');