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

router.post('/login',returnstoreTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),
(req,res)=>{
  req.flash('success','Welcome back')
  const redirectUrl  = res.locals.returnTo || '/kaksh'
  res.redirect(redirectUrl)
}
)

router.get('/logout',(req,res,next)=>{
  req.logOut(function (err){
    if(err) return next(err)
      req.flash('success','Successfully Logged Out')
      res.redirect('/kaksh')
  })

})

module.exports = router;