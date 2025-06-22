module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You have Signed in First')
       return res.redirect('/login?error=You have Signed in First')
    }
    next()
}

module.exports.returnstoreTo = (req,res,next)=>{
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo
    }
    next()
}
const rooms = require('../model/roomSchema')
const review = require('../model/review')
module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const Rooms = await rooms.findById(id);
    if(!Rooms.author.equals(req.user._id)){
        req.flash('error', 'you does not have permission')
       return res.redirect(`/kaksh/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} =  req.params;
   
    const reviews = await review.findById(reviewId);
    if(!reviews.author.equals(req.user._id)){
        req.flash('error','you does not have permission')
        return res.redirect(`/kaksh/${id}`)
    }
next()
}