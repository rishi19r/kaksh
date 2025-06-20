const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../model/user');
const Kaksh = require('../model/roomSchema');
const {isLoggedin,isAuthor} = require('../middleware/middleware')
router.get('/profile', isLoggedin,async (req, res) => {
  try {
    const userId = req.user._id; 
    const user = await User.findById(userId);
    const rooms = await Kaksh.find({ author: userId });

    res.render('./profile/profile', { user, rooms });

  } catch (e) {
    console.error(e);
    req.flash('error', 'Cannot load profile');
    res.redirect('/');
  }
});
module.exports = router;

