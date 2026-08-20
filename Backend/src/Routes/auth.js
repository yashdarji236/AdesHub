import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Register Route
router.post('/register', registerUser);

// Login Route
router.post('/login', loginUser);

// User Profile / Hydration Routes
router.get('/me', verifyToken, getMe);
router.get('/get-me', verifyToken, getMe);

export default router;
