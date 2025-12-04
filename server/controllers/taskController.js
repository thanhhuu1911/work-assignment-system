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

    const { group, userId, period } = req.query;
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    // 1. XÁC ĐỊNH PHẠM VI + LỌC THEO QUYỀN
    let match = {};

    if (isMember) {
      match.assignee = currentUser._id;
    } else if (isLeader) {
      match["assignee.group"] = currentUser.group;
    }
    // Manager: thấy hết

    // 2. LỌC THEO THỜI GIAN (từ createdAt)
    let createdAtFilter = {};
    if (period === "week") {
      createdAtFilter = {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      };
    } else if (period === "month") {
      createdAtFilter = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    } else if (period === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      createdAtFilter = { $gte: new Date(now.getFullYear(), quarter * 3, 1) };
    } else {
      // "all" hoặc không có → 30 ngày gần nhất
      createdAtFilter = {
        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };
    }

    // 3. QUERY CHÍNH – DÙNG MONGOOSE ĐỂ TÍNH isOverdue CHUẨN
    let tasks = await Task.find({
      ...match,
      createdAt: createdAtFilter,
    })
      .populate("assignee", "name group _id")
      .populate("assignedBy", "name")
      .lean(); // vẫn lean để tăng tốc, nhưng sẽ tính overdue bằng logic dưới đây

    // 4. MANAGER MỚI ĐƯỢC LỌC THÊM THEO GROUP & USER
    if (isManager) {
      if (group && group !== "all") {
        tasks = tasks.filter((t) => t.assignee?.group === group);
      }
      if (userId && userId !== "all") {
        tasks = tasks.filter((t) => t.assignee?._id.toString() === userId);
      }
    }

    // 5. TÍNH TOÁN CHÍNH XÁC – DỰA VÀO DUE DATE + STATUS
    const summary = {
      total: tasks.length,
      ongoing: 0,
      completed: 0,
      overdue: 0,
      rejected: 0,
    };

    const userStats = {};
    const dailyMap = new Map();

    tasks.forEach((task) => {
      const assigneeId = task.assignee?._id?.toString();
      const createdDate = format(new Date(task.createdAt), "dd/MM");

      // Tính trạng thái thực tế
      let statusCategory = "";
      if (task.status === "approved") {
        statusCategory = "completed";
        summary.completed++;
      } else if (task.status === "rejected") {
        statusCategory = "rejected";
        summary.rejected++;
      } else {
        // Các trạng thái khác: ongoing, processing, review
        const dueDate = new Date(task.dueDate);
        const endOfDueDate = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate(),
          23,
          59,
          59
        );

        if (endOfDueDate < today) {
          statusCategory = "overdue";
          summary.overdue++;
        } else {
          statusCategory = "ongoing";
          summary.ongoing++;
        }
      }

      // Top performers
      if (assigneeId) {
        if (!userStats[assigneeId]) {
          userStats[assigneeId] = {
            name: task.assignee.name,
            completed: 0,
            total: 0,
          };
        }
        userStats[assigneeId].total++;
        if (task.status === "approved") userStats[assigneeId].completed++;
      }

      // Daily stats
      if (!dailyMap.has(createdDate)) {
        dailyMap.set(createdDate, {
          date: createdDate,
          created: 0,
          completed: 0,
          ongoing: 0,
          overdue: 0,
          rejected: 0,
        });
      }
      const day = dailyMap.get(createdDate);
      day.created++;
      if (task.status === "approved") day.completed++;
      else if (task.status === "rejected") day.rejected++;
      else if (statusCategory === "overdue") day.overdue++;
      else day.ongoing++;
    });

    // 6. Top performers
    const topPerformers = Object.values(userStats)
      .map((u) => ({
        ...u,
        rate: u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10);

    // 7. Daily stats – bổ sung ngày trống
    const dailyStats = [];
    const start =
      period === "week"
        ? 6
        : period === "all"
        ? 29
        : period === "month"
        ? new Date(now.getFullYear(), now.getMonth(), 1).getDate() - 1
        : 89;

    for (let i = start; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = format(d, "dd/MM");
      const dayData = dailyMap.get(dateStr) || {
        date: dateStr,
        created: 0,
        completed: 0,
        ongoing: 0,
        overdue: 0,
        rejected: 0,
      };
      dailyStats.push(dayData);
    }

    // 8. Available groups & users
    let availableGroups = [];
    let availableUsers = [];

    if (isManager) {
      availableGroups = [
        ...new Set(tasks.map((t) => t.assignee?.group).filter(Boolean)),
      ];
      const userMap = new Map();
      tasks.forEach(
        (t) =>
          t.assignee &&
          userMap.set(t.assignee._id.toString(), {
            _id: t.assignee._id,
            name: t.assignee.name,
            group: t.assignee.group,
          })
      );
      availableUsers = [...userMap.values()];
    } else if (isLeader) {
      availableGroups = [currentUser.group];
      const userMap = new Map();
      tasks.forEach((t) => {
        if (t.assignee && t.assignee.group === currentUser.group) {
          userMap.set(t.assignee._id.toString(), {
            _id: t.assignee._id,
            name: t.assignee.name,
          });
        }
      });
      availableUsers = [...userMap.values()];
    } else if (isMember) {
      availableUsers = [{ _id: currentUser._id, name: currentUser.name }];
    }

    const statusBreakdown = [
      { name: "Đang thực hiện", value: summary.ongoing },
      { name: "Hoàn thành", value: summary.completed },
      { name: "Quá hạn", value: summary.overdue },
      { name: "Không đạt", value: summary.rejected },
    ].filter((i) => i.value > 0);

    res.json({
      success: true,
      data: {
        summary,
        statusBreakdown,
        dailyStats,
        topPerformers: isMember ? [] : topPerformers,
        availableGroups,
        availableUsers,
      },
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ success: false, message: "Lỗi server thống kê" });
  }
};
