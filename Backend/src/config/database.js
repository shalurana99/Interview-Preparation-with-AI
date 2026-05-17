const mongoose = require("mongoose")

function connectToDb(){
    mongoose.connect(process.env.MONGO_DB)

    .then(()=>{
        console.log("Server is connected to DB")
    })
    .catch(()=>{
        console.log("Server is not connecetd to DB")
    })
}

module.exports = connectToDb