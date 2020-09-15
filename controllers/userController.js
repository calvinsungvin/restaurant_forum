const fs = require('fs')
const bcrypt = require('bcryptjs') 
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = 'e7b642f2d94bb82'


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
    return User.findByPk(req.user.id, {
        include: [
            Comment,
            { model: Comment, include: [Restaurant] }
        ]
    }).then(user => {
        return res.render('userProfile', { user: user.toJSON() })
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
    if (!req.body.name) {
      req.flash('error_messages', 'name did not exist')
      return res.reditect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : null
            }).then(user => {
              req.flash('success_messages', 'user info is now updated!')
              res.redirect(`/users/${user.id}`)
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            image: user.image
          }).then(user => {
            req.flash('success_messages', 'user info is now updated!')
            res.redirect(`/users/${user.id}`)
          })
        })
    }
  }
}

module.exports = userController