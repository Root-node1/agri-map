const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Firebase authentication
router.post('/firebase/register', authController.firebaseRegister);
router.post('/firebase/login', authController.firebaseLogin);

// Traditional authentication (backward compatibility)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
