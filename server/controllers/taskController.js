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

  try {
    const task = new Task({
      title,
      description,
      department,
      assignee,
      assignedBy: req.user._id,
      startDate,
      dueDate,
      position,
      beforeImage: req.files?.beforeImage?.[0]?.filename || null,
      // Xử lý nhiều file đính kèm khi tạo task
      attachedFiles: req.files?.attachedFile
        ? Array.isArray(req.files.attachedFile)
          ? req.files.attachedFile.map((f) => ({
              original: f.originalname, // ← TÊN GỐC ĐẸP
              stored: f.filename, // ← TÊN TRONG SERVER
            }))
          : [
              {
                original: req.files.attachedFile[0].originalname,
                stored: req.files.attachedFile[0].filename,
              },
            ]
        : [],
    });

    await task.save();
    await task.populate("assignedBy", "name");
    await task.populate("assignee", "name group");
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: err.message || "Lỗi server" });
  }
};

export const getTasks = async (req, res) => {
  try {
    let tasks = await Task.find()
      .populate("assignedBy", "name")
      .populate("assignee", "name group")
      .sort({ createdAt: -1 });

    // ÉP CHUYỂN SANG JSON ĐỂ VIRTUAL HIỆN RA
    tasks = tasks.map((task) => task.toObject({ virtuals: true }));

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
      .lean({ virtuals: true }); // ĐÃ SỬA

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

    // Chặn quá hạn
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

    // Nếu bị reject → xóa dữ liệu cũ
    if (task.status === "rejected") {
      task.afterImage = null;
      task.completedFiles = [];
      task.improveNote = null;
    }

    if (req.files?.afterImage?.[0])
      task.afterImage = req.files.afterImage[0].filename;

    if (req.files?.completedFile) {
      const uploadedFiles = Array.isArray(req.files.completedFile)
        ? req.files.completedFile
        : [req.files.completedFile[0]].filter(Boolean);

      task.completedFiles = uploadedFiles.map((f) => ({
        original: f.originalname, // ← TÊN ĐẸP ĐỂ HIỆN CHO USER
        stored: f.filename, // ← TÊN THẬT TRONG THƯ MỤC uploads
      }));
    }
    if (req.body.improveNote) task.improveNote = req.body.improveNote.trim();

    task.status = "review";
    task.reviewNote = null;
    await task.save();

    await task.populate("assignedBy", "name");
    await task.populate("assignee", "name group");
    res.json({ message: "Cải thiện thành công!", task });
  } catch (error) {
    console.error("Improve task error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const reviewTask = async (req, res) => {
  const { status, reviewNote } = req.body;

  try {
    const updateData = {
      status,
      reviewedAt: new Date(),
    };

    // QUY TẮC HOÀN HẢO NHẤT:
    // - Nếu sếp có ghi gì → lưu lại (dù duyệt hay từ chối)
    // - Nếu duyệt + không ghi gì → để reviewNote = null (không bắt buộc)
    // - Nếu từ chối + không ghi gì → tự động điền "Không đạt"
    if (reviewNote?.trim()) {
      updateData.reviewNote = reviewNote.trim();
    } else if (status === "rejected") {
      updateData.reviewNote = "Không đạt"; // bắt buộc có lý do khi reject
    }
    // nếu duyệt + không ghi gì → KHÔNG làm gì cả → reviewNote vẫn null → chuẩn!

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("assignedBy", "name")
      .populate("assignee", "name group");

    if (!task) return res.status(404).json({ message: "Không tìm thấy task" });

    res.json({ message: "Duyệt thành công!", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
