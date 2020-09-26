const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
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

// IMPORTING THE User Schema of the Database, this will later create a new User with the defined schema
// ********************
// to work with the user info, we need the models
const User = require('../../models/User');

// @route       POST api/users
// @desc        Register user
// @access      Public

// EXPRESS is handling/routing the POST request to api/users
// ********************
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  // VALIDATION
  // ********************
  async (req, res) => {
    const errors = validationResult(req); // Validating the name, email, password
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // sending the error in a formatted way if not VALIDATED
    }

    const { name, email, password } = req.body; // Parsing the req.body into the separate variables

    try {
      // CHECKING IF USER EXISTS
      // ********************
      // See if the user exists in the DATABASE
      let user = await User.findOne({ email }); //could have written email:email, since email variable exists, we skipped that

      if (user) {
        // This will send Msg if user already exists
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      // CREATING AVATAR FOR THE USER
      // ********************
      // get users gravatar with 'gravatar'
      const avatar = gravatar.url(email, {
        s: '200', // size of the avatar
        r: 'pg', // not any weird pic
        d: 'mm', // associated avatar with the email/anonymous one
      });

      // CREATING User with the new values
      // ********************
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // PASSWORD ENCRYPTION
      // ********************
      // encrypt the password with 'bcrypt'
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt); //takes in plain text 'password' and 'salt'; this encrypt the user.password and return a promise

      // SAVE THE new USER into the Database
      // ********************
      await user.save();

      // JWT WEBTOKEN
      // ********************
      // Return jsonwebtoken

      const payload = {
        user: {
          id: user.id, // WE CAN USE 'id' instead of '_id' as described in mongoDB; when user is saved in the DB, it generates _id in the server
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
