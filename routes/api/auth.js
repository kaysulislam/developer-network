const express = require('express');
const router = express.Router();

// USE THE MIDDLEWARE
const auth = require('../../middleware/auth');

// Bring the USER model
const User = require('../../models/User');

// @route       GET api/auth
// @desc        Test route
// @access      Public

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); //since we passed req.user = decoded.user in the auth.js (middleware), it has id
    res.json(user);
  } catch (err) {
    console.err(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
