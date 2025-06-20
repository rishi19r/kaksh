const joi = require('joi')
module.exports.joiSchema = joi.object({
    kaksh:joi.object({
    address:joi.string().required(),
    contact:joi.number().required(),
    owner:joi.string().required(),
    rent:joi.number().required(),
    rules:joi.string().required(),
    area:joi.string().required(),
    roomSize:joi.string().required(),
    peopleCanStay:joi.string().required()
    }).required(),
    deleteImage:joi.array()
})


module.exports.reviewSchema = joi.object({
    review:joi.object({
        rating:joi.number().required(),
        comment:joi.string().required()
    }).required()
})