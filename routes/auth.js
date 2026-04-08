import express from 'express';
const router = express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import authController from '../controllers/authController.js';

router.post('/admin/login', authController.login);

export default router;
