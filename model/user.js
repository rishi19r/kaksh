const mongoose = require('mongoose')
const passportlocalmongoose = require('passport-local-mongoose')

const userSchema =new mongoose.Schema({
    cname:{
        type:String,
        required:true
    },
    contact:{
        type:Number,
        required:true
    },
    email:{
     type:String,
     required:true
    }
})
userSchema.plugin(passportlocalmongoose)
const User = mongoose.model('User',userSchema)

module.exports = User;