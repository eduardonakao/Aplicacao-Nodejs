const { hash, compare } = require("bcrypt")
const AppError = require("../utils/AppError.js")
const sqliteConnection = require("../database/sqlite")

class UsersController {
    async create(req, res) {
        const { name, email, password } = req.body
        const database = await sqliteConnection()
        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?) OR name = (?)", [email, name])

        if(checkUserExists) {
            throw new AppError("nome ou email já cadastrado")
        }

        if(!name || !email || !password) {
            throw new AppError("Digite um nome, email e senha")
        }

        const hashedPassword = await hash(password, 8)

        await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword])

        return res.status(201).json()

    }

    async update(req, res) {
        const { name, email, password, old_password } = req.body
        const { id } = req.params

        const database = await sqliteConnection()
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

        if(!user) {
            throw new AppError("Usuário não encontrado")
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("Email já cadastrado")
        }

        user.name = name ?? user.name
        user.email = email ?? user.email

        if(password && !old_password) {
            throw new AppError("você precisa informar a senha antiga")
        }

        if(password && old_password) {
            const checkOldPassword = await compare(old_password, user.password)
            const checkNewPassword = await compare(password, user.password)

            console.log(checkOldPassword)

            if(!checkOldPassword) {
                throw new AppError("A senha antiga não confere")
            }

            if(checkNewPassword){
                throw new AppError("Não pode ser a mesma senha")
            }

            user.password = await hash(password, 8)
        }

        await database.run(`
            UPDATE users SET
            name = ?,
            email = ?,
            password = ?,
            updated_at = DATETIME('now')
            WHERE id = ?`,
            [user.name, user.email, user.password, id]
            )

            return res.json()

    }
}

module.exports = UsersController