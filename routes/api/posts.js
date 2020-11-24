const express = require('express');
const router = express.Router();


// @router  GET api/post
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;