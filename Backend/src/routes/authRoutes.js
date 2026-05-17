const {Router} = require("express")
const authControllers = require("../controllers/authControllers")
const authMiddleware = require("../middlewares/authMiddleware")

const authRouter = Router()

/**
 * @routes POST api/auth/register
 * @description register a new user
 * @access public
 */

authRouter.post("/register",authControllers.registerUserController)

/**
 * @routes POST api/auth/login
 * @description login a user with email & password
 * @access public
 */

authRouter.post("/login",authControllers.loginUserController)

/**
 * @routes POST api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */

authRouter.get("/logout", authControllers.logoutUserController)

/**
 * @routes GET api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */

authRouter.get("/get-me", authMiddleware.authUsers, authControllers.getMeController)

module.exports = authRouter
