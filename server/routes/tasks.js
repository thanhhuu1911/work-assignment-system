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
import { upload } from "../middleware/upload.js"; // upload đã được update ở bước trước

const router = express.Router();
router.use(protect);

// SUPPORT NHIỀU FILE CÙNG LÚC KHI TẠO TASK
const uploadCreateTask = upload.fields([
  { name: "beforeImage", maxCount: 1 }, // Ảnh trước
  { name: "attachedFile", maxCount: 10 }, // File đính kèm từ sếp
]);

// SUPPORT NHIỀU FILE KHI CẢI THIỆN
const uploadImproveTask = upload.fields([
  { name: "afterImage", maxCount: 1 }, // Ảnh sau
  { name: "completedFile", maxCount: 10 }, // File hoàn thành từ nhân viên
]);

// ROUTES
router.post(
  "/",
  authorize("manager", "a_manager", "leader"),
  uploadCreateTask, // ĐÃ THAY ĐỔI TẠI ĐÂY
  createTask
);

router.get("/", getTasks);
router.get("/stats", getTaskStats); // Thêm dòng này
router.get("/:id", getTaskById);

router.put(
  "/:id/improve",
  authorize("manager", "a_manager", "leader", "member"),
  uploadImproveTask, // ĐÃ THAY ĐỔI TẠI ĐÂY
  improveTask
);

router.put(
  "/:id/review",
  authorize("manager", "a_manager", "leader"),
  reviewTask
);

export default router;
