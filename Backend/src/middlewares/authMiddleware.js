const jwt = require("jsonwebtoken")
const blacklistTokenModel = require("../models/blacklistToken")


async function authUsers(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not provided"
        })
    }
        const isTokenblacklist = await blacklistTokenModel.findOne({
            token
        })

        if(isTokenblacklist){
            return res.status(401).json({
                message:"Token is invalid"
            })
        }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()
    } 
    
    catch (err) {
        return res.status(401).json({
            message: "Inavlid token"
        })
    }
}

module.exports = {
    authUsers
}