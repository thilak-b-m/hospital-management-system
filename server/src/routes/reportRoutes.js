import express from "express";
import multer from "multer";
import { rateLimit } from "express-rate-limit";
import { downloadReportFile, getReports, getDoctorReports, uploadReport } from "../controllers/reportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { authorizePatientAccess } from "../middlewares/patientAccessMiddleware.js";
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

const allowedExtensions = new Map([
  ["application/pdf", new Set([".pdf"])],
  ["image/jpeg", new Set([".jpg", ".jpeg"])],
  ["image/png", new Set([".png"])],
  ["image/webp", new Set([".webp"])],
]);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const extensions = allowedExtensions.get(file.mimetype);
    const extension = path.extname(file.originalname).toLowerCase();
    if (!extensions?.has(extension)) {
      const error = new Error("Only PDF, JPEG, PNG, and WebP files are allowed.");
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: "Upload limit reached. Try again later." }),
});

router.use(protect);

router.get('/doctor', authorize('doctor'), getDoctorReports);
router.get('/file/:reportId', authorize('doctor', 'patient', 'admin'), downloadReportFile);
router.get('/:patientId', authorizePatientAccess, getReports);
router.post('/:patientId', authorize('doctor', 'patient'), authorizePatientAccess, uploadLimiter, upload.single('file'), uploadReport);

export default router;
