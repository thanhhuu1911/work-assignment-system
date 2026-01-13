// routes/tasks.js
import express from "express";
import {
  createTask,
  getTasks,
  improveTask,
  getTaskById,
  reviewTask,
  getTaskStats,
} from "../controllers/taskController.js";
import { protect, authorize } from "../middleware/auth.js";

import { uploadWithCompress } from "../middleware/uploadWithCompress.js";

const router = express.Router();
router.use(protect);

// ROUTES
router.post(
  "/",
  authorize("manager", "a_manager", "leader"),
  uploadWithCompress,
  createTask
);

router.get("/", getTasks);
router.get("/stats", getTaskStats);

router.put(
  "/:id/improve",
  authorize("manager", "a_manager", "leader", "member"),
  uploadWithCompress,
  improveTask
);

router.put(
  "/:id/review",
  authorize("manager", "a_manager", "leader"),
  reviewTask
);

export default router;
