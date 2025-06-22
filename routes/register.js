const express = require('express')
const router = express.Router()
const passport = require('passport')
const passportLocal = require('passport-local')
const User = require('../model/user')
const {returnstoreTo} = require('../middleware/middleware')
router.get('/register',(req,res)=>{
    res.render('users/register')
})

router.post('/register',async(req,res,next)=>{
  try{
    const {cname,contact,email,username,password} = req.body;
    const user = new User({cname,contact,email,username})
    const registerUser = await User.register(user,password)
  req.logIn(registerUser,err=>{
    if(err) return next(err)
      req.flash('success','Welcome to the Kaksh')
    res.redirect('/kaksh')
  })
}catch(e){
   req.flash('error',e.message)
   res.redirect('/register')
}
})

router.get('/login',(req,res)=>{
  res.render('users/login')
})

router.post(
  '/login',
  returnstoreTo,
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        // Redirect with alert message in query
        return res.redirect('/login?error=Invalid username or password');
      }

      // Login user
      req.logIn(user, (err) => {
        if (err) return next(err);
        const redirectUrl = res.locals.returnTo || '/kaksh';
        return res.redirect(redirectUrl);
      });
    })(req, res, next);
  }
);
router.post(
  '/login',
  returnstoreTo,
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        // Redirect with alert message in query
        return res.redirect('/login?error=Invalid username or password');
      }

      // Login user
      req.logIn(user, (err) => {
        if (err) return next(err);
        const redirectUrl = res.locals.returnTo || '/kaksh';
        return res.redirect(redirectUrl);
      });
    })(req, res, next);
  }
);







router.get('/logout',(req,res,next)=>{
  req.logOut(function (err){
    if(err) return next(err)
      req.flash('success','Successfully Logged Out')
      res.redirect('/kaksh')
  })

})

module.exports = router;