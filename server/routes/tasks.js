// routes/taskRoutes.js
import express from "express";
import {
  createTask,
  getTasks,
  improveTask,
  getTaskById,
  reviewTask,
} from "../controllers/taskController.js";
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
router.get("/:id", getTaskById);
router.put(
  "/:id/improve",
  authorize("leader", "staff"),
  upload.single("afterImage"),
  improveTask
);
router.put(
  "/:id/review",
  authorize("manager", "a_manager", "leader"),
  reviewTask
);

export default router;
