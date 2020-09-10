const express = require('express');
const router = express.Router();
//for encrypting the password
const bcrypt = require('bcryptjs');

// jwt webtoken for the AUTH-TOKEN
const jwt = require('jsonwebtoken');
const config = require('config'); //to get the 'jwtsecret' token from the ./config/default.json

// VALIDATION OF THE USER ID, NAME, PASSWORD
// ********************
// for the validation
// express validator
const { check, validationResult } = require('express-validator');

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

// @route       POST api/auth
// @desc        Authenticate user & get token
// @access      Public

// EXPRESS is handling/routing the POST request to api/users
// ********************
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please is required').exists(),
  ],
  // VALIDATION
  // ********************
  async (req, res) => {
    const errors = validationResult(req); // Validating the name, email, password
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // sending the error in a formatted way if not VALIDATED
    }

    const { email, password } = req.body; // Parsing the req.body into the separate variables

    try {
      // CHECKING IF USER EXISTS
      // ********************
      // See if the user exists in the DATABASE
      // Dealing with the email
      let user = await User.findOne({ email }); //could have written email:email, since email variable exists, we skipped that
      if (!user) {
        // This will send Msg if user already exists
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
      // Dealing with the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // JWT WEBTOKEN
      // ********************
      // Return jsonwebtoken

      const payload = {
        user: {
          id: user.id, // WE CAN USE 'id' instead of '_id' as described in mongoDB
        },
      };

      // why jwtToken??;
      // we will reduce the time during deploying, 360000 is for the testing
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      //not necessary as we are dealing with jwt web-token
      //res.send('User Registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
