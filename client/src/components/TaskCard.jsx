// client/src/components/TaskCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageDisplay from "./ImageDisplay";
import { useTranslation } from "react-i18next";

const STATUS_COLORS = {
  ongoing: "warning",
  processing: "primary",
  review: "info",
  approved: "success",
  overdue: "danger",
};

export default function TaskCard({ task }) {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

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
    if (task.status === "approved") return t("approved");
    if (task.status === "rejected") return t("rejected");
    if (task.status === "needs_improvement") return t("needs_improvement");
    if (task.isOverdue) return t("overdue");

    const statusMap = {
      ongoing: t("processing"),
      processing: t("processing"),
      review: t("pending_approval"),
    };
    return statusMap[task.status] || task.status;
  };

  const getStatusColor = () => {
    if (task.status === "approved") return "success";
    if (task.status === "rejected") return "danger";
    if (task.status === "needs_improvement") return "warning";
    if (task.isOverdue) return "danger";
    return STATUS_COLORS[task.status] || "secondary";
  };

  const reqFilesCount = task.attachedFiles?.length || 0;
  const compFilesCount = task.completedFiles?.length || 0;
  const hasFeedback = !!(task.improveNote || task.reviewNote);

  return (
    <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden d-flex flex-column">
      {/* Header */}
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

      {/* Before - After Images */}
      <div className="row g-2 px-3 pt-2">
        {/* Before */}
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

        {/* After */}
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

      {/* Description */}
      <div className="px-3 flex-shrink-0">
        <div>
          <span className="text-primary fw-bold small">
            {t("description")}:
          </span>
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
          {task.description || t("no_description")}
        </p>
      </div>

      {/* Collapse */}
      <div className="mx-3 mt-1">
        <div
          className="bg-light border rounded-3 p-2 cursor-pointer user-select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="small fw-bold text-primary">
              {t("required_files")} {reqFilesCount} {t("file")}
              <br />
              {t("completed_files")}: {compFilesCount} {t("file")}
              <br />
              <span className={hasFeedback ? "text-success" : "text-muted"}>
                {t("feedback")}:{" "}
                {hasFeedback ? t("has_note") : t("no_note_yet")}
              </span>
            </div>
            <i
              className={`bi bi-chevron-${
                isExpanded ? "up" : "down"
              } fs-5 text-primary`}
            ></i>
          </div>
        </div>
      </div>

      {/* Info + Buttons */}
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
              <strong className="me-1 text-nowrap">{t("created_date")}:</strong>
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

        <div className="d-flex justify-content-center gap-1">
          <button
            className="btn btn-primary btn-sm px-3 py-2 fw-bold rounded-pill shadow-sm"
            onClick={() => navigate(`/task/${task._id}`)}
          >
            {t("view_detail")}
          </button>

          {!task.isOverdue &&
            [
              "ongoing",
              "processing",
              "review",
              "rejected",
              "needs_improvement",
            ].includes(task.status) && (
              <button
                className="btn btn-success btn-sm px-3 py-2 fw-bold rounded-pill shadow-sm"
                onClick={() => navigate(`/improve/${task._id}`)}
              >
                {t("improve")}
              </button>
            )}

          {canReview() && task.status === "review" && (
            <button
              className="btn btn-info btn-sm px-3 py-2 fw-bold rounded-pill shadow-sm text-white"
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
