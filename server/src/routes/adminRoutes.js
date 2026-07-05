import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { addDoctor, registerAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/doctors', protect, authorize("admin"), addDoctor);
router.post('/register-admin', registerAdmin);

export default router;