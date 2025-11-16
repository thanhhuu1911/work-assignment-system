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
        <main className="flex-grow-1 bg-light py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 col-xl-5">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    {/* Skeleton content */}
                    <div className="d-flex justify-content-between mb-3">
                      <div
                        className="bg-secondary bg-opacity-10 rounded"
                        style={{ width: "60%", height: "28px" }}
                      ></div>
                      <div
                        className="bg-secondary bg-opacity-10 rounded-pill"
                        style={{ width: "80px", height: "24px" }}
                      ></div>
                    </div>
                    <div
                      className="bg-secondary bg-opacity-10 rounded mb-3"
                      style={{ height: "60px" }}
                    ></div>
                    {/* ... thêm skeleton cho ảnh, info, nút ... */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
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

  const statusConfig = {
    ongoing: { color: "bg-warning", text: "Đang thực hiện" },
    review: { color: "bg-info", text: "Chờ duyệt" },
    completed: { color: "bg-success", text: "Hoàn thành" },
  };
  const status = statusConfig[task.status] || statusConfig.ongoing;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-xl-5">
              {/* CARD NHỎ GỌN */}
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  {/* HEADER: Tiêu đề + trạng thái */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0 fw-bold text-primary">
                      {task.position}
                    </h5>
                    <span
                      className={`badge rounded-pill ${status.color} text-white px-3 py-1 small`}
                    >
                      {status.text}
                    </span>
                  </div>

                  {/* MÔ TẢ NGẮN */}
                  <div className="mb-3">
                    <p className="text-muted small mb-1">
                      {task.description || "Không có mô tả"}
                    </p>
                  </div>

                  {/* 2 ẢNH NHỎ – CỐ ĐỊNH 200px */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <div className="text-center">
                        <small className="text-primary fw-semibold d-block mb-1">
                          Trước
                        </small>
                        <div
                          className="border rounded overflow-hidden"
                          style={{ height: "200px" }}
                        >
                          <img
                            src={`http://localhost:5000/uploads/${task.beforeImage}`}
                            alt="Trước"
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                            onError={(e) =>
                              (e.target.src =
                                "https://via.placeholder.com/300x200/4B5565/FFFFFF?text=Trước")
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="text-center">
                        <small className="text-primary fw-semibold d-block mb-1">
                          Sau
                        </small>
                        <div
                          className="border rounded overflow-hidden"
                          style={{ height: "200px" }}
                        >
                          {task.afterImage ? (
                            <img
                              src={`http://localhost:5000/uploads/${task.afterImage}`}
                              alt="Sau"
                              className="w-100 h-100"
                              style={{ objectFit: "cover" }}
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Sau")
                              }
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-muted small">
                              Chưa có
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* THÔNG TIN NHỎ GỌN */}
                  <div className="row text-dark small mb-3 g-2">
                    <div className="col-6">
                      <div className="d-flex justify-content-start align-items-center mb-1">
                        <span className="fw-medium">Người giao:</span>
                        <span className="text-end">
                          {task.assignedBy?.name || "Sir"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-start align-items-center mb-1">
                        <span className="fw-medium"> Ngày tạo:</span>
                        <span>
                          {new Date(task.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-start align-items-center mb-1">
                        <span className="fw-medium">Thực hiện:</span>
                        <span className="text-end">
                          {task.assignee?.name || "Leader IE"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-start align-items-center mb-1">
                        <span className="fw-medium">Hạn chót:</span>
                        <span>
                          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NÚT HÀNH ĐỘNG */}
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm px-3 fw-bold"
                      onClick={() => navigate(-1)}
                    >
                      Home
                    </button>

                    {["ongoing", "review"].includes(task.status) && (
                      <button
                        className="btn btn-success btn-sm px-3 fw-bold"
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
