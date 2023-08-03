const knex = require("../database/knex")

class NotesController {
    async create(req, res) {
        const { title, description, rate, tags } = req.body
        const { user_id } =  req.params

        const [note_id] = await knex("notes").insert({
            title,
            description,
            rate,
            user_id
        })

        const tagsInsert = tags.map(tag_name => {
            return {
                note_id,
                user_id,
                tag_name
            }
        })

        await knex("tags").insert(tagsInsert)

        res.json()

    }

    async show(req, res) {
        const { id } = req.params

        const note = await knex("notes").where({ id }).first()
        const tags = await knex("tags").where({ note_id: id }).orderBy("tag_name")

        return res.json({
            ...note,
            tags
        })

    }

    async delete(req, res) {
        const { id } = req.params

        await knex("notes").where({ id }).delete()

        return res.json()
    }

    async index(req, res) {
        const { title, user_id } = req.query

        const notes = await knex("notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title")

        return res.json(notes)
    }
}

module.exports = NotesController