const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")


// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}))

/* Require all the routes here*/
const authRouter = require("./routes/authRoutes")
const interviewRouter = require("./routes/interviewRoutes")

/* using all the routes here*/
 app.use("/api/auth",authRouter)
 app.use("/api/interview",interviewRouter)


module.exports = app