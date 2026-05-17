const multer = require("multer")


const upload = multer({
    storage: multer.memoryStorage(),
    limits:{
        fileSize:3*1024*1024 //The size of file is 3MB
    }
}) 


module.exports = upload