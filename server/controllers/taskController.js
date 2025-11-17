// controllers/taskController.js
import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  const {
    title,
    description,
    department,
    assignee,
    startDate,
    dueDate,
    position,
  } = req.body;
  const beforeImage = req.file?.filename;
  try {
    const task = new Task({
      title,
      description,
      department,
      assignee,
      assignedBy: req.user._id,
      startDate,
      dueDate,
      beforeImage,
      position,
    });
    await task.save();
    await task.populate("assignedBy", "name");
    await task.populate("assignee", "name group");
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedBy", "name")
      .populate("assignee", "name group")
      .sort({ createdAt: -1 })
      .lean(); // BẮT BUỘC ĐỂ VIRTUAL HIỆN RA
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedBy", "name")
      .populate("assignee", "name group")
      .sort({ createdAt: -1 })
      .lean();
    if (!task)
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const improveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ message: "Không tìm thấy công việc" });

    // CHẶN NẾU QUÁ HẠN
    const now = new Date();
    const due = new Date(task.dueDate);
    const endOfDay = new Date(
      due.getFullYear(),
      due.getMonth(),
      due.getDate(),
      23,
      59,
      59
    );
    if (now > endOfDay && task.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Công việc đã quá hạn! Không thể cải thiện." });
    }

    if (req.file) {
      task.afterImage = req.file.filename;
    }

    task.status = "review";
    task.reviewNote = null;

    await task.save();
    await task.populate("assignedBy", "name");
    await task.populate("assignee", "name group");
    res.json({ message: "Cải thiện thành công!", task });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const reviewTask = async (req, res) => {
  const { status, reviewNote } = req.body;
  try {
    const updateData = {
      status,
      reviewedAt: new Date(),
      reviewNote:
        status === "rejected" ? reviewNote?.trim() || "Không đạt" : null,
    };

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("assignedBy assignee");

    res.json({ message: "Duyệt thành công!", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
