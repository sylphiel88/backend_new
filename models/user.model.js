const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    userName: {
        type: String,
        
    },
});

module.exports = model('User', UserSchema)