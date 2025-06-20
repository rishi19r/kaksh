if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}

const express = require('express')
const server = express();
const path = require('path')
const sanitizeV5 = require('./utils/mongoSanitizev5');
const dbUrl = process.env.DBUrl
server.use(express.json())
server.set('views', path.join(__dirname,'views'))
server.use(express.static('public'));
server.set('view engine', 'ejs')
server.set('query parser', 'extended');
server.use(sanitizeV5({ replaceWith: '_' }));


server.use(express.urlencoded({extended:true}))
const methodoverride = require('method-override')
server.use(methodoverride('_method'))
const mongoose = require('mongoose')
const User = require('./model/user')
const ejsmate = require('ejs-mate')
server.engine('ejs',ejsmate)
const passport = require('passport');
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const store = MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/kaksh',
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on('error',function(e){
  console.log('Session Error',e)
})

const sessionConfig = {
  store: store,
  secret:'sessionscrete',
  resave:false,
  saveUninitialized: false,
  Cookie:{
    httpOnly:true,
    maxAge: 1000*60*60*24*7
  }
}
server.use(session(sessionConfig))
server.use(passport.initialize())
server.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
server.use(flash())

server.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next();
})

const reviewRoute = require('./routes/review')
const kakshRoute = require('./routes/kaksh');
const registerRouter = require('./routes/register')
const profileRouter = require('./routes/profile')
const aboutRouter = require('./routes/about')
const contactRouter = require('./routes/contact')


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/kaksh')
  .then(data=>{
    console.log('dbs starts..')
  })
  .catch(err=>{
    console.log(err)
  })
}

server.use('/kaksh',kakshRoute)
server.use('/kaksh/:id/review',reviewRoute)
server.use('/',registerRouter)
server.use('/',profileRouter)
server.use('/',aboutRouter)
server.use('/',contactRouter)




server.all(/(.*)/,(req,res,next)=>{
 next(new ExpressError('product not found!',404))
})

server.use((err,req,res,next)=>{
  const { statusCode = 500,message = 'not found'} = err;
  res.status(statusCode).render('error',{err})

})

server.listen(3000,()=>{
  console.log('server starts...')
})
