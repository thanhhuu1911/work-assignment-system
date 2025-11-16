import express from "express";
import {
  createTask,
  getTasks,
  improveTask,
  getTaskById,
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

// THÊM DÒNG NÀY – BẮT BUỘC
router.put(
  "/:id/improve",
  upload.fields([
    { name: "afterImage", maxCount: 1 },
    { name: "resultFile", maxCount: 1 },
  ]),
  improveTask
);
router.get("/:id", getTaskById);
router.put(
  "/:id/review",
  authorize("manager", "a_manager"),
  async (req, res) => {
    const { status, reviewNote } = req.body;
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { status, reviewNote, reviewedAt: new Date() },
        { new: true }
      );
      res.json({ message: "Duyệt thành công", task });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
export default router;
