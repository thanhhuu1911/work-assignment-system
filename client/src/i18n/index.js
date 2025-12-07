// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Các bản dịch
const resources = {
  vi: {
    translation: {
      // Common / General
      all: "Tất cả",
      all_status: "Tất cả trạng thái",
      all_positions: "Tất cả nhà máy",
      all_groups: "Tất cả nhóm",
      all_members: "Tất cả nhân viên",
      reload: "Tải lại",
      reset: "Reset",
      home: "Trang chủ",
      back: "Quay lại",
      create_task: "Tạo công việc",
      assign_task: "Giao việc mới",
      statistics: "Thống kê",
      no_tasks: "Không có công việc nào",
      loading: "Đang tải...",

      // Status
      ongoing: "Đang thực hiện",
      processing: "Đang thực hiện",
      review: "Chờ duyệt",
      pending_approval: "Chờ duyệt",
      approved: "Hoàn thành",
      rejected: "Không đạt",
      rejected_overdue: "Quá hạn / Không đạt",
      overdue: "Quá hạn",

      // Filters & Labels
      factory: "Nhà máy",
      group: "Nhóm",
      member: "Nhân viên",
      position: "Vị trí",
      department: "Phòng ban",
      assignee: "Người thực hiện",
      created_date: "Ngày tạo",
      deadline: "Hạn chót",
      description: "Mô tả công việc",
      before_image: "Ảnh trước",
      after_image: "Ảnh sau",
      attached_files: "File đính kèm",
      completed_files: "File hoàn thành",
      feedback: "Ghi chú",
      note_to_leader: "Lời nhắn cho Leader",
      review_note: "Ghi chú duyệt",

      // TaskCard
      assigned_by: "Người giao",
      executor: "Người thực hiện",
      view_detail: "Xem chi tiết",
      improve: "Cải thiện",
      review_now: "Duyệt ngay",
      improving: "Đang cải thiện",
      waiting_review: "Chờ duyệt",

      // NewIssue
      assign_task_me: "Giao việc - ME",
      select_assignee: "-- Chọn nhân viên --",
      select_position: "-- Chọn vị trí --",
      enter_description: "Nhập mô tả công việc...",
      before_images: "Ảnh trước (không bắt buộc)",
      attached_files_hint: "Ctrl để chọn nhiều file",
      assign_task_button: "Giao việc",

      // ImproveTask
      improve_task: "Cải thiện công việc",
      after_images: "Ảnh sau (không bắt buộc)",
      completed_files_hint: "Ctrl để chọn nhiều file",
      send_for_review: "Gửi duyệt",
      sending: "Đang gửi...",
      must_attach_one:
        "Vui lòng chọn ít nhất 1 ảnh 'Sau' hoặc 1 file hoàn thành!",

      // ReviewTask
      task_review: "Duyệt công việc",
      reason_reject: "Lý do không đạt:",
      feedback_from_leader: "Feedback từ Leader:",
      note_for_member: "Ghi chú cho nhân viên",
      note_required_if_reject: "(bắt buộc nếu từ chối)",
      approve: "Duyệt",
      reject: "Từ chối",
      approving: "Đang duyệt...",
      rejecting: "Đang xử lý...",
      must_enter_reason: "Vui lòng nhập lý do trước khi từ chối!",

      // TaskDetail
      task_detail: "Chi tiết công việc",
      file_required: "File yêu cầu:",
      file_completed: "File hoàn thành:",
      message_from_member: "Nhân viên đã nhắn:",
      overdue_text: "Quá hạn",

      // Statistics
      personal_stats: "Thống kê cá nhân",
      group_stats: "Thống kê nhóm {{group}}",
      department_stats: "Thống kê phòng ME",
      total_tasks: "Tổng công việc",
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      overdue_tasks: "Quá hạn",
      rejected_tasks: "Không đạt",
      daily_activity: "Hoạt động theo ngày",
      status_distribution: "Tỷ lệ trạng thái công việc",
      ranking: "Xếp hạng",
      completion_rate: "Tỷ lệ hoàn thành",

      // Time filters
      last_7_days: "7 ngày qua",
      last_30_days: "30 ngày gần nhất",
      this_month: "Tháng này",
      this_quarter: "Quý này",

      // Toast messages
      task_assigned_success: "Giao việc thành công!",
      improve_sent_success: "Gửi duyệt thành công!",
      approved_success: "ĐÃ DUYỆT THÀNH CÔNG!",
      rejected_success: "ĐÃ TỪ CHỐI!",
      error_occurred: "Có lỗi xảy ra!",
      load_error: "Lỗi tải dữ liệu",
      unauthorized_improve: "Không thể cải thiện công việc này!",
      not_in_review: "Công việc không ở trạng thái chờ duyệt",

      before: "Trước",
      after: "Sau",
      description: "Mô tả công việc",
      no_description: "Không có mô tả",
      required_files: "File yêu cầu",
      completed_files: "File hoàn thành",
      file: "file",
      files: "files",
      feedback: "Feedback",
      has_note: "Có ghi chú",
      no_note_yet: "hiện tại chưa có",
      assigned_by: "Người giao",
      created_date: "Ngày tạo",
      executor: "Người thực hiện",
      deadline: "Hạn chót",
      view_detail: "Xem chi tiết",
      improve: "Cải thiện",
      review_now: "Duyệt",

      // Roles (hiển thị)
      leader: "Leader",
      staff: "Staff",
    },
  },
  en: {
    translation: {
      // Common / General
      all: "All",
      all_status: "All Status",
      all_positions: "All Factories",
      all_groups: "All Groups",
      all_members: "All Members",
      reload: "Reload",
      reset: "Reset",
      home: "Home",
      back: "Back",
      create_task: "Create Task",
      assign_task: "Assign New Task",
      statistics: "Statistics",
      no_tasks: "No tasks found",
      loading: "Loading...",

      // Status
      ongoing: "In Progress",
      processing: "In Progress",
      review: "Pending Review",
      pending_approval: "Pending Approval",
      approved: "Completed",
      rejected: "Rejected",
      rejected_overdue: "Overdue / Rejected",
      overdue: "Overdue",

      // Filters & Labels
      factory: "Factory",
      group: "Group",
      member: "Member",
      position: "Position",
      department: "Department",
      assignee: "Assignee",
      created_date: "Created Date",
      deadline: "Deadline: Deadline",
      description: "Task Description",
      before_image: "Before Image",
      after_image: "After Image",
      attached_files: "Attached Files",
      completed_files: "Completed Files",
      feedback: "Note",
      note_to_leader: "Message to Leader",
      review_note: "Review Note",

      // TaskCard
      assigned_by: "Assigned By",
      executor: "Executor",
      view_detail: "View Detail",
      improve: "Improve",
      review_now: "Review Now",
      improving: "Improving",
      waiting_review: "Pending Review",

      // NewIssue
      assign_task_me: "Assign Task - ME",
      select_assignee: "-- Select Staff --",
      select_position: "-- Select Position --",
      enter_description: "Enter task description...",
      before_images: "Before Images (optional)",
      attached_files_hint: "Hold Ctrl to select multiple files",
      assign_task_button: "Assign Task",

      // ImproveTask
      improve_task: "Improve Task",
      after_images: "After Images (optional)",
      completed_files_hint: "Hold Ctrl to select multiple files",
      send_for_review: "Submit for Review",
      sending: "Sending...",
      must_attach_one:
        "Please upload at least one 'After' image or completed file!",

      // ReviewTask
      task_review: "Review Task",
      reason_reject: "Reason for rejection:",
      feedback_from_leader: "Feedback from Leader:",
      note_for_member: "Note for member",
      note_required_if_reject: "(required if reject)",
      approve: "Approve",
      reject: "Reject",
      approving: "Approving...",
      rejecting: "Processing...",
      must_enter_reason: "Please enter a reason before rejecting!",

      // TaskDetail
      task_detail: "Task Detail",
      file_required: "Required Files:",
      file_completed: "Completed Files:",
      message_from_member: "Message from member:",
      overdue_text: "Overdue",

      // Statistics
      personal_stats: "Personal Statistics",
      group_stats: "Group {{group}} Statistics",
      department_stats: "ME Department Statistics",
      total_tasks: "Total Tasks",
      in_progress: "In Progress",
      completed: "Completed",
      overdue_tasks: "Overdue",
      rejected_tasks: "Rejected",
      daily_activity: "Daily Activity",
      status_distribution: "Task Status Distribution",
      ranking: "Ranking",
      completion_rate: "Completion Rate",

      // Time filters
      last_7_days: "Last 7 days",
      last_30_days: "Last 30 days",
      this_month: "This Month",
      this_quarter: "This Quarter",

      // Toast messages
      task_assigned_success: "Task assigned successfully!",
      improve_sent_success: "Submitted for review successfully!",
      approved_success: "APPROVED SUCCESSFULLY!",
      rejected_success: "REJECTED!",
      error_occurred: "An error occurred!",
      load_error: "Error loading data",
      unauthorized_improve: "Cannot improve this task!",
      not_in_review: "Task is not in review status",

      // Roles
      leader: "Leader",
      staff: "Staff",

      before: "Before",
      after: "After",
      description: "Task description",
      no_description: "No description",
      required_files: "Required files",
      completed_files: "Completed files",
      file: "file",
      files: "files",
      feedback: "Feedback",
      has_note: "Has note",
      no_note_yet: "none yet",
      assigned_by: "Assigned by",
      created_date: "Created date",
      executor: "Assignee",
      deadline: "Deadline",
      view_detail: "View detail",
      improve: "Improve",
      review_now: "Review",
    },
  },
};

i18n
  .use(LanguageDetector) // Tự động phát hiện ngôn ngữ trình duyệt
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // Ngôn ngữ mặc định
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
