const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @router  GET api/users
// @desc    Test route
// @access  Public
// router.get('/', (req, res) => res.send('Users route'));


// @router  POST api/users
// @desc    Register User
// @access  Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(), //check for empty string
    check('email', 'Please include a valid email').isEmail(), // email validation
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })// check min length
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    
    try {
        // See if User exists
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ errors: [ {msg: 'User already exists'} ] })
        }

         // Get user gravatar
        const avatar = gravatar.url(email, {
            s: '800', // size
            r: 'pg', // check for bad/ R content
            d: 'mm' // default image
        })

        user = new User({ //user instance
            name,
            email,
            avatar,
            password
        })       

        // Ecrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // save the user
        await user.save();

        // Return JWT
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 11 * 100000 }, // optional
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }

})

module.exports = router;