const mongoose = require("mongoose")

const UserGroupSchema = mongoose.Schema({
    groupshort: {
        type: String
    },
    grouplong: {
        type: String
    }
})

module.exports = mongoose.model('UserGroup', UserGroupSchema)