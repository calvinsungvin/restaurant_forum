const fs = require('fs')
const bcrypt = require('bcryptjs') 
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const Restaurant = db.Restaurant
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const userService = require('../services/userService.js')



const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password){
        req.flash('error_messages', 'different passwords!')
        return res.redirect('/signup')
    } else {
        User.findOne({ where: {email: req.body.email}}).then(user => {
            if (user){
                req.flash('error_messages', 'repeated email address!')
                return res.redirect('/signup')
            } else {
                User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
                }).then(user => {
                    req.flash('success_messages', 'successfully registered!')
                    return res.redirect('/signin')
                })
            }
        })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
 
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
 
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      return res.render('users/profile', data)
    })
},
  editUser: (req, res) => {
    // return User.findByPk(req.params.id)
    //   .then(user => {
    //     return res.render('editProfile')
    //   })
    res.render('editProfile')
  },
  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data['status'] === 'success') {
        req.flash('success_messages', data['message'])
      }
      return res.redirect(`/users/${req.params.id}`)
    })
  },
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      return res.redirect('back')
     })
   },
   
   removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      return res.redirect('back')
      })
   },

   addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      return res.redirect('back')
    })
   },

   removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => {
      return res.redirect('back')
    })
   },
   getTopUser: (req, res) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      // 整理 users 資料
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      return res.redirect('back')
     })
   },
   
   removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      return res.redirect('back')
      })
   }
}

module.exports = userController