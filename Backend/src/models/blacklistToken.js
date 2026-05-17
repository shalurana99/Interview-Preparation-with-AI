const mongoose = require("mongoose")
const { applyTimestamps } = require("./userModels")

const blacklistTokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required to be added in blacklist"]
    },
},{
    timestamps:true
})

const blacklistTokenModel = mongoose.model("blacklistToken", blacklistTokenSchema)

module.exports = blacklistTokenModel

