import express from "express";
import multer from "multer";
import { getReports, uploadReport } from "../controllers/reportController.js";
import { protect } from "../middlewares/authMiddleware.js";
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

router.use(protect);

router.get('/:patientId', getReports);
router.post('/:patientId', upload.single('file'), uploadReport);

export default router;
