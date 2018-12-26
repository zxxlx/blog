const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')

const app = express()

// 设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为ejs
app.set('view engine', 'ejs')

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))

// session 中间件
app.use(session({
  name: config.session.key, // 设置cookie中保存session id的字段名称
  secret: config.session.secret, // 通过设置secret 来计算hash值并放在cookie中，使产生的signedCookie 防篡改
  resave: true, // 强制更新session
  saveUninitialized: false, // 设置为false，强制创建一个session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge // 设置过期时间，过期后cookie中的session id自动删除
  },
  store: new MongoStore({ // 将session存储到MongoDB
    url: config.mongodb // mongodb 地址
  })
}))

// flash中间件，用来显示通知
app.use(flash())

app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

app.use(function (req, res, next) {
  console.log(`req----------------------`, req)
  // console.log(`res---------------------`, res)
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// 路由
routes(app)

app.listen(config.port, function () {
  console.log(`${pkg.name} listening on port ${config.port}`)
})
