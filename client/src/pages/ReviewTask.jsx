// client/src/pages/ReviewTask.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageDisplay from "../components/ImageDisplay";
import { showToast } from "../components/Toast";

export default function ReviewTask() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        const taskData = res.data;
        if (taskData.status !== "review") {
          showToast("Công việc không ở trạng thái chờ duyệt", "Cảnh báo!");
          navigate("/dashboard");
          return;
        }
        setTask(taskData);
      } catch (err) {
        showToast("Lỗi tải công việc", "Có lỗi xảy ra!");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

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

  const handleAction = async (action) => {
    let newStatus;
    if (action === "approve") newStatus = "approved";
    else if (action === "reject") newStatus = "rejected";
    else if (action === "needs_improvement") newStatus = "needs_improvement";

    // Bắt buộc note khi từ chối HOẶC yêu cầu cải thiện
    if (
      (newStatus === "rejected" || newStatus === "needs_improvement") &&
      !note.trim()
    ) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    setSubmitting(action);

    try {
      const payload = {
        status: newStatus,
      };
      if (note.trim()) {
        payload.reviewNote = note.trim();
      }

      await api.put(`/tasks/${id}/review`, payload);

      let toastMessage = "";
      let toastType = "Thành công!";
      if (newStatus === "approved") {
        toastMessage = "ĐÃ DUYỆT THÀNH CÔNG!";
      } else if (newStatus === "rejected") {
        toastMessage = "ĐÃ TỪ CHỐI!";
        toastType = "Cảnh báo!";
      } else if (newStatus === "needs_improvement") {
        toastMessage = "ĐÃ YÊU CẦU CẢI THIỆN!";
        toastType = "Cảnh báo!";
      }

      showToast(toastMessage, toastType);
      navigate("/dashboard");
    } catch (err) {
      showToast(
        "Lỗi: " + (err.response?.data?.message || "Server error"),
        "Có lỗi xảy ra!"
      );
    } finally {
      setSubmitting("");
    }
  };

  if (loading || !task) {
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

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden d-flex flex-column">
                {/* HEADER */}
                <div className="card-header bg-white border-0 py-3 px-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-0 fw-bold text-primary text-truncate"
                      style={{ maxWidth: "70%" }}
                    >
                      {task.position}
                    </h5>
                    <span className="badge rounded-pill bg-info text-white px-3 py-2">
                      {t("pending_review")}
                    </span>
                  </div>
                </div>

                {/* ẢNH TRƯỚC - SAU */}
                <div className="row g-3 px-4 pt-3">
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                      <ImageDisplay
                        imageField={task.beforeImage}
                        attachedFile={task.attachedFiles}
                        type="before"
                      />
                    </div>
                    <small className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold small">
                      {t("before")}
                    </small>
                  </div>
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                      <ImageDisplay imageField={task.afterImage} type="after" />
                    </div>
                    <small className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold small">
                      {t("after")}
                    </small>
                  </div>
                </div>

                {/* MÔ TẢ */}
                <div className="px-4 py-2">
                  <div>
                    <span className="text-primary fw-bold small">
                      {t("task_description")}
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
                          {t("completed_files")}
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
                              style={{ maxWidth: "500px" }}
                              title={getFileName(file)}
                            >
                              {getFileName(file)}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* TIN NHẮN TỪ NHÂN VIÊN */}
                {task.improveNote && (
                  <div className="mx-2 mt-1 p-2 rounded-3 border bg-light">
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-chat-dots-fill text-dark"></i>
                      <div className="flex-grow-1">
                        <small className="text-dark fw-bold d-block">
                          {task.assignee?.name || "Nhân viên"}
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

                {/* GHI CHÚ DUYỆT CŨ (nếu có) */}
                {task.reviewNote && (
                  <div className="mx-2 mt-1 p-2 rounded-3 border bg-light">
                    <small
                      className={`fw-bold d-block ${
                        task.status === "approved" ? "text-dark" : "text-danger"
                      }`}
                    >
                      {task.status === "approved"
                        ? t("leader_feedback")
                        : t("reject_reason")}
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

                {/* Ô NHẬP GHI CHÚ */}
                <div className="px-4 py-3 border-top">
                  <label className="form-label fw-bold text-dark small">
                    {t("note_for_employee")}{" "}
                    <span className="text-danger">
                      {t("note_required_for_reject_or_improve")}
                    </span>
                  </label>
                  <textarea
                    className={`form-control ${
                      showWarning ? "border-danger shadow-sm" : ""
                    }`}
                    rows="4"
                    placeholder={t("note_placeholder")}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      if (e.target.value.trim()) setShowWarning(false);
                    }}
                  />
                  {showWarning && (
                    <div className="text-danger small mt-2 fw-medium">
                      {t("note_warning")}
                    </div>
                  )}
                </div>

                {/* NÚT HÀNH ĐỘNG */}
                <div className="p-4 bg-white border-top d-flex justify-content-center gap-3 flex-wrap">
                  <button
                    className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-1"
                    onClick={() => navigate(-1)}
                    disabled={!!submitting}
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

                  <button
                    className="btn btn-info text-white px-4 py-2 fw-bold rounded-pill shadow-sm"
                    onClick={() => handleAction("approve")}
                    disabled={!!submitting}
                  >
                    {submitting === "approve" ? t("approving") : t("approve")}
                  </button>

                  <button
                    className="btn btn-warning text-white px-4 py-2 fw-bold rounded-pill shadow-sm"
                    onClick={() => handleAction("needs_improvement")}
                    disabled={!!submitting}
                  >
                    {submitting === "needs_improvement"
                      ? t("requesting_improvement")
                      : t("needs_improvement")}
                  </button>

                  <button
                    className="btn btn-danger px-4 py-2 fw-bold rounded-pill shadow-sm"
                    onClick={() => handleAction("reject")}
                    disabled={!!submitting}
                  >
                    {submitting === "reject" ? t("rejecting") : t("reject")}
                  </button>
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
