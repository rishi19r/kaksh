const mongoose = require('mongoose')
const Review = require('./review')
const mongooseSchema = new mongoose.Schema({
    address:String,
    contact:String,
    owner:String,
    rent:Number,
    images:[
        {
        url:String,
        filename:String
    }
],
    rules:[String],
    area:String,
    roomSize:String,
    peopleCanStay:Number,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Review'
    }]
})

mongooseSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

const kaksh = mongoose.model('kaksh',mongooseSchema)

module.exports = kaksh;