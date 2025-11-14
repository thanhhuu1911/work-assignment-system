import express from "express";
import { createTask, getTasks } from "../controllers/taskController.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("manager", "a_manager", "leader"),
  upload.single("beforeImage"),
  createTask
);
router.get("/", getTasks);

export default router;
