import express from 'express';
import multer from 'multer';
import { generateAdImage, editAdImage, saveImage, getSavedCharacters, getProjectImages } from '../controllers/ai.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Generate image from prompt (Text-to-Image)
router.post('/generate-image', verifyToken, upload.single('image'), generateAdImage);

// Edit image from prompt and reference image (Image-to-Image)
router.post('/image-to-image', verifyToken, upload.single('image'), editAdImage);

// Save generated image to project gallery
router.post('/save-image', verifyToken, saveImage);

// Get user's saved character images
router.get('/saved-characters', verifyToken, getSavedCharacters);

// Get all generations for a project
router.get('/project-images/:projectId', verifyToken, getProjectImages);

export default router;
