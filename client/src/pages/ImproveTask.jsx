// client/src/pages/ImproveTask.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageDisplay from "../components/ImageDisplay";
import { showToast } from "../components/Toast";
import { useTranslation } from "react-i18next";

export default function ImproveTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Ảnh "Sau"
  const [afterImage, setAfterImage] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);

  // File hoàn thành
  const [completedFiles, setCompletedFiles] = useState([]);
  const [noteToBoss, setNoteToBoss] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        const taskData = res.data;
        if (
          !["ongoing", "rejected", "needs_improvement"].includes(
            taskData.status
          )
        ) {
          showToast("Không thể cải thiện công việc này!", "Cảnh báo!");
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

  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAfterImage(file);
      setAfterPreview(URL.createObjectURL(file));
    }
  };

  const removeAfterImage = () => {
    if (afterPreview) URL.revokeObjectURL(afterPreview);
    setAfterImage(null);
    setAfterPreview(null);
  };

  const handleCompletedFilesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const enhanced = newFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      isImage: file.type.startsWith("image/"),
    }));
    setCompletedFiles((prev) => [...prev, ...enhanced].slice(0, 10));
  };

  const removeFile = (idx) => {
    const file = completedFiles[idx];
    if (file.preview) URL.revokeObjectURL(file.preview);
    setCompletedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    // Chỉ cần có ít nhất 1 ảnh hoặc 1 file là được gửi
    if (!afterImage && completedFiles.length === 0) {
      return showToast(
        "Vui lòng chọn ít nhất 1 ảnh 'Sau' hoặc 1 file hoàn thành!",
        "Cảnh báo!"
      );
    }

    setSubmitting(true);
    const formData = new FormData();

    if (afterImage) formData.append("afterImage", afterImage);
    completedFiles.forEach((item) =>
      formData.append("completedFile", item.file)
    );
    if (noteToBoss.trim()) formData.append("improveNote", noteToBoss.trim());

    try {
      await api.put(`/tasks/${id}/improve`, formData);
      showToast("Gửi duyệt thành công!", "Thành công!");
      navigate("/dashboard");
    } catch (err) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.message.includes("quá hạn")
      ) {
        showToast(
          "Công việc đã quá hạn, không thể gửi cải thiện nữa!",
          "Hết hạn rồi!"
        );
      } else {
        showToast(
          "Lỗi: " + (err.response?.data?.message || "Server error"),
          "Có lỗi xảy ra!"
        );
      }
    } finally {
      setSubmitting(false);
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
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                {/* HEADER */}
                <div className="card-header bg-white border-0 py-3 px-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-0 text-primary fw-bold text-truncate"
                      style={{ maxWidth: "70%" }}
                    >
                      {task.position}
                    </h5>
                    <span className="badge bg-success text-white rounded-pill px-3 py-2">
                      {t("improving")}
                    </span>
                  </div>
                </div>

                {/* ẢNH TRƯỚC - SAU */}
                <div className="row g-2 px-3 pt-2">
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                      <ImageDisplay
                        imageField={task.beforeImage}
                        attachedFile={task.attachedFiles}
                        type="before"
                      />
                    </div>
                    <div className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end small fw-bold">
                      {t("before")}
                    </div>
                  </div>
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                      {afterPreview ? (
                        <img
                          src={afterPreview}
                          alt="Sau"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                          <i className="bi bi-image fs-3 opacity-50"></i>
                        </div>
                      )}
                    </div>
                    <div className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start small fw-bold">
                      {t("after")}
                    </div>
                  </div>
                </div>

                {/* MÔ TẢ + LÝ DO KHÔNG ĐẠT */}
                <div className="px-4 py-3">
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
                  {task.reviewNote && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 border-0">
                      <strong>{t("reason_reject")}</strong> “{task.reviewNote}”
                    </div>
                  )}
                </div>

                {/* UPLOAD ẢNH SAU (KHÔNG BẮT BUỘC) */}
                <div className="px-4 pb-3">
                  <label className="form-label text-dark fw-bold small">
                    {t("after_images")}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm rounded-pill shadow-sm"
                    onChange={handleAfterImageChange}
                  />
                  {afterPreview && (
                    <div className="mt-3 position-relative d-flex justify-content-center">
                      <img
                        src={afterPreview}
                        alt="Preview"
                        className="img-fluid rounded-3 shadow-sm "
                        style={{ maxHeight: "200px" }}
                      />
                      <button
                        type="button"
                        onClick={removeAfterImage}
                        className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 mt-2 me-2"
                        style={{ width: "32px", height: "32px" }}
                      >
                        X
                      </button>
                    </div>
                  )}
                </div>

                {/* UPLOAD FILE HOÀN THÀNH */}
                <div className="px-4 pb-3">
                  <label className="form-label text-dark fw-bold small">
                    {t("completed_files")} ({t("completed_files_hint")})
                  </label>
                  <input
                    type="file"
                    multiple
                    className="form-control form-control-sm rounded-pill shadow-sm"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png,.jpeg,.zip,.rar"
                    onChange={handleCompletedFilesChange}
                  />

                  {completedFiles.length > 0 && (
                    <div className="mt-3">
                      <small className="text-success fw-bold d-block mb-2">
                        Đã chọn {completedFiles.length} file:
                      </small>
                      {completedFiles.map((item, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center justify-content-between bg-white border rounded-4 px-3 py-2 mb-2 hover-shadow shadow-sm"
                        >
                          <div className="d-flex align-items-center gap-3 flex-grow-1 text-truncate">
                            {item.isImage ? (
                              <img
                                src={item.preview}
                                alt={item.name}
                                className="rounded border"
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <i className="bi bi-file-earmark-text-fill text-primary fs-4"></i>
                            )}

                            <div className="text-truncate flex-grow-1">
                              <span
                                onClick={() => {
                                  const blob = new Blob([item.file], {
                                    type:
                                      item.file.type ||
                                      "application/octet-stream",
                                  });
                                  const url = URL.createObjectURL(blob);
                                  window.open(url, "_blank");
                                  // Dọn dẹp sau 10 phút
                                  setTimeout(
                                    () => URL.revokeObjectURL(url),
                                    600000
                                  );
                                }}
                                className="text-primary fw-semibold text-decoration-underline"
                                style={{ cursor: "pointer" }}
                                title="Nhấn để mở file"
                              >
                                {item.name}
                              </span>
                              <div className="text-muted small">
                                {(item.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="btn btn-sm btn-danger rounded-circle"
                            style={{ width: "32px", height: "32px" }}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* GHI CHÚ */}
                <div className="px-4 pb-3">
                  <label className="form-label text-dark fw-bold small">
                    {t("feedback")}
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    placeholder="Nhập lời nhắn (không bắt buộc)..."
                    value={noteToBoss}
                    onChange={(e) => setNoteToBoss(e.target.value)}
                  />
                </div>

                {/* NÚT GỬI */}
                <div className="d-flex justify-content-center gap-4 mb-3">
                  <button
                    className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-2"
                    onClick={() => navigate(-1)}
                    disabled={submitting}
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
                    className="btn btn-success btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                    onClick={handleSubmit}
                    disabled={
                      submitting || (!afterImage && completedFiles.length === 0)
                    }
                  >
                    {submitting ? t("sending") : t("send_for_approval")}
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
