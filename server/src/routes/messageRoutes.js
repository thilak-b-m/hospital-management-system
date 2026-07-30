import express from "express";
import { getContacts, getMessages } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/contacts", getContacts);
router.get("/:contactId", getMessages);

export default router;
