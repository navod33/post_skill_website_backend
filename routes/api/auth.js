const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../../models/user')
const bcrypt = require('bcryptjs');

router.get('/', auth, async (req, res) => {
    try{

        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    }catch(err) {
        console.log(err.message);
        res.status(500).send('server Error');
    }
});



// @route    POST api/Auth
// @desc     authenticate user
// @access   Public
router.post(
    '/',
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password'
    ).exists(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {  email, password } = req.body;
  
      try {
        let user = await User.findOne({ email });
  
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'innvalid credentiol' }] });
        }


    const isMatch = await bcrypt.compare(password, user.password);  
        if(!isMatch){
            return res
            .status(400)
            .json({ errors: [{ msg: 'innvalid credentiol' }] });
        }

  
        const payload = {
          user: {
              id:user.id
          }
        }
  
        //jwt token 
        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: '5 days' },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
  
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );


module.exports = router;  