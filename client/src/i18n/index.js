// client/src/i18n/index.js – PHIÊN BẢN CHUẨN NHẤT, ĐẸP NHẤT, NHẤT QUÁN NHẤT 2025
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // === AUTH ===
          login: "Login",
          register: "Register",
          logout: "Logout",

          // === DASHBOARD & STATUS ===
          task_list: "Task List",
          reload: "Reload",
          all_status: "All Status",
          ongoing: "Ongoing",
          review: "Review", // ← Dùng cho nút, filter, tiêu đề
          approved: "Approved",
          rejected: "Rejected",
          overdue: "Overdue",
          rejected_overdue: "Rejected / Overdue",
          // === BADGE TEXT (giữ nguyên để phân biệt trạng thái) ===
          "Chờ duyệt": "Pending Review",
          "Đang cải thiện": "Improving",
          "Không đạt": "Rejected",
          "Quá hạn": "Overdue",

          // === FILTERS ===
          "Vị Trí": "Position",
          Nhóm: "Group",
          Tên: "Name",

          // === TASK INFO ===
          assigned_by: "Assigned by",
          assignee: "Assignee",
          created: "Created",
          deadline: "Deadline",

          // === BUTTONS ===
          view_detail: "View Detail",
          improve: "Improve",
          review: "Review", // ← Nút bấm
          "Duyệt ngay": "Review Now",
          "Cải thiện": "Improve",
          create_task: "Create Task",
          assign_task: "Assign Task",

          // === TASKCARD & DETAIL ===
          before: "Before",
          after: "After",
          description: "Description",
          "Mô tả công việc:": "Task Description:",
          "Không có mô tả": "No description",

          // === REVIEW TASK PAGE ===
          "Duyệt công việc": "Review Task",
          "DUYỆT NGAY": "APPROVE NOW",
          DUYỆT: "APPROVE",
          "TỪ CHỐI": "REJECT",
          "Đang duyệt...": "Approving...",
          "Đang từ chối...": "Rejecting...",
          "Ghi chú (bắt buộc nếu từ chối)": "Note (required if reject)",
          "Nhập lý do từ chối...": "Enter rejection reason...",
          "Vui lòng nhập lý do trước khi từ chối!":
            "Please enter a rejection reason!",

          // === IMPROVE TASK PAGE ===
          GỬI: "SUBMIT",
          "Đang gửi...": "Submitting...",
          "Quay lại": "Back",
          feedback: "Message to boss",
          "vui lòng nhập feedback...": "Write a message to your boss...",
          "Nhấn hoặc Ctrl+V để dán ảnh hoặc file vào":
            "Click or Ctrl+V to paste image/file",
          "Vui lòng chọn ảnh sau khi cải thiện!":
            "Please select the improved image!",

          // === FEEDBACK & NOTES ===
          "Lý do không đạt:": "Reason for rejection:",
          "đã nhắn:": "sent a message:",
          "Nhân viên đã nhắn:": "Employee message:",

          // === ALERTS & MESSAGES ===
          "Gửi duyệt thành công! Sếp sẽ thấy lời nhắn của bạn trên task card":
            "Submitted successfully! Your boss will see your message.",
          "ĐÃ DUYỆT!": "APPROVED!",
          "ĐÃ TỪ CHỐI!": "REJECTED!",
          "Công việc không ở trạng thái chờ duyệt":
            "Task is not in review status",
          "Không thể cải thiện công việc này!": "Cannot improve this task!",
          "Không có công việc nào": "No tasks found",
          welcome: "Welcome",
        },
      },

      vi: {
        translation: {
          // === AUTH ===
          login: "Đăng nhập",
          register: "Đăng ký",
          logout: "Đăng xuất",

          // === DASHBOARD & STATUS ===
          task_list: "Danh sách công việc",
          reload: "Tải lại",
          all_status: "Tất cả trạng thái",
          ongoing: "Đang thực hiện",
          review: "Duyệt", // ← CHỈ DÙNG CHO NÚT, FILTER, TIÊU ĐỀ
          approved: "Đã duyệt",
          rejected: "Không đạt",
          overdue: "Quá hạn",
          in_review: "Chờ duyệt",
          // === BADGE TEXT TRONG CARD (GIỮ NGUYÊN ĐỂ NHÂN VIÊN BIẾT ĐANG CHỜ) ===
          "Chờ duyệt": "Chờ duyệt",
          "Đang cải thiện": "Đang cải thiện",
          "Không đạt": "Không đạt",
          "Quá hạn": "Quá hạn",
          rejected_overdue: "Quá hạn / Không đạt",
          // === FILTERS ===
          "Vị Trí": "Vị Trí",
          Nhóm: "Nhóm",
          Tên: "Tên nhân viên",

          // === TASK INFO ===
          assigned_by: "Người giao",
          assignee: "Người thực hiện",
          created: "Ngày tạo",
          deadline: "Hạn chót",

          // === BUTTONS ===
          view_detail: "Xem chi tiết",
          improve: "Cải thiện",
          review: "Duyệt", // ← Nút bấm
          "Duyệt ngay": "Duyệt ngay",
          "Cải thiện": "Cải thiện",
          create_task: "Tạo công việc",
          assign_task: "Giao nhiệm vụ",

          // === TASKCARD & DETAIL ===
          before: "Trước",
          after: "Sau",
          description: "Mô tả công việc",
          "Mô tả công việc:": "Mô tả công việc:",
          "Không có mô tả": "Không có mô tả",

          // === REVIEW TASK PAGE ===
          "Duyệt công việc": "Duyệt công việc",
          "DUYỆT NGAY": "DUYỆT NGAY",
          DUYỆT: "DUYỆT",
          "TỪ CHỐI": "TỪ CHỐI",
          "Đang duyệt...": "Đang duyệt...",
          "Đang từ chối...": "Đang từ chối...",
          "Ghi chú (bắt buộc nếu từ chối)": "Ghi chú (bắt buộc nếu từ chối)",
          "Nhập lý do từ chối...": "Nhập lý do từ chối...",
          "Vui lòng nhập lý do trước khi từ chối!":
            "Vui lòng nhập lý do trước khi từ chối!",

          // === IMPROVE TASK PAGE ===
          GỬI: "GỬI",
          "Đang gửi...": "Đang gửi...",
          "Quay lại": "Quay lại",
          feedback: "Nhắn cho sếp",
          "vui lòng nhập feedback...": "VD: Em đã làm lại sạch hơn rồi ạ...",
          "Nhấn hoặc Ctrl+V để dán ảnh hoặc file vào":
            "Nhấn hoặc Ctrl+V để dán ảnh/file",
          "Vui lòng chọn ảnh sau khi cải thiện!":
            "Vui lòng chọn ảnh sau khi cải thiện!",

          // === FEEDBACK & NOTES ===
          "Lý do không đạt:": "Lý do không đạt:",
          "đã nhắn:": "đã nhắn:",
          "Nhân viên đã nhắn:": "Nhân viên đã nhắn:",

          // === ALERTS & MESSAGES ===
          "Gửi duyệt thành công! Sếp sẽ thấy lời nhắn của bạn trên task card":
            "Gửi duyệt thành công! Sếp sẽ thấy lời nhắn của bạn trên task card",
          "ĐÃ DUYỆT!": "ĐÃ DUYỆT!",
          "ĐÃ TỪ CHỐI!": "ĐÃ TỪ CHỐI!",
          "Công việc không ở trạng thái chờ duyệt":
            "Công việc không ở trạng thái chờ duyệt",
          "Không thể cải thiện công việc này!":
            "Không thể cải thiện công việc này!",
          "Không có công việc nào": "Không có công việc nào",
          welcome: "Chào mừng",
        },
      },
    },
    lng: "en",
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
