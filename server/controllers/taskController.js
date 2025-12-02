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
    if (!currentUser)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const isManager = ["manager", "a_manager"].includes(currentUser.role);
    const isLeader = currentUser.role === "leader";
    const isMember = currentUser.role === "member";

    let tasks = [];

    // --- LẤY TASK THEO QUYỀN ---
    if (isMember) {
      tasks = await Task.find({ assignee: currentUser._id })
        .populate("assignee", "name group _id")
        .populate("assignedBy", "name")
        .lean({ virtuals: true });
    } else if (isLeader) {
      const result = await Task.find()
        .populate({
          path: "assignee",
          match: { group: currentUser.group },
          select: "name group _id",
        })
        .populate("assignedBy", "name")
        .lean({ virtuals: true });

      tasks = result.filter((t) => t.assignee !== null);
    } else {
      tasks = await Task.find()
        .populate("assignee", "name group _id")
        .populate("assignedBy", "name")
        .lean({ virtuals: true });
    }

    // --- FILTER QUERY ---
    const { group, userId, period } = req.query;
    let filtered = tasks;

    // Lọc theo nhóm
    if ((isManager || isLeader) && group && group !== "all") {
      filtered = filtered.filter((t) => t.assignee?.group === group);
    }

    // Lọc theo nhân viên
    if ((isManager || isLeader || isMember) && userId && userId !== "all") {
      filtered = filtered.filter((t) => t.assignee?._id.toString() === userId);
    }

    // Lọc thời gian
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

      if (startDate)
        filtered = filtered.filter((t) => new Date(t.createdAt) >= startDate);
    }

    // --- SUMMARY ---
    const total = filtered.length;
    const completed = filtered.filter((t) => t.status === "approved").length;
    const ongoing = filtered.filter(
      (t) =>
        ["ongoing", "processing", "review"].includes(t.status) && !t.isOverdue
    ).length;
    const overdue = filtered.filter(
      (t) => t.isOverdue && !["approved", "rejected"].includes(t.status)
    ).length;
    const rejected = filtered.filter((t) => t.status === "rejected").length;

    const statusBreakdown = [
      { name: "Đang thực hiện", value: ongoing, color: "#ffc107" },
      { name: "Hoàn thành", value: completed, color: "#28a745" },
      { name: "Quá hạn", value: overdue, color: "#846d70ff" },
      { name: "Không đạt", value: rejected, color: "#ff0000ff" },
    ].filter((i) => i.value > 0);

    // --- TOP PERFORMERS ---
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

    // --- DAILY STATS ---
    let dailyStats = [];

    if (
      !period ||
      period === "all" ||
      period === "week" ||
      period === "month" ||
      period === "quarter"
    ) {
      let dates = [];
      let label = "";

      if (period === "week" || !period || period === "all") {
        // 7 ngày hoặc Tổng quan → 30 ngày gần nhất
        const daysCount = period === "week" ? 7 : 30;
        dates = Array.from({ length: daysCount }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (daysCount - 1 - i));
          return { date: format(d, "dd/MM"), fullDate: d };
        });
        label = period === "week" ? "7 ngày" : "30 ngày gần nhất";
      } else if (period === "month") {
        // Tháng này → lấy tất cả ngày trong tháng hiện tại
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        dates = Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(year, month, i + 1);
          return { date: format(d, "dd/MM"), fullDate: d };
        });
        label = "Tháng này";
      } else if (period === "quarter") {
        // Quý này → lấy tất cả ngày trong quý
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const startMonth = quarter * 3;
        const startDate = new Date(now.getFullYear(), startMonth, 1);
        const endDate = new Date(now.getFullYear(), startMonth + 3, 0);
        const daysInQuarter = endDate.getDate();

        dates = [];
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          dates.push({
            date: format(new Date(d), "dd/MM"),
            fullDate: new Date(d),
          });
        }
        label = "Quý này";
      }

      dailyStats = dates.map(({ date }) => {
        const dayTasks = filtered.filter(
          (t) => format(new Date(t.createdAt), "dd/MM") === date
        );

        return {
          date,
          created: dayTasks.length,
          completed: dayTasks.filter((t) => t.status === "approved").length,
          ongoing: dayTasks.filter(
            (t) =>
              ["ongoing", "processing", "review"].includes(t.status) &&
              !t.isOverdue
          ).length,
          overdue: dayTasks.filter(
            (t) => t.isOverdue && !["approved", "rejected"].includes(t.status)
          ).length,
          rejected: dayTasks.filter((t) => t.status === "rejected").length,
        };
      });

      // Gắn thêm label để frontend biết hiển thị gì
      dailyStats.label = label;
    }

    // --- AVAILABLE GROUPS ---
    let availableGroups = [];
    if (isManager) {
      availableGroups = [
        ...new Set(tasks.map((t) => t.assignee?.group).filter(Boolean)),
      ];
    } else if (isLeader) {
      availableGroups = [currentUser.group];
    }

    // --- AVAILABLE USERS (CHUẨN GROK – Map, không trùng, không thiếu) ---
    let availableUsers = [];

    if (isMember) {
      availableUsers = [{ _id: currentUser._id, name: currentUser.name }];
    } else {
      const userMap = new Map();

      tasks.forEach((t) => {
        if (!t.assignee) return;

        // Manager chọn group
        if (group && group !== "all" && t.assignee.group !== group) return;

        // Leader chỉ được xem người trong nhóm mình
        if (isLeader && t.assignee.group !== currentUser.group) return;

        userMap.set(t.assignee._id.toString(), {
          _id: t.assignee._id,
          name: t.assignee.name,
        });
      });

      availableUsers = [...userMap.values()];
    }

    // --- RESPONSE OK ---
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
