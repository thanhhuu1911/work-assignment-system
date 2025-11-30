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
  const [isExpanded, setIsExpanded] = useState(false); // ← Trạng thái collapse
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
    if (task.status === "rejected" && task.reviewNote) return "Không đạt";
    const statusMap = {
      ongoing: "Đang thực hiện",
      processing: "Đang thực hiện",
      review: "Chờ duyệt",
    };
    return statusMap[task.status] || task.status;
  };

  const getStatusColor = () => {
    if (task.status === "approved") return "success";
    if (task.isOverdue) return "danger";
    if (task.status === "rejected") return "danger";
    return STATUS_COLORS[task.status] || "secondary";
  };

  // Tóm tắt cho collapse
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

      {/* Ảnh trước - sau */}
      <div className="row g-2 px-3 pt-2">
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
            Trước
          </small>
        </div>
        <div className="col-6 position-relative">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
            <ImageDisplay imageField={task.afterImage} type="after" />
          </div>
          <small
            className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold"
            style={{ fontSize: "0.7rem" }}
          >
            Sau
          </small>
        </div>
      </div>

      {/* Mô tả */}
      <div className="px-3 flex-shrink-0">
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
          {task.description || "Không có mô tả"}
        </p>
      </div>

      {/* KHỐI COLLAPSE SIÊU ĐẸP */}
      <div className="mx-3 mt-1">
        <div
          className="bg-light border rounded-3 p-2 cursor-pointer user-select-none"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ transition: "all 0.3s" }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="small fw-bold text-primary">
              File yêu cầu: {reqFilesCount} file{reqFilesCount > 0 && "s"}
              <br />
              File hoàn thành: {compFilesCount} file{compFilesCount > 0 && "s"}
              <br />
              <span className={hasFeedback ? "text-success" : "text-muted"}>
                Feedback: {hasFeedback ? "Có ghi chú" : "hiện tại chưa có"}
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

      {/* Phần dưới cùng - thông tin + nút */}
      <div className="mt-auto p-3 pt-2 bg-white border-top">
        <div className="row text-dark mb-3" style={{ fontSize: "0.8rem" }}>
          <div className="col-6">
            <div className="d-flex align-items-center mb-1">
              <strong className="me-1 text-nowrap">Người giao:</strong>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "70px" }}
                title={task.assignedBy?.name}
              >
                {task.assignedBy?.name || "N/A"}
              </span>
            </div>
            <div className="d-flex align-items-center">
              <strong className="me-1 text-nowrap">Ngày tạo:</strong>
              <span className="text-nowrap">
                {new Date(task.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center mb-1">
              <strong className="me-1 text-nowrap">Người thực hiện:</strong>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "70px" }}
                title={task.assignee?.name}
              >
                {task.assignee?.name || "N/A"}
              </span>
            </div>
            <div className="d-flex align-items-center">
              <strong className="me-1 text-nowrap">Hạn chót:</strong>
              <span className="text-nowrap">
                {new Date(task.dueDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-primary btn-sm px-3 py-2 fw-bold rounded-pill shadow-sm"
            onClick={() => navigate(`/task/${task._id}`)}
          >
            Xem chi tiết
          </button>
          {!task.isOverdue &&
            ["ongoing", "processing", "review"].includes(task.status) && (
              <button
                className="btn btn-success btn-sm px-3 py-2 fw-bold rounded-pill shadow-sm"
                onClick={() => navigate(`/improve/${task._id}`)}
              >
                Cải thiện
              </button>
            )}
          {canReview && task.status === "review" && (
            <button
              className="btn btn-info btn-sm px-3 py-2 fw-bold rounded-pill shadow-sm text-white"
              onClick={() => navigate(`/review/${task._id}`)}
            >
              Duyệt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
