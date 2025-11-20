// client/src/pages/ReviewTask.jsx – PHIÊN BẢN NHỎ GỌN, ĐẸP NHƯ TASKCARD 2025
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    if (action === "reject" && !note.trim()) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    setSubmitting(action);
    try {
      const newStatus = action === "approve" ? "approved" : "rejected";
      await api.put(`/tasks/${id}/review`, {
        status: newStatus,
        reviewNote: action === "reject" ? note.trim() : null,
      });

      alert(action === "approve" ? "ĐÃ DUYỆT!" : "ĐÃ TỪ CHỐI!");
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
              {/* TASKCARD DUYỆT – NHỎ GỌN, ĐẸP NHƯ TASKCARD */}
              <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden d-flex flex-column">
                {/* HEADER */}
                <div className="card-header bg-white border-0 py-2 px-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div
                      className="text-primary fw-bold text-truncate"
                      style={{ maxWidth: "160px" }}
                    >
                      {task.position}
                    </div>
                    <span
                      className="badge rounded-pill bg-info text-white px-2 py-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Chờ duyệt
                    </span>
                  </div>
                </div>

                {/* ẢNH TRƯỚC - SAU */}
                <div className="row g-2 p-2">
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
                      {task.attachedFile ? (
                        <div className="d-flex align-items-center justify-content-center bg-white h-100">
                          <img
                            src="/logo-company.png"
                            alt="Logo"
                            className="img-fluid"
                            style={{ maxHeight: "80%", maxWidth: "80%" }}
                          />
                        </div>
                      ) : (
                        <img
                          src={`http://localhost:5000/uploads/${task.beforeImage}`}
                          alt="Trước"
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold small">
                      Trước
                    </div>
                  </div>
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
                      <img
                        src={`http://localhost:5000/uploads/${task.afterImage}`}
                        alt="Sau"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold small">
                      Sau
                    </div>
                  </div>
                </div>

                {/* MÔ TẢ */}
                <div className="px-3 py-2">
                  <span className="text-primary fw-bold small">
                    Mô tả công việc:
                  </span>
                  <p
                    className="text-primary mb-0 small"
                    style={{ lineHeight: "1.4" }}
                  >
                    {task.description || "Không có mô tả"}
                  </p>
                </div>

                {/* TIN NHẮN TỪ NHÂN VIÊN */}
                {task.improveNote && (
                  <div className="px-3 py-2 bg-primary bg-opacity-10">
                    <small className="text-primary fw-bold d-block">
                      {task.assignee?.name} đã nhắn:
                    </small>
                    <p className="text-primary mb-0 small fst-italic ms-3">
                      “{task.improveNote}”
                    </p>
                  </div>
                )}

                {/* FILE ĐÍNH KÈM */}
                <div className="mx-3 mt-2">
                  {task.attachedFile && (
                    <div className="d-flex align-items-center gap-2 small mb-1">
                      <i className="bi bi-file-earmark-text text-primary"></i>
                      <a
                        href={`http://localhost:5000/uploads/${task.attachedFile}`}
                        target="_blank"
                        className="text-primary text-decoration-underline text-truncate d-block"
                        style={{ maxWidth: "180px" }}
                      >
                        {task.attachedFile}
                      </a>
                    </div>
                  )}
                  {task.completedFile && (
                    <div className="d-flex align-items-center gap-2 small">
                      <i className="bi bi-file-check text-success"></i>
                      <a
                        href={`http://localhost:5000/uploads/${task.completedFile}`}
                        target="_blank"
                        className="text-success text-decoration-underline text-truncate d-block"
                        style={{ maxWidth: "180px" }}
                      >
                        {task.completedFile}
                      </a>
                    </div>
                  )}
                </div>

                {/* GHI CHÚ TỪ CHỐI */}
                <div className="px-3 py-3 border-top mt-auto">
                  <label className="form-label fw-bold small text-danger">
                    Ghi chú (bắt buộc nếu từ chối)
                  </label>
                  <textarea
                    className={`form-control form-control-sm ${
                      showWarning ? "border-danger" : ""
                    }`}
                    rows="3"
                    placeholder="Nhập lý do từ chối..."
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      if (e.target.value.trim()) setShowWarning(false);
                    }}
                  />
                  {showWarning && (
                    <small className="text-danger d-block mt-1">
                      Vui lòng nhập lý do trước khi từ chối!
                    </small>
                  )}
                </div>

                {/* NÚT DUYỆT / TỪ CHỐI */}
                <div className="p-3 bg-white border-top">
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="btn btn-success btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                      onClick={() => handleAction("approve")}
                      disabled={!!submitting}
                      style={{ minWidth: "110px" }}
                    >
                      {submitting === "approve" ? "Đang duyệt..." : "DUYỆT"}
                    </button>

                    <button
                      className="btn btn-danger btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                      onClick={() => handleAction("reject")}
                      disabled={!!submitting}
                      style={{ minWidth: "110px" }}
                    >
                      {submitting === "reject" ? "Đang từ chối..." : "TỪ CHỐI"}
                    </button>
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
