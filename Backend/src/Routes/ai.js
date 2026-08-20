import express from 'express';
import { generateAdImage } from '../controllers/ai.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Generate image from prompt
router.post('/generate-image', verifyToken, generateAdImage);

export default router;
