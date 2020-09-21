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
    }
}

module.exports = categoryService