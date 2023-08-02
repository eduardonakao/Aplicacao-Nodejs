require("express-async-errors")

const migrationsRun = require("./database/sqlite/migrations")
const AppError = require("./utils/AppError")
const express = require("express")
const routes = require("./routes")

const app = express()
app.use(express.json())
app.use(routes)

migrationsRun()

app.use((error, req, res, next) => {
    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message
        })
    }

    console.error(error)

    return res.status(500).json({
        status: 500,
        message: "Internal Server Error"
    })
})

const PORT = 3333
app.listen(PORT, () => console.log(`Server is running on ${PORT}`))