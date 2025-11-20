// client/src/components/TaskCard.jsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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

  const getStatusText = () => {
    if (task.isOverdue) return "Quá hạn";
    if (task.status === "rejected" || task.reviewNote) return "Không đạt";
    return t(task.status);
  };

  const getStatusColor = () => {
    if (task.isOverdue || task.status === "rejected" || task.reviewNote)
      return "danger";
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

      {/* ẢNH TRƯỚC - SAU: HIỆN LOGO CÔNG TY NẾU CÓ FILE YÊU CẦU */}
      <div className="row g-2 p-2 flex-shrink-0">
        <div className="col-6 position-relative">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
            {task.attachedFile ? (
              <div className="d-flex align-items-center justify-content-center bg-white h-100">
                <img
                  src="/logo-company.png"
                  alt="Logo công ty"
                  className="img-fluid"
                  style={{ maxHeight: "80%", maxWidth: "80%" }}
                />
              </div>
            ) : (
              <img
                src={
                  task.beforeImage
                    ? `http://localhost:5000/uploads/${task.beforeImage}`
                    : "/placeholder.jpg"
                }
                alt="Before"
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          <div
            className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold"
            style={{ fontSize: "0.75rem" }}
          >
            {t("before")}
          </div>
        </div>

        <div className="col-6 position-relative">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
            {task.attachedFile ? (
              <div className="d-flex align-items-center justify-content-center bg-white h-100">
                <img
                  src="/logo-company.png"
                  alt="Logo công ty"
                  className="img-fluid"
                  style={{ maxHeight: "80%", maxWidth: "80%" }}
                />
              </div>
            ) : task.afterImage ? (
              <img
                src={`http://localhost:5000/uploads/${task.afterImage}`}
                alt="After"
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <img
                src="/no-image.png"
                alt="After"
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          <div
            className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold"
            style={{ fontSize: "0.75rem" }}
          >
            {t("after")}
          </div>
        </div>
      </div>

      <div className="px-3 pb-1 flex-shrink-0">
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

      {/* TIN NHẮN TỪ NHÂN VIÊN KHI CẢI THIỆN – MÀU PRIMARY, KHÔNG BACKGROUND */}
      {task.improveNote && (
        <div className="mx-1 mt-1 px-1">
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-chat-dots-fill text-primary mt-1"></i>
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

      {/* LÝ DO KHÔNG ĐẠT – NẰM DƯỚI TIN NHẮN, ĐỎ RÕ RÀNG */}
      {task.reviewNote && (
        <div className="mx-3 mt-2 p-2 bg-danger bg-opacity-10 border border-danger rounded-3">
          <small className="text-danger fw-bold d-block">
            Lý do không đạt:
          </small>
          <p className="text-danger text-center mb-0 small fw-medium lh-sm">
            {task.reviewNote}
          </p>
        </div>
      )}

      <div className="mx-3 mt-2">
        {task.attachedFile && (
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-file-earmark-text text-primary"></i>
            <a
              href={`http://localhost:5000/uploads/${task.attachedFile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary small text-decoration-underline"
            >
              File yêu cầu:{" "}
              {task.attachedFile.length > 30
                ? task.attachedFile.substring(0, 27) + "..."
                : task.attachedFile}
            </a>
          </div>
        )}
        {task.completedFile && (
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-file-check text-success"></i>
            <a
              href={`http://localhost:5000/uploads/${task.completedFile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-success small text-decoration-underline"
            >
              File hoàn thành:{" "}
              {task.completedFile.length > 30
                ? task.completedFile.substring(0, 27) + "..."
                : task.completedFile}
            </a>
          </div>
        )}
      </div>

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

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm flex-fill py-2 fw-bold"
            onClick={() => navigate(`/task/${task._id}`)}
          >
            {t("view_detail")}
          </button>
          {["ongoing", "processing", "review"].includes(task.status) && (
            <button
              className="btn btn-outline-success btn-sm flex-fill py-2 fw-bold"
              onClick={() => navigate(`/improve/${task._id}`)}
            >
              {t("improve")}
            </button>
          )}
          {canReview && task.status === "review" && (
            <button
              className="btn btn-info btn-sm flex-fill py-2 text-white fw-bold"
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
