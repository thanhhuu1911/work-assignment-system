// client/src/pages/TaskDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageDisplay from "../components/ImageDisplay";
import { showToast } from "../components/Toast";
export default function TaskDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || "Không tải được công việc";
        showToast(msg, "Có lỗi xảy ra!");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="d-flex flex-column justify-content-center align-items-center py-5">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!task) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <div className="alert alert-danger">Không tìm thấy công việc</div>
        </div>
        <Footer />
      </>
    );
  }

  const status = {
    ongoing: { color: "bg-warning", text: t("ongoing") },
    review: { color: "bg-info", text: t("review") },
    approved: { color: "bg-success", text: t("approved") },
    rejected: { color: "bg-danger", text: t("rejected") },
  }[task.status] || { color: "bg-secondary", text: task.status };

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

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden">
                {/* HEADER */}
                <div className="card-header bg-white border-0 py-3 px-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-0 fw-bold text-primary text-truncate"
                      style={{ maxWidth: "70%" }}
                    >
                      {task.position}
                    </h5>
                    <span
                      className={`badge rounded-pill ${status.color} text-white px-3 py-2`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
                {/* // Ảnh TRƯỚC */}
                <div className="row g-3 px-4 pt-3">
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                      <ImageDisplay
                        imageField={task.beforeImage}
                        attachedFile={task.attachedFiles}
                        type="before"
                      />
                    </div>
                    <div className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold small">
                      {t("before")}
                    </div>
                  </div>
                  {/* // Ảnh SAU */}
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                      <ImageDisplay imageField={task.afterImage} type="after" />
                    </div>
                    <div className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold small">
                      {t("after")}
                    </div>
                  </div>
                </div>
                {/* MÔ TẢ CÔNG VIỆC – CÓ TIÊU ĐỀ + ICON ĐẸP */}
                <div className="px-4  flex-shrink-0">
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
                    {task.description || "No description"}
                  </p>
                </div>

                <div className="mx-4 mt-0">
                  {/* File khi giao việc */}
                  {task.attachedFiles &&
                    Array.isArray(task.attachedFiles) &&
                    task.attachedFiles.length > 0 && (
                      <div className="mb-2">
                        <small className="text-dark fw-bold d-block">
                          {t("required_files")}
                        </small>
                        {task.attachedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="d-flex align-items-center gap-2 mb-1"
                          >
                            <i className="bi bi-file-earmark-text text-primary"></i>
                            <a
                              href={`/uploads/${getFilePath(file)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary small text-decoration-underline text-truncate d-inline-block"
                              style={{ maxWidth: "500px" }}
                              title={getFileName(file)}
                            >
                              {getFileName(file)}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* File hoàn thành */}
                  {task.completedFiles &&
                    Array.isArray(task.completedFiles) &&
                    task.completedFiles.length > 0 && (
                      <div>
                        <small className="text-dark fw-bold d-block mb-1">
                          {t("completed_files")}:
                        </small>
                        {task.completedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="d-flex align-items-center gap-2"
                          >
                            <i className="bi bi-file-check text-primary"></i>
                            <a
                              href={`/uploads/${getFilePath(file)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary small text-decoration-underline text-truncate"
                              title={getFileName(file)}
                              style={{ maxWidth: "500px" }}
                            >
                              {getFileName(file)}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* TIN NHẮN TỪ NHÂN VIÊN KHI CẢI THIỆN – MÀU PRIMARY, KHÔNG BACKGROUND */}
                {task.improveNote && (
                  <div className="mx-2 mt-1 p-2 rounded-3 border bg-light">
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-chat-dots-fill text-dark"></i>
                      <div className="flex-grow-1">
                        <small className="text-dark fw-bold d-block">
                          {task.assignee?.name || "Nhân viên"} đã nhắn:
                        </small>
                        <p
                          className="mb-0 text-dark small lh-sm"
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
                  <div className="mx-3 mt-1 p-2 rounded-3 border bg-light">
                    <small
                      className={`fw-bold d-block ${
                        task.status === "approved" ? "text-dark" : "text-danger"
                      }`}
                    >
                      {task.status === "approved"
                        ? "Feedback từ Leader:"
                        : "Lý do không đạt:"}
                    </small>
                    <p
                      className={`mb-0 small lh-sm ${
                        task.status === "approved" ? "text-dark" : "text-danger"
                      } fst-italic`}
                    >
                      “{task.reviewNote}”
                    </p>
                  </div>
                )}
                {/* THÔNG TIN CHI TIẾT */}
                <div className="p-4 pt-3 bg-white border-top">
                  <div className="row text-muted small">
                    <div className="col-6">
                      <div className="mb-2">
                        <strong>{t("assigned_by")}:</strong>{" "}
                        {task.assignedBy?.name || "Sir"}
                      </div>
                      <div>
                        <strong>{t("created_date")}:</strong>{" "}
                        {new Date(task.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-2">
                        <strong>{t("executor")}:</strong>{" "}
                        {task.assignee?.name || "N/A"}
                      </div>
                      <div>
                        <strong>{t("deadline")}:</strong>{" "}
                        <span
                          className={
                            task.isOverdue ? "text-danger fw-bold" : ""
                          }
                        >
                          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                          {task.isOverdue && " (Quá hạn)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NÚT HÀNH ĐỘNG */}
                  <div className="d-flex justify-content-center gap-3 mt-4 px-3">
                    <button
                      className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-1"
                      onClick={() => navigate(-1)}
                      style={{ minWidth: "110px" }}
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354l-6-6z" />
                      </svg>
                      {t("home")}
                    </button>

                    {["ongoing", "needs_improvement"].includes(task.status) && (
                      <button
                        className="btn btn-success btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                        onClick={() => navigate(`/improve/${task._id}`)}
                        style={{ minWidth: "110px" }}
                      >
                        {t("improve")}
                      </button>
                    )}

                    {task.status === "review" && (
                      <button
                        className="btn btn-info btn-sm px-4 py-2 text-white fw-bold rounded-pill shadow-sm"
                        onClick={() => navigate(`/review/${task._id}`)}
                        style={{ minWidth: "110px" }}
                      >
                        {t("review")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
