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
        setTask(res.data.data);
      } catch (err) {
        const msg = err.response?.data?.message || "Không tải được công việc";
        alert(msg);
        navigate("/dashboard"); // QUAY LẠI DASHBOARD
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
          <div className="spinner-border text-primary" />
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

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                  <h4 className="mb-0 text-primary fw-bold">{task.position}</h4>
                  <span
                    className={`badge rounded-pill bg-${
                      task.status === "pending" ? "secondary" : "info"
                    } text-white`}
                  >
                    {t(task.status)}
                  </span>
                </div>

                <div className="card-body p-4">
                  {/* MÔ TẢ */}
                  <div className="mb-4">
                    <h6 className="text-primary fw-semibold">
                      {t("description")}
                    </h6>
                    <p className="text-muted">
                      {task.description || "Không có mô tả"}
                    </p>
                  </div>

                  {/* ẢNH BEFORE & AFTER */}
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <h6 className="text-primary fw-semibold">
                        {t("before")}
                      </h6>
                      <img
                        src={`http://localhost:5000/uploads/${task.beforeImage}`}
                        alt="Before"
                        className="img-fluid rounded-3 w-100"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    </div>
                    <div className="col-6">
                      <h6 className="text-primary fw-semibold">{t("after")}</h6>
                      {task.afterImage ? (
                        <img
                          src={`http://localhost:5000/uploads/${task.afterImage}`}
                          alt="After"
                          className="img-fluid rounded-3 w-100"
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="bg-light border rounded-3 d-flex align-items-center justify-content-center text-muted"
                          style={{ height: "200px" }}
                        >
                          Chưa có ảnh sau
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FILE GIAO VIỆC */}
                  {task.attachment && (
                    <div className="mb-4">
                      <h6 className="text-primary fw-semibold">
                        {t("file_giao_viec")}
                      </h6>
                      <a
                        href={`http://localhost:5000/uploads/${task.attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Tải file
                      </a>
                    </div>
                  )}

                  {/* FILE KẾT QUẢ */}
                  {task.resultFile && (
                    <div className="mb-4">
                      <h6 className="text-primary fw-semibold">
                        {t("file_ket_qua")}
                      </h6>
                      <a
                        href={`http://localhost:5000/uploads/${task.resultFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-success"
                      >
                        Tải file kết quả
                      </a>
                    </div>
                  )}

                  {/* THÔNG TIN */}
                  <div className="row small text-muted">
                    <div className="col-6">
                      <div>
                        <strong>{t("assigned_by")}:</strong>{" "}
                        {task.assignedBy?.name}
                      </div>
                      <div>
                        <strong>{t("created_at")}:</strong>{" "}
                        {new Date(task.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <strong>{t("assignee")}:</strong> {task.assignee?.name}
                      </div>
                      <div>
                        <strong>{t("due_date")}:</strong>{" "}
                        {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => navigate(-1)}
                    >
                      Quay lại
                    </button>
                    {task.status === "pending" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => navigate(`/improve/${task._id}`)}
                      >
                        Cải thiện
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
