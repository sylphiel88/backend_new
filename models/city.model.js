const mongoose = require('mongoose')

const CitySchema = mongoose.Schema({
    nameShort:{
        type: String,
        minlength:1,
        maxlength:2
    },
    nameLong:{
        type: String,
    }
});

module.exports = mongoose.model('city', CitySchema,'city');