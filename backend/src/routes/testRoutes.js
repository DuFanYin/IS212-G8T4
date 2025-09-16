const express = require('express');
const router = express.Router();
const { testHello } = require('../controllers/testController');

router.get('/hello', testHello);

module.exports = router;
