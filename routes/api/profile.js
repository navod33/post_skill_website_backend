const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile');
const User = require('../../models/user');
const { async } = require('rxjs');
const { check, validationResult } = require('express-validator');
const { buildConnector } = require('undici-types');



// @route GET api/profile/me
router.get('/me', auth, async (req, res) => {
     try{

        const pofile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

        if(!profile){
            return res.status(400).send('no profiles forr this user');
        }


     }catch{
        console.error(err.message);
        res.status(500).send('server error');
     }
});


// @route GET api/profile
//create or update user profiles
// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
    '/',
    auth,
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skills is required').notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // destructure the request
      const {
        website,
        skills,
        company,
        youtube,
        twitter,
        instagram,
        linkedin,
        location,
        facebook,
        bio,
        githubusername,
    
      } = req.body;
  
      // build a profile

      const profileFields = {};
      profileFields.user = req.user.id;
      if(company) profileFields.company = company;
      if(website) profileFields.website = website;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(company) profileFields.company = company;
      if(githubusername) profileFields.githubusername = githubusername;
      if(skills) {
        profileFields.company = skills.split(',').map(skill => skill.trim());
      }

    //   const profileFields = {
    //     user: req.user.id,
    //     website:
    //       website && website !== ''
    //         ? normalize(website, { forceHttps: true })
    //         : '',
    //     skills: Array.isArray(skills)
    //       ? skills
    //       : skills.split(',').map((skill) => ' ' + skill.trim()),
    //     ...rest
    //   };
  
      // Build socialFields object

        profileFields.social = {};
      if(youtube) profileFields.social.youtube = youtube;
      if(twitter) profileFields.social.twitter = twitter;
      if(facebook) profileFields.social.facebook = facebook;
      if(linkedin) profileFields.social.linkedin = linkedin;
 

      try{
        let profile = await Profile.findOne({ user: req.user.id });

        if(profile){
            //update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields},
                { new: true }
                );
                return res.json(profile);
        }

        //create
        profile = new Profile(profileFields);
        await profile.Save();
        res.json(Profile)

      }catch{
        console.error(err.message);
        return res.status(500).send('Server Error');
      }

    //   const socialFields = { youtube, twitter, instagram, linkedin, facebook };
  
    //   // normalize social fields to ensure valid url
    //   for (const [key, value] of Object.entries(socialFields)) {
    //     if (value && value.length > 0)
    //       socialFields[key] = normalize(value, { forceHttps: true });
    //   }
    //   // add to profileFields
    //   profileFields.social = socialFields;
  
    //   try {
    //     // Using upsert option (creates new doc if no match is found):
    //     let profile = await Profile.findOneAndUpdate(
    //       { user: req.user.id },
    //       { $set: profileFields },
    //       { new: true, upsert: true, setDefaultsOnInsert: true }
    //     );
    //     return res.json(profile);
    //   } catch (err) {
    //     console.error(err.message);
    //     return res.status(500).send('Server Error');
    //   }
    }
  );
  


// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  

  // @route    GET api/profile/user/:user_id
  // @desc     Get profile by user ID
  // @access   Public
  router.get(
    '/user/:user_id',
    checkObjectId('user_id'),
    async ( req, res ) => {
      try {
        const profile = await Profile.findOne({
          user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
  
        if (!profile) return res.status(400).json({ msg: 'Profile not found' });
  
        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );


  // @route    remove api/profile/user/:user_id
  // @access   private
  router.delete(
    '/user/:user_id',
    checkObjectId('user_id'),
    async ( req, res ) => {
      try {
         await Profile.findOneAndDelete({user: req.user.id});
         await user.findOneAndDelete({user: req.user.id});  
        return res.json({msg : 'user removed'});

      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );


// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
    '/experience',
    auth,
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } 
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body;

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      }

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );


// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });
    
    //Get remove index
    const removeIndex =  foundProfile.experience.map(item => item.id).indexOf(req.params.exp_id);
    foundProfile.experience.splice(removeIndex, 1);
    await foundProfile.save();

    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});



// @route    PUT api/profile/education
// @desc     Add profile experience
// @access   Private
router.put(
    '/education',
    auth,
    check('school', 'school is required').notEmpty(),
    check('degree', 'degree is required').notEmpty(),
    check('fieldofstudy', 'field of study is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } 
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;

      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      }

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newEdu);
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );


// @route    DELETE api/profile/experience/:edu_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });
    
    //Get remove index
    const removeIndex =  foundProfile.education.map(item => item.id).indexOf(req.params.edu_id);
    foundProfile.education.splice(removeIndex, 1);
    await foundProfile.save();
    
    return res.status(200).json(foundProfile);  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});




























module.exports = router;