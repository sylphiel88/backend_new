const mongoose = require('mongoose')

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};


const UserSchema = mongoose.Schema({
    userName: {
        type: String,
        minlength: 3,
        required: true
    },
    password: {
        type: String,
        miinlength: 3,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    isActivated: {
        type: Boolean,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        required: true
    }
});

module.exports = model('User', UserSchema)