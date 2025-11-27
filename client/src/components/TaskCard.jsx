// client/src/components/TaskCard.jsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ImageDisplay from "./ImageDisplay";

const STATUS_COLORS = {
  ongoing: "warning",
  processing: "primary",
  review: "info",
  approved: "success",
  overdue: "danger",
};

export default function TaskCard({ task }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const canReview = () => {
    if (!currentUser?.role) return false;
    if (["manager", "a_manager"].includes(currentUser.role)) return true;
    if (
      currentUser.role === "leader" &&
      task.assignee?.group === currentUser.group
    ) {
      return true;
    }
    return false;
  };

  const getFileName = (file) => {
    if (!file) return "File";
    if (typeof file === "string") return file;
    return file.original || "File không tên";
  };

  const getFilePath = (file) => {
    if (!file) return "#";
    if (typeof file === "string") return file;
    return file.stored || file;
  };

  const getStatusText = () => {
    if (task.status === "approved") return "Hoàn thành";
    if (task.isOverdue) return "Quá hạn";
    if (task.status === "rejected" && task.reviewNote) return "Không đạt"; // ← CHỈ KHI REJECTED MỚI HIỆN "KHÔNG ĐẠT"
    return t(task.status);
  };

  const getStatusColor = () => {
    if (task.status === "approved") return "success";
    if (task.isOverdue) return "danger";
    if (task.status === "rejected") return "danger"; // ← CHỈ KHI REJECTED MỚI ĐỎ
    return STATUS_COLORS[task.status] || "secondary";
  };

  return (
    <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden d-flex flex-column">
      <div className="card-header bg-white border-0 py-2 px-3 flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center">
          <div
            className="text-primary fw-bold text-truncate"
            style={{ maxWidth: "140px" }}
            title={task.position}
          >
            {task.position}
          </div>
          <span
            className={`badge rounded-pill bg-${getStatusColor()} text-white px-2 py-1`}
            style={{ fontSize: "0.8rem" }}
          >
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* === 2 Ô ẢNH TRƯỚC - SAU – ĐÃ SỬA HOÀN HẢO 100% === */}
      <div className="row g-2 px-3 pt-2">
        {/* ẢNH TRƯỚC */}
        <div className="col-6 position-relative">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
            <ImageDisplay
              imageField={task.beforeImage}
              attachedFile={task.attachedFiles}
              type="before"
            />
          </div>
          <small
            className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold"
            style={{ fontSize: "0.7rem" }}
          >
            {t("before")}
          </small>
        </div>

        {/* ẢNH SAU – BÂY GIỜ ĐẸP, KHÔNG CÒN BỰ, KHÔNG MÉO */}
        <div className="col-6 position-relative">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
            <ImageDisplay imageField={task.afterImage} type="after" />
          </div>
          <small
            className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold"
            style={{ fontSize: "0.7rem" }}
          >
            {t("after")}
          </small>
        </div>
      </div>

      <div className="px-2  flex-shrink-0">
        <div>
          <span className="text-primary fw-bold small">Mô tả công việc:</span>
        </div>
        <p
          className="text-primary mb-0"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: "1.4em",
            height: "2.8em",
            fontSize: "0.9rem",
            fontWeight: "500",
          }}
          title={task.description}
        >
          {task.description || "No description"}
        </p>
      </div>

      {/* <div className="mx-2 mt-1">
        
        {task.attachedFiles &&
          Array.isArray(task.attachedFiles) &&
          task.attachedFiles.length > 0 && (
            <div className="mb-2">
              <small className="text-dark fw-bold d-block">File yêu cầu:</small>
              {task.attachedFiles.map((file, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-file-earmark-text text-primary"></i>
                  <a
                    href={`http://localhost:5000/uploads/${getFilePath(file)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary small text-decoration-underline text-truncate d-inline-block"
                    style={{ maxWidth: "200px" }}
                    title={getFileName(file)}
                  >
                    {getFileName(file)}
                  </a>
                </div>
              ))}
            </div>
          )}

        {task.completedFiles &&
          Array.isArray(task.completedFiles) &&
          task.completedFiles.length > 0 && (
            <div>
              <small className="text-success fw-bold d-block mb-1">
                File hoàn thành:
              </small>
              {task.completedFiles.map((file, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2">
                  <i className="bi bi-file-check text-success"></i>
                  <a
                    href={`http://localhost:5000/uploads/${getFilePath(file)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success small text-decoration-underline text-truncate"
                    title={getFileName(file)}
                  >
                    {getFileName(file)}
                  </a>
                </div>
              ))}
            </div>
          )}
      </div> */}

      {/* TIN NHẮN TỪ NHÂN VIÊN KHI CẢI THIỆN – MÀU PRIMARY, KHÔNG BACKGROUND */}
      {task.improveNote && (
        <div className="mx-2 mt-1 p-2 rounded-3 border bg-light">
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-chat-dots-fill text-primary"></i>
            <div className="flex-grow-1">
              <small className="text-primary fw-bold d-block">
                {task.assignee?.name || "Nhân viên"} đã nhắn:
              </small>
              <p
                className="mb-0 text-primary small lh-sm"
                style={{ fontStyle: "italic" }}
              >
                “{task.improveNote}”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GHI CHÚ DUYỆT – HIỆN LUÔN KHI CÓ reviewNote, DÙ ĐÃ APPROVED HAY REJECTED */}
      {task.reviewNote && (
        <div className="mx-2 mt-1 p-2 rounded-3 border bg-light">
          <small
            className={`fw-bold d-block ${
              task.status === "approved" ? "text-success" : "text-danger"
            }`}
          >
            {task.status === "approved"
              ? "Ghi chú từ sếp:"
              : "Lý do không đạt:"}
          </small>
          <p
            className={`mb-0 small lh-sm ${
              task.status === "approved" ? "text-success" : "text-danger"
            } fst-italic`}
          >
            “{task.reviewNote}”
          </p>
        </div>
      )}
      {/* KHÓA CỨNG PHẦN DƯỚI – CHỈ THAY ĐOẠN NÀY */}
      <div className="mt-auto p-3 pt-2 bg-white border-top">
        <div className="row text-dark mb-3" style={{ fontSize: "0.8rem" }}>
          <div className="col-6">
            <div className="d-flex align-items-center mb-1">
              <strong className="me-1 text-nowrap">{t("assigned_by")}:</strong>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "70px" }}
                title={task.assignedBy?.name}
              >
                {task.assignedBy?.name || "N/A"}
              </span>
            </div>
            <div className="d-flex align-items-center">
              <strong className="me-1 text-nowrap">{t("created")}:</strong>
              <span className="text-nowrap">
                {new Date(task.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center mb-1">
              <strong className="me-1 text-nowrap">{t("assignee")}:</strong>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "70px" }}
                title={task.assignee?.name}
              >
                {task.assignee?.name || "N/A"}
              </span>
            </div>
            <div className="d-flex align-items-center">
              <strong className="me-1 text-nowrap">{t("deadline")}:</strong>
              <span className="text-nowrap">
                {new Date(task.dueDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
            onClick={() => navigate(`/task/${task._id}`)}
          >
            {t("view_detail")}
          </button>
          {!task.isOverdue &&
            ["ongoing", "processing", "review"].includes(task.status) && (
              <button
                className="btn btn-success btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                onClick={() => navigate(`/improve/${task._id}`)}
              >
                {t("improve")}
              </button>
            )}
          {canReview && task.status === "review" && (
            <button
              className="btn btn-info btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm text-white"
              onClick={() => navigate(`/review/${task._id}`)}
            >
              {t("review")}
            </button>
          )}
        </div>
      </div>
      {/* KẾT THÚC KHÓA CỨNG */}
    </div>
  );
}
