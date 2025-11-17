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

  // CẤU HÌNH TRẠNG THÁI ĐẸP
  const statusConfig = {
    ongoing: { color: "bg-warning", text: "Đang thực hiện" },
    review: { color: "bg-info", text: "Chờ duyệt" },
    approved: { color: "bg-success", text: "Hoàn thành" },
    rejected: { color: "bg-danger", text: "Không đạt" },
  };
  const status = statusConfig[task.status] || statusConfig.ongoing;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                {/* HEADER */}
                <div className="card-header bg-white border-0 py-4 px-5 d-flex justify-content-between align-items-center">
                  <h3 className="mb-0 fw-bold text-primary">{task.position}</h3>
                  <span
                    className={`badge rounded-pill ${status.color} text-white px-4 py-2 fs-5`}
                  >
                    {status.text}
                  </span>
                </div>

                <div className="card-body p-5">
                  {/* MÔ TẢ CÔNG VIỆC */}
                  <div className="mb-5">
                    <h6 className="text-primary fw-semibold mb-3">
                      Mô tả công việc
                    </h6>
                    <p className="text-muted fs-5 lh-base">
                      {task.description || "Không có mô tả"}
                    </p>
                  </div>

                  {/* ẢNH TRƯỚC - SAU - CỐ ĐỊNH 320px */}
                  <div className="row g-5 mb-5">
                    {/* TRƯỚC */}
                    <div className="col-6 text-center">
                      <h6 className="text-primary fw-bold mb-3">Trước</h6>
                      <div
                        className="border rounded-4 overflow-hidden shadow-sm"
                        style={{ height: "320px" }}
                      >
                        <img
                          src={`http://localhost:5000/uploads/${task.beforeImage}`}
                          alt="Trước"
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/500x320?text=Ảnh+trước";
                          }}
                        />
                      </div>
                    </div>

                    {/* SAU */}
                    <div className="col-6 text-center">
                      <h6
                        className={`fw-bold mb-3 ${
                          task.afterImage ? "text-success" : "text-muted"
                        }`}
                      >
                        Sau
                      </h6>
                      <div
                        className="border rounded-4 overflow-hidden shadow-sm bg-light d-flex align-items-center justify-content-center"
                        style={{ height: "320px" }}
                      >
                        {task.afterImage ? (
                          <img
                            src={`http://localhost:5000/uploads/${task.afterImage}`}
                            alt="Sau"
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/500x320?text=Ảnh+sau";
                            }}
                          />
                        ) : (
                          <span className="text-muted fs-4">
                            Chưa có ảnh sau
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* GHI CHÚ TỪ CHỐI - CHỈ HIỆN KHI BỊ REJECT */}
                  {task.status === "rejected" && task.reviewNote && (
                    <div className="alert alert-danger rounded-4 p-4 mb-5">
                      <h6 className="fw-bold mb-2">Lý do không đạt</h6>
                      <p className="mb-0 fs-5">{task.reviewNote}</p>
                    </div>
                  )}

                  {/* THÔNG TIN CHI TIẾT */}
                  <div className="row g-4 text-muted">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                        <strong>Người giao:</strong>
                        <span className="text-dark fw-semibold">
                          {task.assignedBy?.name || "Sir"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <strong>Ngày tạo:</strong>
                        <span>
                          {new Date(task.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                        <strong>Người thực hiện:</strong>
                        <span className="text-dark fw-semibold">
                          {task.assignee?.name || "Leader IE"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <strong>Hạn chót:</strong>
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

                  {/* NÚT HÀNH ĐỘNG - ĐẸP, CENTER, 2 NÚT */}
                  <div className="d-flex justify-content-center gap-4 mt-5">
                    <button
                      className="btn btn-outline-secondary btn-lg px-5 py-3 fw-bold"
                      onClick={() => navigate(-1)}
                    >
                      Quay lại
                    </button>

                    {["ongoing", "rejected"].includes(task.status) && (
                      <button
                        className="btn btn-success btn-lg px-5 py-3 fw-bold shadow"
                        onClick={() => navigate(`/improve/${task._id}`)}
                      >
                        Cải thiện lại
                      </button>
                    )}

                    {task.status === "review" && (
                      <button
                        className="btn btn-info btn-lg px-5 py-3 fw-bold text-white shadow"
                        onClick={() => navigate(`/review/${task._id}`)}
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
