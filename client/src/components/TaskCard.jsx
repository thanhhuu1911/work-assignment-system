import { useTranslation } from "react-i18next";

const STATUS_COLORS = {
  support: "warning",
  pending: "secondary",
  processing: "primary",
  review: "info",
  approved: "success",
  rejected: "danger",
};

export default function TaskCard({ task, onUpdate }) {
  const { t } = useTranslation();

  return (
    <div className="task-card position-relative">
      <img
        src={
          task.beforeImage
            ? `http://localhost:5000/uploads/${task.beforeImage}`
            : "/placeholder.jpg"
        }
        alt="Before"
        className="task-image"
      />
      <span
        className={`status-badge bg-${
          STATUS_COLORS[task.status] || "secondary"
        }`}
      >
        {t(task.status)}
      </span>
      <div className="p-3">
        <h5 className="fw-bold mb-2">{task.title}</h5>
        <p className="text-muted small mb-1">
          <strong>{t("assigned_by")}:</strong> {task.assignedBy.name}
        </p>
        <p className="text-muted small mb-1">
          <strong>{t("assignee")}:</strong> {task.assignee.name}
        </p>
        <p className="text-muted small mb-1">
          <strong>{t("start_date")}:</strong>{" "}
          {new Date(task.startDate).toLocaleDateString("vi-VN")}
        </p>
        <p className="text-muted small mb-3">
          <strong>{t("due_date")}:</strong>{" "}
          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
        </p>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary flex-fill">
            {t("view")}
          </button>
          <button className="btn btn-sm btn-outline-success flex-fill">
            {t("improve")}
          </button>
        </div>
      </div>
    </div>
  );
}
