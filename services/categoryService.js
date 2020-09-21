const db = require('../models')
const Category = db.Category

const categoryService = {
    getCategories: (req, res, callback) => {
        return Category.findAll({ raw: true, nest: true })
            .then(categories => {
                if (req.params.id) {
                    Category.findByPk(req.params.id, {raw: true, nest: true })
                        .then(category => {
                            callback({ category, categories })
                        })
                } else {
                    callback({ categories })
                }
            })
    },
    postCategory: (req, res, callback) => {
        if (!req.body.name) {
            callback({ status: 'error', message: 'name did not exist' })
        } else {
            return Category.create({
                name: req.body.name
            }).then((category) => {
                callback({ status: 'success', message: 'category successfully created' })
            })
        }
    }
}

module.exports = categoryService