// client/src/components/TaskCard.jsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  pending: "warning",
  review: "info",
  approved: "success",
  rejected: "danger",
};

export default function TaskCard({ task, canReview }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getStatusText = () => {
    if (task.isOverdue) return "Overdue";
    return t(task.status);
  };

  const getStatusColor = () => {
    if (task.isOverdue) return "danger";
    return STATUS_COLORS[task.status] || "warning";
  };

  return (
    <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden d-flex flex-column">
      {/* HEADER – TO RÕ */}
      <div className="card-header bg-white border-0 py-2 px-3 flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center">
          <div
            className="text-primary fw-bold text-truncate"
            style={{ maxWidth: "140px", fontSize: "1rem" }} // TĂNG TỪ 0.875 → 1rem
            title={task.position}
          >
            {task.position}
          </div>
          <span
            className={`badge rounded-pill bg-${getStatusColor()} text-white px-2 py-1`}
            style={{ fontSize: "0.8rem" }} // RÕ HƠN
          >
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* ẢNH – VUÔNG HOÀN HẢO */}
      <div className="row g-2 p-2 flex-shrink-0">
        <div className="col-6 position-relative">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
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
          </div>
          <div
            className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold"
            style={{ fontSize: "0.75rem" }} // TĂNG  to 0.75rem
          >
            {t("before")}
          </div>
        </div>
        <div className="col-6 position-relative">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
            <img
              src={
                task.afterImage
                  ? `http://localhost:5000/uploads/${task.afterImage}`
                  : "/no-image.png"
              }
              alt="After"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div
            className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold"
            style={{ fontSize: "0.75rem" }} // TĂNG TỪ 0.65 → 0.75rem
          >
            {t("after")}
          </div>
        </div>
      </div>

      {/* MÔ TẢ – 2 DÒNG, TO RÕ */}
      <div className="px-3 pb-1 flex-shrink-0">
        <p
          className="text-primary mb-0"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: "1.4em",
            height: "2.8em",
            fontSize: "0.9rem", // TĂNG TỪ 0.8 → 0.9rem
            fontWeight: "500",
          }}
          title={task.description || "No description"}
        >
          {task.description || "No description"}
        </p>
      </div>

      {/* THÔNG TIN – TO RÕ, KHÔNG TRÀN */}
      <div className="card-body p-3 pt-1 flex-grow-1 d-flex flex-column">
        <div
          className="row text-dark flex-grow-1"
          style={{ fontSize: "0.8rem" }}
        >
          {" "}
          {/* TĂNG TỪ 0.7 → 0.8rem */}
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
              <strong className="me-1 text-nowrap">{t("created_at")}:</strong>
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
              <strong className="me-1 text-nowrap">{t("due_date")}:</strong>
              <span className="text-nowrap">
                {new Date(task.dueDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* NÚT – TO RÕ, ĐẸP */}
        <div className="d-flex gap-2 mt-3">
          <button
            className="btn btn-outline-primary btn-sm flex-fill py-2 text-nowrap fw-bold"
            style={{ minWidth: "75px", fontSize: "0.875rem" }} // TĂNG TỪ 0.8 → 0.875rem
            onClick={() => navigate(`/task/${task._id}`)}
          >
            {t("view_detail")}
          </button>

          {["pending", "review"].includes(task.status) && (
            <button
              className="btn btn-outline-success btn-sm flex-fill py-2 text-nowrap fw-bold"
              style={{ minWidth: "75px", fontSize: "0.875rem" }}
              onClick={() => navigate(`/improve/${task._id}`)}
            >
              {t("improve")}
            </button>
          )}

          {canReview && task.status === "review" && (
            <button
              className="btn btn-info btn-sm flex-fill py-2 text-white fw-bold"
              style={{ minWidth: "75px", fontSize: "0.875rem" }}
              onClick={() => navigate(`/review/${task._id}`)}
            >
              {t("review")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
