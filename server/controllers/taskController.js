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
    const files = req.processedFiles || {};

    const task = new Task({
      title: title || description.slice(0, 50) || "ME Task",
      description,
      department,
      assignee,
      assignedBy: req.user._id,
      startDate,
      dueDate,
      position,
      beforeImage: files.beforeImage?.stored || null,
      attachedFiles: files.attachedFiles || [],
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

    const files = req.processedFiles || {};

    if (task.status === "rejected") {
      task.afterImage = null;
      task.completedFiles = [];
      task.improveNote = null;
    }

    if (files.afterImage) task.afterImage = files.afterImage.stored;
    if (files.completedFiles) task.completedFiles = files.completedFiles;
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

  // Cho phép 3 trạng thái
  if (!["approved", "rejected", "needs_improvement"].includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    const updateData = {
      status,
      reviewedAt: new Date(),
    };

    // Bắt buộc reviewNote khi rejected hoặc needs_improvement
    if (reviewNote?.trim()) {
      updateData.reviewNote = reviewNote.trim();
    } else if (status === "rejected" || status === "needs_improvement") {
      updateData.reviewNote = "Không đạt – yêu cầu cải thiện lại"; // fallback
    }

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

    const { group, userId, period } = req.query;

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // ===== 1. XÁC ĐỊNH PHẠM VI THEO QUYỀN =====
    let match = {};
    if (isMember) {
      match.assignee = currentUser._id;
    }

    // ===== 2. LỌC THỜI GIAN =====
    let fromDate;
    let toDate = new Date(); // mặc định đến hôm nay
    let daysToShow = 6; // mặc định cho line chart (sẽ điều chỉnh sau)

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (period) {
      case "last_7_days":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 6); // 7 ngày bao gồm hôm nay
        fromDate.setHours(0, 0, 0, 0);
        daysToShow = 6;
        break;

      case "this_month":
        fromDate = new Date(currentYear, currentMonth, 1);
        fromDate.setHours(0, 0, 0, 0);
        daysToShow = now.getDate() - 1; // số ngày đã qua trong tháng
        break;

      case "last_month":
        fromDate = new Date(currentYear, currentMonth - 1, 1);
        toDate = new Date(currentYear, currentMonth, 0); // ngày cuối tháng trước
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        daysToShow = toDate.getDate(); // số ngày của tháng trước
        break;

      case "this_year":
        fromDate = new Date(currentYear, 0, 1);
        fromDate.setHours(0, 0, 0, 0);
        daysToShow = Math.floor((now - fromDate) / (1000 * 60 * 60 * 24));
        break;

      case "last_year":
        fromDate = new Date(currentYear - 1, 0, 1);
        toDate = new Date(currentYear - 1, 11, 31);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        daysToShow = 365; // hoặc 366 nếu năm nhuận, nhưng 365 đủ cho line chart
        break;

      default:
        // fallback về 30 ngày gần nhất (hoặc bạn có thể throw error)
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        daysToShow = 29;
        break;
    }

    // Đảm bảo fromDate và toDate đúng múi giờ (nếu cần)
    fromDate = new Date(fromDate.setHours(0, 0, 0, 0));
    if (toDate) {
      toDate = new Date(toDate.setHours(23, 59, 59, 999));
    } else {
      toDate = new Date(now.setHours(23, 59, 59, 999));
    }

    // Tạo filter cho MongoDB
    const createdAtFilter = {
      $gte: fromDate,
      $lte: toDate,
    };

    // ===== 3. LẤY TOÀN BỘ TASK TRONG KHOẢNG THỜI GIAN (CHƯA LỌC GROUP/USER) =====
    let tasks = await Task.find({
      ...match,
      createdAt: createdAtFilter,
    })
      .populate("assignedBy", "name")
      .populate("assignee", "name group _id")
      .lean();

    // ==================== SỬA CHÍNH TẠI ĐÂY – BƯỚC 1: LẤY DANH SÁCH NHÓM & NHÂN VIÊN TRƯỚC KHI LỌC ====================
    let availableGroups = [];
    let availableUsers = [];

    if (isManager) {
      // FIX 1: Nhóm luôn cố định → không bao giờ bị mất
      availableGroups = ["Lean", "IE"]; //"Data"

      // FIX 2: Lấy danh sách nhân viên từ TOÀN BỘ task (chưa lọc theo userId) → không bị mất khi chọn nhân viên
      const userMap = new Map();
      tasks.forEach((t) => {
        if (t.assignee) {
          userMap.set(t.assignee._id.toString(), {
            _id: t.assignee._id.toString(),
            name: t.assignee.name,
            group: t.assignee.group || "Chưa xác định",
          });
        }
      });
      availableUsers = Array.from(userMap.values());
    } else if (isLeader) {
      const leaderGroup = currentUser.group?.trim();
      if (!leaderGroup) {
        return res
          .status(400)
          .json({ success: false, message: "Leader không có nhóm" });
      }
      availableGroups = [leaderGroup];

      const userMap = new Map();
      tasks.forEach((t) => {
        if (t.assignee && t.assignee.group?.trim() === leaderGroup) {
          userMap.set(t.assignee._id.toString(), {
            _id: t.assignee._id.toString(),
            name: t.assignee.name,
            group: t.assignee.group,
          });
        }
      });
      availableUsers = Array.from(userMap.values());
    } else if (isMember) {
      availableGroups = [];
      availableUsers = [
        {
          _id: currentUser._id.toString(),
          name: currentUser.name,
          group: currentUser.group || "Chưa xác định",
        },
      ];
    }
    // ==================== KẾT THÚC SỬA CHÍNH ====================

    // ===== 4. SAU KHI ĐÃ LẤY availableGroups & availableUsers → BÂY GIỜ MỚI ĐƯỢC LỌC TASKS =====
    if (isLeader) {
      const leaderGroup = currentUser.group?.trim();
      tasks = tasks.filter((t) => t.assignee?.group?.trim() === leaderGroup);
    }

    if (isManager) {
      if (group && group !== "all") {
        tasks = tasks.filter((t) => t.assignee?.group === group);
      }
      if (userId && userId !== "all") {
        tasks = tasks.filter((t) => t.assignee?._id.toString() === userId);
      }
    }

    if (isLeader && userId && userId !== "all") {
      tasks = tasks.filter((t) => t.assignee?._id.toString() === userId);
    }

    // Kiểm tra quyền Leader (giữ nguyên)
    if (
      isLeader &&
      group &&
      group !== "all" &&
      group !== currentUser.group?.trim()
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ được xem thống kê của nhóm mình",
      });
    }

    // if (isLeader && userId && userId !== "all") {
    //   // ... (phần kiểm tra user thuộc nhóm leader – giữ nguyên)
    //   // (code kiểm tra quyền leader vẫn như cũ, không cần thay đổi)
    //   tasks = tasks.filter((t) => t.assignee?._id.toString() === userId);
    // }

    // ===== 5. TÍNH TOÁN THỐNG KÊ (dùng tasks đã lọc) =====
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
      const dateStr = format(new Date(task.createdAt), "dd/MM");

      let statusCategory = "";
      if (task.status === "approved") {
        statusCategory = "completed";
        summary.completed++;
      } else if (task.status === "rejected") {
        statusCategory = "rejected";
        summary.rejected++;
      } else {
        // CHỈ tính là quá hạn khi:
        // - Đã quá dueDate
        // - Và chưa được duyệt (status KHÔNG PHẢI approved hoặc rejected)
        const isActuallyOverdue =
          task.dueDate &&
          new Date(task.dueDate) < today &&
          !["approved", "rejected"].includes(task.status);

        if (isActuallyOverdue) {
          statusCategory = "overdue";
          summary.overdue++;
        } else {
          statusCategory = "ongoing";
          summary.ongoing++;
        }
      }

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

      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          date: dateStr,
          created: 0,
          completed: 0,
          ongoing: 0,
          overdue: 0,
          rejected: 0,
        });
      }
      const day = dailyMap.get(dateStr);
      day.created++;
      if (task.status === "approved") day.completed++;
      else if (task.status === "rejected") day.rejected++;
      else if (statusCategory === "overdue") day.overdue++;
      else day.ongoing++;
    });

    const topPerformers =
      isManager || isLeader
        ? Object.values(userStats)
            .map((u) => ({
              ...u,
              rate: u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0,
            }))
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 10)
        : [];

    const dailyStats = [];
    const cursor = new Date(fromDate);

    while (cursor <= toDate) {
      const dateStr = format(cursor, "dd/MM");

      dailyStats.push(
        dailyMap.get(dateStr) || {
          date: dateStr,
          created: 0,
          completed: 0,
          ongoing: 0,
          overdue: 0,
          rejected: 0,
        }
      );

      cursor.setDate(cursor.getDate() + 1);
    }

    // const statusBreakdown = [
    //   { name: "Đang thực hiện", value: summary.ongoing },
    //   { name: "Hoàn thành", value: summary.completed },
    //   { name: "Quá hạn", value: summary.overdue },
    //   { name: "Không đạt", value: summary.rejected },
    // ].filter((i) => i.value > 0);

    const statusBreakdown = [
      { key: "ongoing", name: "Đang thực hiện", value: summary.ongoing },
      { key: "completed", name: "Hoàn thành", value: summary.completed },
      { key: "overdue", name: "Quá hạn", value: summary.overdue },
      { key: "rejected", name: "Không đạt", value: summary.rejected },
    ].filter((i) => i.value > 0);

    return res.json({
      success: true,
      data: {
        summary,
        statusBreakdown,
        dailyStats,
        topPerformers,
        availableGroups,
        availableUsers,
      },
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server thống kê" });
  }
};
