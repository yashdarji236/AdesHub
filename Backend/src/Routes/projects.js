import express from 'express';
import { createProject, getUserProjects } from '../controllers/projects.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes for projects
router.post('/create', verifyToken, createProject);
router.get('/get', verifyToken, getUserProjects);

export default router;
