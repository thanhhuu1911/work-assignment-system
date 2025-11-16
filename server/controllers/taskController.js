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
    await task.populate(["assignedBy", "assignee"]);

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedBy", "name")
      .populate("assignee", "name group");
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const improveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    }

    // Cập nhật ảnh sau
    if (req.files?.afterImage?.[0]) {
      task.afterImage = req.files.afterImage[0].filename;
    }

    // Cập nhật file kết quả
    if (req.files?.resultFile?.[0]) {
      task.resultFile = req.files.resultFile[0].filename;
    }

    // Cập nhật trạng thái
    task.status = "review";
    await task.save();

    res.json({ message: "Cải thiện thành công!", task });
  } catch (error) {
    console.error("Lỗi cải thiện công việc:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedBy", "name")
      .populate("assignee", "name");

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    }

    res.json(task); // TRẢ VỀ task trực tiếp → frontend dùng res.data
  } catch (error) {
    console.error("Lỗi lấy task:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
