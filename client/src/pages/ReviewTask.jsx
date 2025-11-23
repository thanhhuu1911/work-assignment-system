// client/src/pages/ReviewTask.jsx – PHIÊN BẢN HOÀN CHỈNH 2025
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageDisplay from "../components/ImageDisplay";

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
          alert("Công việc không ở trạng thái chờ duyệt");
          navigate("/dashboard");
          return;
        }
        setTask(taskData);
      } catch (err) {
        alert("Lỗi tải công việc");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

  const handleAction = async (action) => {
    // Chỉ kiểm tra bắt buộc khi TỪ CHỐI
    if (action === "reject" && !note.trim()) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    setSubmitting(action);

    try {
      const payload = {
        status: action === "approve" ? "approved" : "rejected",
      };
      // Nếu có ghi chú → gửi luôn (dù duyệt hay từ chối)
      if (note.trim()) {
        payload.reviewNote = note.trim();
      }

      await api.put(`/tasks/${id}/review`, payload);

      alert(action === "approve" ? "ĐÃ DUYỆT THÀNH CÔNG!" : "ĐÃ TỪ CHỐI!");
      navigate("/dashboard");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Server error"));
    } finally {
      setSubmitting("");
    }
  };

  if (loading || !task) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1 bg-light py-5 text-center">
          <div className="spinner-border text-primary" />
        </main>
        <Footer />
      </div>
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
                      Chờ duyệt
                    </span>
                  </div>
                </div>

                {/* ẢNH TRƯỚC - SAU */}
                <div className="row g-3 px-4 pt-3">
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                      <ImageDisplay
                        imageField={task.beforeImage}
                        attachedFile={task.attachedFile}
                        type="before"
                      />
                    </div>
                    <small className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold small">
                      Trước
                    </small>
                  </div>
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                      <ImageDisplay imageField={task.afterImage} type="after" />
                    </div>
                    <small className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold small">
                      Sau
                    </small>
                  </div>
                </div>

                {/* MÔ TẢ */}
                <div className="px-4 py-3">
                  <span className="text-primary fw-bold small d-block mb-1">
                    Mô tả công việc:
                  </span>
                  <p className="text-primary mb-0 small lh-lg">
                    {task.description || "Không có mô tả"}
                  </p>
                </div>

                {/* TIN NHẮN CẢI THIỆN */}
                {task.improveNote && (
                  <div className="mx-4 my-2 p-3 bg-primary bg-opacity-10 rounded-3">
                    <small className="text-primary fw-bold d-block">
                      {task.assignee?.name} đã nhắn:
                    </small>
                    <p className="text-primary mb-0 fst-italic ms-3">
                      “{task.improveNote}”
                    </p>
                  </div>
                )}

                {/* FILE ĐÍNH KÈM */}
                <div className="px-4 py-3 bg-light border-top border-bottom">
                  <small className="text-muted fw-bold d-block mb-2">
                    File đính kèm:
                  </small>

                  {task.attachedFile && (
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                      <a
                        href={`http://localhost:5000/uploads/${task.attachedFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-decoration-underline fw-medium small"
                      >
                        File yêu cầu:{" "}
                        {task.attachedFile.length > 35
                          ? task.attachedFile.substring(0, 32) + "..."
                          : task.attachedFile}
                      </a>
                    </div>
                  )}

                  {task.completedFile && (
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-check-fill text-success fs-5"></i>
                      <a
                        href={`http://localhost:5000/uploads/${task.completedFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-success text-decoration-underline fw-medium small"
                      >
                        File hoàn thành:{" "}
                        {task.completedFile.length > 35
                          ? task.completedFile.substring(0, 32) + "..."
                          : task.completedFile}
                      </a>
                    </div>
                  )}

                  {!task.attachedFile && !task.completedFile && (
                    <small className="text-muted">Không có file đính kèm</small>
                  )}
                </div>

                {/* GHI CHÚ (TỰ DO NHẬP) */}
                <div className="px-4 py-3 border-top">
                  <label className="form-label fw-bold text-dark small">
                    Ghi chú cho nhân viên{" "}
                    <span className="text-danger">(bắt buộc nếu từ chối)</span>
                  </label>
                  <textarea
                    className={`form-control ${
                      showWarning ? "border-danger shadow-sm" : ""
                    }`}
                    rows="4"
                    placeholder="Nhập lời nhắn hoặc lý do từ chối..."
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      if (e.target.value.trim()) setShowWarning(false);
                    }}
                  />
                  {showWarning && (
                    <div className="text-danger small mt-2 fw-medium">
                      Vui lòng nhập lý do trước khi từ chối!
                    </div>
                  )}
                </div>

                {/* NÚT HÀNH ĐỘNG – CÓ "QUAY LẠI" */}
                <div className="p-4 bg-white border-top d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-outline-primary px-4 py-2 fw-bold rounded-pill shadow-sm"
                    onClick={() => navigate(-1)}
                    disabled={!!submitting}
                  >
                    Quay lại
                  </button>

                  <button
                    className="btn btn-outline-success px-5 py-2 fw-bold rounded-pill shadow-sm"
                    onClick={() => handleAction("approve")}
                    disabled={!!submitting}
                  >
                    {submitting === "approve" ? "Đang duyệt..." : "DUYỆT"}
                  </button>

                  <button
                    className="btn btn-outline-danger px-5 py-2 fw-bold rounded-pill shadow-sm"
                    onClick={() => handleAction("reject")}
                    disabled={!!submitting}
                  >
                    {submitting === "reject" ? "Đang xử lý..." : "TỪ CHỐI"}
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
