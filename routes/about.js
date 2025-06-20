const express = require('express')
const router = express.Router({mergeParams:true})
const wrapAsync = require('../error/wrapAsync')
const ExpressError = require('../error/ExpressError')

router.get('/about',(req,res,next)=>{
    res.render('kaksh/about')
})

module.exports = router;