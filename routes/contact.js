const express = require('express')
const router = express.Router({mergeParams:true})
const wrapAsync = require('../error/wrapAsync')
const ExpressError = require('../error/ExpressError')

router.get('/contact',(req,res,next)=>{
    res.render('kaksh/contact')
})

module.exports = router;



