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

  const handleReview = async () => {
    if (!decision) return alert("Vui lòng chọn hành động!");

    setLoading(true);
    try {
      const newStatus = decision === "approve" ? "approved" : "rejected";
      await api.put(`/tasks/${id}/review`, {
        status: newStatus,
        reviewNote: note.trim() || null,
      });
      alert(decision === "approve" ? "Đã duyệt!" : "Đã từ chối!");
      navigate("/dashboard");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  if (!task) return null;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-header bg-white text-center py-4">
                  <h3 className="text-primary fw-bold mb-0">
                    Duyệt công việc: {task.position}
                  </h3>
                </div>
                <div className="card-body p-5">
                  <div className="row g-4 mb-4">
                    <div className="col-6 text-center">
                      <p className="text-primary fw-bold">Trước</p>
                      <img
                        src={`http://localhost:5000/uploads/${task.beforeImage}`}
                        className="img-fluid rounded shadow"
                        style={{ height: "300px", objectFit: "cover" }}
                        alt="Trước"
                      />
                    </div>
                    <div className="col-6 text-center">
                      <p className="text-success fw-bold">Sau</p>
                      <img
                        src={`http://localhost:5000/uploads/${task.afterImage}`}
                        className="img-fluid rounded shadow"
                        style={{ height: "300px", objectFit: "cover" }}
                        alt="Sau"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      Ghi chú (nếu từ chối)
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Nhập lý do từ chối..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <div className="d-flex gap-3 mb-4">
                    <button
                      className={`btn flex-fill py-3 fw-bold ${
                        decision === "approve"
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={() => setDecision("approve")}
                    >
                      DUYỆT
                    </button>
                    <button
                      className={`btn flex-fill py-3 fw-bold ${
                        decision === "reject"
                          ? "btn-danger"
                          : "btn-outline-danger"
                      }`}
                      onClick={() => setDecision("reject")}
                    >
                      TỪ CHỐI
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      className="btn btn-primary px-5 py-2 fw-bold"
                      onClick={handleReview}
                      disabled={!decision || loading}
                    >
                      {loading ? "Đang xử lý..." : "XÁC NHẬN"}
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
