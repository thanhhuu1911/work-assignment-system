// client/src/components/TaskCard.jsx
import { useTranslation } from "react-i18next";

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

  return (
    <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden position-relative">
      {/* HEADER: TITLE + STATUS */}
      <div className="card-header bg-white border-0 py-2 px-3 d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold text-primary">{task.title}</h6>
        <span
          className={`badge rounded-pill bg-${
            STATUS_COLORS[task.status] || "secondary"
          } text-white px-2 py-1 small`}
        >
          {t(task.status)}
        </span>
      </div>

      {/* 2 ẢNH NHỎ, BO TRÒN */}
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
            style={{ height: "90px", objectFit: "cover" }}
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
            style={{ height: "90px", objectFit: "cover" }}
          />
          <div
            className="position-absolute bottom-0 end-0 bg-white bg-opacity-80 text-dark px-2 py-1 rounded-start small fw-semibold"
            style={{ fontSize: "0.65rem" }}
          >
            {t("after")}
          </div>
        </div>
      </div>

      {/* INFO NHỎ GỌN */}
      <div className="card-body p-3 pt-2">
        <div className="small text-muted lh-sm">
          <div>
            <strong>{t("assigned_by")}:</strong>{" "}
            {task.assignedBy?.name || "N/A"}
          </div>
          <div>
            <strong>{t("assignee")}:</strong> {task.assignee?.name || "N/A"}
          </div>
          <div>
            <strong>{t("position")}:</strong> {task.position || "Chưa cập nhật"}
          </div>
          <div>
            <strong>{t("created_at")}:</strong>{" "}
            {new Date(task.createdAt).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong>{t("due_date")}:</strong>{" "}
            {new Date(task.dueDate).toLocaleDateString("vi-VN")}
          </div>
        </div>

        {/* NÚT HÀNH ĐỘNG */}
        <div className="d-flex gap-1 mt-2">
          <button className="btn btn-outline-info btn-sm flex-fill py-1">
            {t("view_detail")}
          </button>
          <button className="btn btn-outline-success btn-sm flex-fill py-1">
            {t("improve")}
          </button>
        </div>
      </div>
    </div>
  );
}
