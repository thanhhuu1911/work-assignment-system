// client/src/pages/TaskDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        alert(msg);
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
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
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
    ongoing: { color: "bg-warning", text: "Đang thực hiện" },
    review: { color: "bg-info", text: "Chờ duyệt" },
    approved: { color: "bg-success", text: "Hoàn thành" },
    rejected: { color: "bg-danger", text: "Không đạt" },
  }[task.status] || { color: "bg-secondary", text: task.status };

  const renderImage = (imageField) => {
    if (task.attachedFile) {
      return (
        <div className="d-flex align-items-center justify-content-center bg-white h-100">
          <img
            src="/logo-company.png"
            alt="Logo công ty"
            className="img-fluid"
            style={{ maxHeight: "80%", maxWidth: "80%" }}
          />
        </div>
      );
    }
    if (imageField) {
      return (
        <img
          src={`http://localhost:5000/uploads/${imageField}`}
          alt=""
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300?text=No+Image";
          }}
        />
      );
    }
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
        <span className="small">Chưa có ảnh</span>
      </div>
    );
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
                      className=".mb-0 fw-bold text-primary text-truncate"
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

                {/* ẢNH TRƯỚC - SAU */}
                <div className="row g-3 p-3">
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
                      {renderImage(task.beforeImage)}
                    </div>
                    <div className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold small">
                      Trước
                    </div>
                  </div>
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
                      {renderImage(task.afterImage)}
                    </div>
                    <div className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold small">
                      Sau
                    </div>
                  </div>
                </div>

                {/* MÔ TẢ CÔNG VIỆC – CÓ TIÊU ĐỀ + ICON ĐẸP */}
                <div className="px-3 pb-1 flex-shrink-0">
                  <div>
                    <span className="text-primary fw-bold small">
                      Mô tả công việc:
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
                  >
                    {task.description || "Không có mô tả"}
                  </p>
                </div>

                {/* FILE */}
                <div className="px-4 py-3">
                  {task.attachedFile && (
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-file-earmark-text text-primary"></i>
                      <a
                        href={`http://localhost:5000/uploads/${task.attachedFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary small text-decoration-underline text-truncate d-block"
                        style={{ maxWidth: "280px" }}
                      >
                        File yêu cầu: {task.attachedFile}
                      </a>
                    </div>
                  )}
                  {task.completedFile && (
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-check text-success"></i>
                      <a
                        href={`http://localhost:5000/uploads/${task.completedFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-success small text-decoration-underline text-truncate d-block"
                        style={{ maxWidth: "280px" }}
                      >
                        File hoàn thành: {task.completedFile}
                      </a>
                    </div>
                  )}
                </div>

                {/* GHI CHÚ TỪ CHỐI */}
                {task.reviewNote && (
                  <div className="mx-4 mt-2 p-3 bg-danger bg-opacity-10 border border-danger rounded-3">
                    <small className="text-danger fw-bold d-block">
                      Lý do không đạt:
                    </small>
                    <p className="text-danger mb-0 small">{task.reviewNote}</p>
                  </div>
                )}

                {/* THÔNG TIN CHI TIẾT */}
                <div className="p-4 pt-3 bg-white border-top">
                  <div className="row text-muted small">
                    <div className="col-6">
                      <div className="mb-2">
                        <strong>Người giao:</strong>{" "}
                        {task.assignedBy?.name || "Sir"}
                      </div>
                      <div>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(task.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-2">
                        <strong>Người làm:</strong>{" "}
                        {task.assignee?.name || "N/A"}
                      </div>
                      <div>
                        <strong>Hạn chót:</strong>{" "}
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
                      className="btn btn-outline-secondary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                      onClick={() => navigate(-1)}
                      style={{ minWidth: "110px" }}
                    >
                      Quay lại
                    </button>

                    {["ongoing", "rejected"].includes(task.status) && (
                      <button
                        className="btn btn-success btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                        onClick={() => navigate(`/improve/${task._id}`)}
                        style={{ minWidth: "110px" }}
                      >
                        Cải thiện
                      </button>
                    )}

                    {task.status === "review" && (
                      <button
                        className="btn btn-info btn-sm px-4 py-2 text-white fw-bold rounded-pill shadow-sm"
                        onClick={() => navigate(`/review/${task._id}`)}
                        style={{ minWidth: "110px" }}
                      >
                        Duyệt ngay
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
