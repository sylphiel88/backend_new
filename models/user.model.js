const mongoose = require('mongoose')

SALT_WORK_FACTOR = 10
const bcrypt = require("bcrypt")

var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};


const UserSchema = mongoose.Schema({
    username: {
        type: String,
        minlength: [3, "Nutzername muss mindestens 3 Zeichen haben! Eingegeben wurden {VALUE}"],
        required: [true, "Kein Nutzername angegeben!"],
        unique: [true, "Nutzername bereits vorhanden!"]
    },
    password: {
        type: String,
        minlength: [3, "Passwort muss mindestens 3 Zeichen haben!"],
        required: [true, "Kein Passwort angegeben!"]
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: [true, "E-Mail Addresse schon vorhanden!"],
        required: [true, 'Email Addresse benötigt!'],
    },
    isActivated: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    resetToken: {
        type: String,
    },
    userGroup: {
        type: String,
        default: "doz"
    },
    img: {
        data: Buffer,
        contentType: String
    },
    hasImg: {
        type: Boolean,
        default:false
    }
});

UserSchema.pre('save', async function save(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

UserSchema.methods.validatePassword = async function validatePassword(data) {
    return bcrypt.compare(data, this.password);
};

module.exports = mongoose.model('user', UserSchema,'user')