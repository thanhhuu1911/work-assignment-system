// client/src/components/TaskCard.jsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  support: "warning",
  pending: "secondary",
  processing: "primary",
  review: "info",
  approved: "success",
  rejected: "danger",
};

export default function TaskCard({ task }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden position-relative">
      {/* HEADER */}
      <div className="card-header bg-white border-0 py-2 px-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <small className="text-primary fw-semibold">{task.position}</small>
          </div>
          <span
            className={`badge rounded-pill bg-${
              task.isOverdue
                ? "danger"
                : STATUS_COLORS[task.status] || "secondary"
            } text-white px-2 py-1 small`}
          >
            {task.isOverdue ? "Overdue" : t(task.status)}
          </span>
        </div>
      </div>

      {/* ẢNH */}
      <div className="row g-2 p-2">
        <div className="col-6 position-relative">
          <img
            src={
              task.beforeImage
                ? `http://localhost:5000/uploads/${task.beforeImage}`
                : "/placeholder.jpg"
            }
            alt="Before"
            className="img-fluid rounded-3 w-100"
            style={{ height: "150px", objectFit: "cover" }}
          />
          <div
            className="position-absolute bottom-0 start-0 bg-white bg-opacity-80 text-dark px-2 py-1 rounded-end small fw-semibold"
            style={{ fontSize: "0.65rem" }}
          >
            {t("before")}
          </div>
        </div>
        <div className="col-6 position-relative">
          <img
            src={
              task.afterImage
                ? `http://localhost:5000/uploads/${task.afterImage}`
                : "/no-image.png"
            }
            alt="After"
            className="img-fluid rounded-3 w-100"
            style={{ height: "150px", objectFit: "cover" }}
          />
          <div
            className="position-absolute bottom-0 end-0 bg-white bg-opacity-80 text-dark px-2 py-1 rounded-start small fw-semibold"
            style={{ fontSize: "0.65rem" }}
          >
            {t("after")}
          </div>
        </div>
      </div>

      {/* MÔ TẢ */}
      <div className="px-3 pb-1">
        <p className="small text-primary mb-0">
          {task.description || "No description"}
        </p>
      </div>

      {/* THÔNG TIN */}
      <div className="card-body p-3 pt-1">
        <div className="row small text-muted">
          <div className="col-6">
            <div className="d-flex">
              <strong className="me-1">{t("assigned_by")}:</strong>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "80px" }}
              >
                {task.assignedBy?.name || "N/A"}
              </span>
            </div>
            <div className="d-flex mt-1">
              <strong className="me-1">{t("created_at")}:</strong>
              <span>
                {new Date(task.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex">
              <strong className="me-1">{t("assignee")}:</strong>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "80px" }}
              >
                {task.assignee?.name || "N/A"}
              </span>
            </div>
            <div className="d-flex mt-1">
              <strong className="me-1">{t("due_date")}:</strong>
              <span>{new Date(task.dueDate).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>

        {/* NÚT */}
        <div className="d-flex gap-1 mt-3">
          <button
            className="btn btn-outline-info btn-sm flex-fill py-1"
            onClick={() => navigate(`/task/${task._id}`)}
          >
            {t("view_detail")}
          </button>
          <button
            className="btn btn-outline-success btn-sm flex-fill py-1"
            onClick={() => navigate(`/improve/${task._id}`)}
          >
            {t("improve")}
          </button>
        </div>
      </div>
    </div>
  );
}
