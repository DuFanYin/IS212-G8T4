const express = require('express');
const router = express.Router();
const { login, registerWithInvitation, requestPasswordReset, resetPassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', registerWithInvitation);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
