const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite
const restService = require('../services/restService.js')


const pageLimit = 10

let restController = {
    getRestaurants: (req, res) => {
        restService.getRestaurants(req, res, (data) => {
            return res.render('restaurants', data)
        })
    },
    getRestaurant: (req, res) => {
        restService.getRestaurant(req, res, (data) => {
            return res.render('restaurant', data)
        })
    },
    getFeeds: (req, res) => {
        return Restaurant.findAll({
          limit: 10,
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          include: [Category]
        }).then(restaurants => {
          Comment.findAll({
            limit: 10,
            raw: true,
            nest: true,
            order: [['createdAt', 'DESC']],
            include: [User, Restaurant]
          }).then(comments => {
            return res.render('feeds', {
              restaurants: restaurants,
              comments: comments
            })
          })
        })
      },
      getDashboard: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category,
                { model: Comment, include: [User] }
            ]
        }).then(restaurant => {
            
            restaurant.viewCounts += 1
            restaurant.save()
                .then(restaurant => {
                    return res.render('dashboard', {
                        restaurant: restaurant.toJSON()
                    })
                })
        })
    },
    getTopRestaurant: (req, res) => {
        return Restaurant.findAll({
            include: [
                { model: User, as: 'FavoritedUsers'}
            ],
        }).then(restaurants => {
            restaurants = restaurants.map(restaurant => ({
                ...restaurant.dataValues,
                description: restaurant.description.substring(0, 50),
                isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(restaurant.id),
                FavoriteCount: restaurant.FavoritedUsers.length
            }))
            restaurants = restaurants.sort((a, b) => b.FavoriteCount - a.FavoriteCount).slice(0, 10)
            console.log(restaurants[0])
            return res.render('topRestaurants', {
                restaurants
            })
        })
    }
}

module.exports = restController