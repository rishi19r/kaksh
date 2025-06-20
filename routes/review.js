const express = require('express')
const router = express.Router({mergeParams:true})
const Review = require('../model/review')
const wrapAsync = require('../error/wrapAsync')
const ExpressError = require('../error/ExpressError')
const { reviewSchema } = require('../error/joischema')
const kaksh = require('../model/roomSchema')
const {isLoggedin,isReviewAuthor} = require('../middleware/middleware')

const validatereview = (req,res,next)=>{
    const{error} = reviewSchema.validate(req.body);
    if(error){
      const msg = error.details.map(el=>el.message)
      throw new ExpressError(msg,404)
    }else{
      next();
    }
  }


  router.post('/',isLoggedin,validatereview,wrapAsync(async(req,res)=>{
    const kakshs =await kaksh.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    kakshs.reviews.push(review)
    await review.save()
    await kakshs.save()
    res.redirect(`/kaksh/${kakshs._id}`)
  }))
  
  router.delete('/:reviewId',isLoggedin,isReviewAuthor,wrapAsync(async(req,res)=>{
   const {id,reviewId} = req.params;
   await kaksh.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
   await Review.findByIdAndDelete(reviewId)
   res.redirect(`/kaksh/${id}`)
  }))

  module.exports = router;
