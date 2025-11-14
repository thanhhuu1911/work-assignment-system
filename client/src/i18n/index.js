// client/src/i18n.js
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

          // === DASHBOARD ===
          task_list: "Task List",
          reload: "Reload",
          all_status: "All Status",
          ongoing: "Ongoing",
          in_review: "In Review", // ĐÃ SỬA
          approved: "Approved",
          rejected: "Rejected", // ĐÃ THÊM
          overdue: "Overdue",

          // === FILTERS ===
          "Vị Trí": "Position",
          Nhóm: "Group",
          Tên: "Name",

          // === TASK INFO ===
          assigned_by: "Assigned by",
          assignee: "Assignee",
          created_at: "Created At",
          due_date: "Due Date",

          // === BUTTONS ===
          view_detail: "View Detail",
          improve: "Improve",
          review: "Review",
          create_task: "Create Task",

          // === FORM & UI ===
          description: "Description",
          before: "Before",
          after: "After",
          no_tasks: "No tasks available",
          welcome: "Welcome",
        },
      },
      vi: {
        translation: {
          // === AUTH ===
          login: "Đăng nhập",
          register: "Đăng ký",
          logout: "Đăng xuất",

          // === DASHBOARD ===
          task_list: "Danh sách công việc",
          reload: "Tải lại",
          all_status: "Tất cả trạng thái",
          ongoing: "Đang thực hiện",
          in_review: "Chờ duyệt", // ĐÃ SỬA
          approved: "Đã duyệt",
          rejected: "Không đạt", // ĐÃ THÊM
          overdue: "Quá hạn", // ĐÃ SỬA (chỉ 1 lần)
          Overdue: "Quá hạn", // ĐÃ SỬA (chỉ 1 lần)

          // === FILTERS ===
          "Vị Trí": "Vị Trí",
          Nhóm: "Nhóm",
          Tên: "Tên",

          // === TASK INFO ===
          assigned_by: "Người giao",
          assignee: "Người thực hiện",
          created_at: "Ngày tạo",
          due_date: "Hạn hoàn thành",

          // === BUTTONS ===
          view_detail: "Xem chi tiết",
          improve: "Cải thiện",
          review: "Duyệt",
          create_task: "Tạo công việc",

          // === FORM & UI ===
          description: "Mô tả công việc",
          before: "Trước",
          after: "Sau",
          no_tasks: "Không có công việc nào",
          welcome: "Chào mừng",
        },
      },
      ko: {
        translation: {
          // === AUTH ===
          login: "로그인",
          register: "회원가입",
          logout: "로그아웃",

          // === DASHBOARD ===
          task_list: "작업 목록",
          reload: "새로고침",
          all_status: "모든 상태",
          ongoing: "진행 중", // ĐÃ SỬA
          in_review: "검토 중", // ĐÃ SỬA
          approved: "승인됨",
          rejected: "거부됨", // ĐÃ THÊM
          overdue: "기한 초과", // ĐÃ SỬA

          // === FILTERS ===
          "Vị Trí": "위치",
          Nhóm: "그룹",
          Tên: "이름",

          // === TASK INFO ===
          assigned_by: "할당자",
          assignee: "담당자",
          created_at: "생성일",
          due_date: "마감일",

          // === BUTTONS ===
          view_detail: "상세 보기",
          improve: "개선",
          review: "검토",
          create_task: "작업 생성",

          // === FORM & UI ===
          description: "작업 설명",
          before: "전",
          after: "후",
          no_tasks: "작업이 없습니다",
          welcome: "환영합니다",
        },
      },
    },
    lng: "vi", // MẶC ĐỊNH TIẾNG VIỆT
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
