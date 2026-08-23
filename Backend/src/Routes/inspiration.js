import express from 'express';
import { getInspirations, downloadInspiration } from '../controllers/inspiration.controller.js';

const router = express.Router();

// Inspiration feed endpoint: /api/inspiration or /inspiration
router.get('/', getInspirations);
router.get('/download', downloadInspiration);

export default router;
