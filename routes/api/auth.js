const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @router  GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  POST api/auth
// @desc    Authenticate User & get token
// @access  Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(), // email validation
    check('password', 'Password is required.').exists()// check min length
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    try {
        // Check if User exists
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        // compare entered password and the hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

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