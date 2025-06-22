
  require('dotenv').config();



const express = require('express');
const path = require('path');
const sanitizeV5 = require('./utils/mongoSanitizev5');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./model/user');
const ExpressError = require('./error/ExpressError');





const reviewRoute = require('./routes/review');
const kakshRoute = require('./routes/kaksh');
const registerRouter = require('./routes/register');
const profileRouter = require('./routes/profile');
const aboutRouter = require('./routes/about');
const contactRouter = require('./routes/contact');

const dbUrl = process.env.DBUrl || 'mongodb://127.0.0.1:27017/kaksh';


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl)
    .then(() => {
      console.log('✅ MongoDB connected');
    })
    .catch(err => {
      console.log('❌ MongoDB connection error:', err);
    });
}

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static('public'));
server.use(methodOverride('_method'));
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs');
server.engine('ejs', ejsMate);
server.set('query parser', 'extended');
server.use(sanitizeV5({ replaceWith: '_' }));
const helmet = require("helmet");

server.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "https://cdn.jsdelivr.net", // Allow Bootstrap JS
          "'unsafe-inline'" // Optional: only if you're using inline scripts
        ],
        "style-src": [
          "'self'",
          "https://cdn.jsdelivr.net", // Allow Bootstrap CSS
          "'unsafe-inline'" // Allow inline styles (needed for Bootstrap sometimes)
        ],
        "img-src": [
          "'self'",
          "data:",
          "https://res.cloudinary.com" // Allow Cloudinary images
        ],
        "font-src": ["'self'", "https://cdn.jsdelivr.net"],
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "frame-src": ["'none'"]
      }
    }
  })
);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: 'thisshouldbeabettersecret!'
  }
});

store.on('error', function (e) {
  console.log('❌ Session store error:', e);
});

const sessionConfig = {
  store,
  secret: 'sessionscrete',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 
  }
};

server.use(session(sessionConfig));
server.use(flash());


server.use(passport.initialize());
server.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


server.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


server.get('/', (req, res) => {
  res.render('kaksh/home'); // This will load views/home.ejs
});

server.use('/kaksh', kakshRoute);
server.use('/kaksh/:id/review', reviewRoute);
server.use('/', registerRouter);
server.use('/', profileRouter);
server.use('/', aboutRouter);
server.use('/', contactRouter);



server.all('*', (req, res, next) => {
  next(new ExpressError('Page not found!', 404));
});


server.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  res.status(statusCode).render('error', { err });
});

const PORT = process.env.PORT || 3000;


server.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
