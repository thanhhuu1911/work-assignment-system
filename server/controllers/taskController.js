// controllers/taskController.js
import Task from "../models/Task.js";
import { format } from "date-fns";

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
export const getTaskStats = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const isManager = ["manager", "a_manager"].includes(currentUser.role);
    const isLeader = currentUser.role === "leader";
    const isMember = currentUser.role === "member";

    let match = {};

    if (isLeader) {
      match = { "assignee.group": currentUser.group };
    } else if (isMember) {
      match = { assignee: currentUser._id }; // ← DÒNG DUY NHẤT CẦN SỬA – XONG!!!
    }
    // Manager: match = {} → thấy hết

    const tasks = await Task.find(match)
      .populate("assignee", "name group _id")
      .lean({ virtuals: true });

    let filtered = tasks;
    const { group, userId, period } = req.query;

    if ((isManager || isLeader) && group && group !== "all") {
      filtered = filtered.filter((t) => t.assignee?.group === group);
    }
    if ((isManager || isLeader) && userId && userId !== "all") {
      filtered = filtered.filter((t) => t.assignee?._id.toString() === userId);
      // tasks = filtered;
    }

    const now = new Date();
    if (period && period !== "all") {
      let startDate;
      if (period === "week")
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (period === "month")
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      if (period === "quarter") {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      }
      if (startDate) {
        filtered = filtered.filter((t) => new Date(t.createdAt) >= startDate);
      }
    }

    const total = filtered.length;
    const completed = filtered.filter((t) => t.status === "approved").length;
    const ongoing = filtered.filter(
      (t) => (t.status === "ongoing" || t.status === "review") && !t.isOverdue
    ).length;
    const overdue = filtered.filter(
      (t) => t.isOverdue && t.status !== "approved"
    ).length;
    const rejected = filtered.filter(
      (t) =>
        t.status === "rejected" ||
        (t.reviewNote && !["approved", "ongoing", "review"].includes(t.status))
    ).length;

    const statusBreakdown = [
      { name: "Hoàn thành", value: completed, color: "#28a745" },
      { name: "Đang thực hiện", value: ongoing, color: "#ffc107" },
      { name: "Quá hạn", value: overdue, color: "#846d70ff" },
      { name: "Không đạt", value: rejected, color: "#ff0000ff" },
    ].filter((i) => i.value > 0);

    // Top nhân viên
    const userStats = {};
    filtered.forEach((t) => {
      if (!t.assignee) return;
      const id = t.assignee._id.toString();
      if (!userStats[id])
        userStats[id] = { name: t.assignee.name, completed: 0, total: 0 };
      userStats[id].total++;
      if (t.status === "approved") userStats[id].completed++;
    });

    const topPerformers = Object.values(userStats)
      .map((u) => ({
        ...u,
        rate: u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10);

    // 7 ngày gần nhất
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return format(d, "dd/MM");
    });

    const dailyStats = last7Days.map((date) => {
      const dayTasks = filtered.filter(
        (t) => format(new Date(t.createdAt), "dd/MM") === date
      );

      return {
        date,
        created: dayTasks.length,
        completed: dayTasks.filter((t) => t.status === "approved").length,
        ongoing: dayTasks.filter(
          (t) =>
            (t.status === "ongoing" || t.status === "review") && !t.isOverdue
        ).length,
        overdue: dayTasks.filter((t) => t.isOverdue && t.status !== "approved")
          .length,
        rejected: dayTasks.filter((t) => t.status === "rejected").length,
      };
    });

    const availableGroups = isManager
      ? [...new Set(tasks.map((t) => t.assignee?.group).filter(Boolean))]
      : isLeader
      ? [currentUser.group]
      : [];

    const availableUsers = isMember
      ? [{ _id: currentUser._id, name: currentUser.name }]
      : [
          ...new Map(
            filtered.map((t) => [t.assignee?._id.toString(), t.assignee])
          ).values(),
        ].filter(Boolean);

    res.json({
      success: true,
      data: {
        summary: { total, completed, ongoing, overdue, rejected },
        statusBreakdown,
        dailyStats,
        topPerformers,
        availableGroups,
        availableUsers,
      },
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ success: false, message: "Lỗi server thống kê" });
  }
};
