const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
//for encrypting the password
const bcrypt = require('bcryptjs');
// for the validation
// express validator
const { check, validationResult } = require('express-validator');
// to work with the user info, we need the models
const User = require('../../models/User');

// @route       POST api/users
// @desc        Register user
// @access      Public

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if the user exists
      let user = await User.findOne({ email }); //could have written email:email, since email variable exists, we skipped that

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // encrypt the password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt); //takes in plain text 'password' and 'salt'; this encrypt the user.password and return a promise

      await user.save();

      // Return jsonwebtoken
      res.send('User Registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
