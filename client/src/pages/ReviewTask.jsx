// client/src/pages/ReviewTask.jsx
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
  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);

        // BACKEND TRẢ VỀ TRỰC TIẾP TASK → DÙNG res.data
        const task = res.data; // KHÔNG CẦN .data

        if (!task || task.status !== "review") {
          alert("Công việc không tồn tại hoặc không ở trạng thái duyệt");
          navigate("/dashboard");
          return;
        }

        setTask(task);
      } catch (err) {
        console.error("Lỗi fetch task:", err);
        alert("Lỗi: " + (err.response?.data?.message || "Server error"));
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

  const handleReview = async () => {
    if (!decision) return alert("Vui lòng chọn hành động!");

    setLoading(true);
    try {
      await api.put(`/tasks/${id}/review`, {
        status: decision === "approve" ? "approved" : "ongoing",
        reviewNote: note,
      });
      alert(
        decision === "approve" ? "Duyệt thành công!" : "Yêu cầu cải thiện lại!"
      );
      navigate("/dashboard");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  // SKELETON LOADING
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
                    <div
                      className="bg-secondary bg-opacity-10 rounded mb-3"
                      style={{ height: "32px" }}
                    ></div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <div
                          className="bg-secondary bg-opacity-10 rounded"
                          style={{ height: "200px" }}
                        ></div>
                      </div>
                      <div className="col-6">
                        <div
                          className="bg-secondary bg-opacity-10 rounded"
                          style={{ height: "200px" }}
                        ></div>
                      </div>
                    </div>
                    <div
                      className="bg-secondary bg-opacity-10 rounded mb-3"
                      style={{ height: "80px" }}
                    ></div>
                    <div className="d-flex gap-2">
                      <div
                        className="bg-secondary bg-opacity-10 rounded flex-fill"
                        style={{ height: "40px" }}
                      ></div>
                      <div
                        className="bg-secondary bg-opacity-10 rounded flex-fill"
                        style={{ height: "40px" }}
                      ></div>
                    </div>
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

  if (!task || task.status !== "review") {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <div className="alert alert-danger">
            Không thể duyệt công việc này
          </div>
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
            <div className="col-lg-6 col-xl-5">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 text-center mb-4 text-primary fw-bold">
                    {t("review_task")} - {task.position}
                  </h2>

                  {/* ẢNH TRƯỚC - SAU */}
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="text-center">
                        <small className="text-primary fw-semibold d-block mb-2">
                          Trước
                        </small>
                        <img
                          src={`http://localhost:5000/uploads/${task.beforeImage}`}
                          alt="Trước"
                          className="img-fluid rounded border"
                          style={{ height: "200px", objectFit: "cover" }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <small className="text-primary fw-semibold d-block mb-2">
                          Sau
                        </small>
                        <img
                          src={`http://localhost:5000/uploads/${task.afterImage}`}
                          alt="Sau"
                          className="img-fluid rounded border"
                          style={{ height: "200px", objectFit: "cover" }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GHI CHÚ */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="Nhập lý do từ chối hoặc góp ý..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  {/* LỰA CHỌN */}
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className={`btn flex-fill py-2 fw-bold ${
                        decision === "approve"
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={() => setDecision("approve")}
                    >
                      Duyệt
                    </button>
                    <button
                      className={`btn flex-fill py-2 fw-bold ${
                        decision === "reject"
                          ? "btn-danger"
                          : "btn-outline-danger"
                      }`}
                      onClick={() => setDecision("reject")}
                    >
                      Từ chối
                    </button>
                  </div>

                  {/* NÚT HÀNH ĐỘNG */}
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm px-3"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                    >
                      Quay lại
                    </button>
                    <button
                      className="btn btn-primary btn-sm px-3 fw-bold"
                      onClick={handleReview}
                      disabled={loading || !decision}
                    >
                      {loading ? "Đang xử lý..." : "Xác nhận"}
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
