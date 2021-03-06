const express = require('express');
const router = express.Router();

// for the token, we need to bring the auth middleware
const auth = require('../../middleware/auth');

// post request that takes in data
const { check, validationResult } = require('express-validator');

// need to bring the Profile model to pass in the router.get
const Profile = require('../../models/Profile');
const User = require('../../models/User');
// @route       GET api/profile/me (since we want to see the profile that's in the token (from the auth middleware),,,api/profile shows all profiles)
// @desc        Get current users profile
// @access      Private

// we need to add the 'auth' as a 2nd parameter to the routes we want to protect
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']); // we will bring the 'name' and 'avatar' from the user

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       POST api/profile
// @desc        Create or Update user profile
// @access      Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // build profile object
    const profileFields = {};

    // fill each field one by one before submitting to the DB
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    // build social object
    // because this is already an object
    profileFields.social = {}; // if we don't initialize it first, it will throw error that profileFields.social is undefined
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    // update and insert data
    try {
      let profile = await Profile.findOne({ user: req.user.id }); //user holds the id; now match it with id from the token

      //UPDATE if a profile is found
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ); // find it with user: req.user.id // set the profileFields
        return res.json(profile);
      }

      // CREATE if a profile is not-found
      profile = new Profile(profileFields);
      // SAVE the profile
      await profile.save();
      // return the CREATED Profile
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }

    res.send('Hellow');
  }
);

module.exports = router;
