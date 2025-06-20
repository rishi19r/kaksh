const express = require('express')
const router = express.Router({mergeParams:true})
const wrapAsync = require('../error/wrapAsync')
const ExpressError = require('../error/ExpressError')
const { joiSchema,reviewSchema } = require('../error/joischema')
const kaksh = require('../model/roomSchema')
const {isLoggedin,isAuthor} = require('../middleware/middleware')
const {storage} = require('../cloudinary')
const multer = require('multer')
const cloudinary = require('cloudinary')
const upload = multer({storage})
const validatekaksh = (req,res,next)=>{
  const {error} = joiSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el=>el.message).join(',');
    throw new ExpressError(msg,404)
  }else{
  next();
}
}



 
router.get('/', wrapAsync(async (req, res) => {
  const { location, price, roomSize, peopleCanStay } = req.query;
  let query = {};

  if (location) {
    query.area = { $regex: location, $options: 'i' };
  }

  if (price) {
    if (price === 'lt5000') query.rent = { $lt: 5000 };
    else if (price === '5000-10000') query.rent = { $gte: 5000, $lte: 10000 };
    else if (price === 'gt10000') query.rent = { $gt: 10000 };
  }

  if (roomSize) {
    query.roomSize = roomSize;
  }

  if (peopleCanStay) {
    if (peopleCanStay === '5+') {
      query.peopleCanStay = { $gte: 5 };
    } else {
      query.peopleCanStay = parseInt(peopleCanStay);
    }
  }

  const rooms = await kaksh.find(query);
  res.render('kaksh/index', { rooms, query: req.query });
}));






router.get('/new',isLoggedin,(req,res)=>{
  res.render('kaksh/new')
})




router.post('/', isLoggedin, upload.array('kaksh[images]'), validatekaksh, wrapAsync(async (req, res, next) => {
  const rooms = new kaksh(req.body.kaksh);
  rooms.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  rooms.author = req.user._id;
  await rooms.save();
  res.redirect('/kaksh');
}));


router.get('/:id',wrapAsync(async(req,res)=>{
  const {id} = req.params;
  const rooms = await kaksh.findById(id).populate({path:'reviews',
    populate:{
      path:'author'
    }
  }).populate('author')
  if (!rooms) {
    throw new ExpressError('Room not found', 404);
  }
  res.render('kaksh/show',{rooms})
}))

router.get('/:id/edit',isLoggedin,wrapAsync(async(req,res)=>{
  const {id} = req.params
  const kakshs = await kaksh.findById(id)
 res.render('kaksh/update' , {kakshs})
}))

router.put('/:id', isLoggedin, isAuthor, upload.array('kaksh[images]'), wrapAsync(async (req, res) => {
  const { id } = req.params;
  const kakshs = await kaksh.findByIdAndUpdate(id, { ...req.body.kaksh }, { new: true });
  const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  kakshs.images.push(...images);
  if (req.body.deleteImage) {
    for (let filename of req.body.deleteImage) {
      await cloudinary.uploader.destroy(filename); 
    }
    await kakshs.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImage } } } });
  }

  await kakshs.save();
  res.redirect(`/kaksh/${kakshs._id}`);
}));


router.delete('/:id',isLoggedin,isAuthor,wrapAsync(async(req,res)=>{
  const {id} = req.params;
  const kakshs = await kaksh.findByIdAndDelete(id,{...req.body.kaksh})
  res.redirect('/kaksh')
}))

module.exports = router;
