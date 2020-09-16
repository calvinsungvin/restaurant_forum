const express = require('express')
const handlebars = require('express-handlebars')
const db = require('./models')
const app = express()
const bodyParser = require('body-parser') 
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const passport = require('./config/passport')
const port = process.env.PORT || 3000

app.engine('handlebars', handlebars({ 
    defaultLayout: 'main',
    helpers: require('./config/handlebars-helpers')
 }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({ 
    secret: 'secret', 
    resave: false, 
    saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))


app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success_messages')
    res.locals.error_messages = req.flash('error_messages')
    res.locals.user = req.user
    next()
  })




app.listen(port, () => {
    
    console.log(`Example app listening on port ${port}`)
})

// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require('./routes')(app, passport)