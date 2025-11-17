// client/src/pages/ImproveTask.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ImproveTask() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [afterImage, setAfterImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        const taskData = res.data;
        setTask(taskData);
        setIsOverdue(taskData.isOverdue || false);
      } catch (err) {
        alert("Không tải được công việc");
        navigate("/dashboard");
      }
    };
    fetchTask();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverdue) return alert("Công việc đã quá hạn! Không thể cải thiện.");
    if (!afterImage) return alert("Vui lòng chọn ảnh!");

    setLoading(true);
    const formData = new FormData();
    formData.append("afterImage", afterImage);

    try {
      await api.put(`/tasks/${id}/improve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Cải thiện thành công!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi server";
      alert("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return (
      <>
        <Header />
        <main className="flex-grow-1 bg-light py-5 text-center">
          <div className="spinner-border text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-header bg-white text-primary py-4 text-center">
                  <h4 className="mb-0 fw-bold">{t("improve_task")}</h4>
                  <p className="mb-0 mt-2 text-danger fw-bold">
                    {task.position}
                  </p>
                </div>
                <div className="card-body p-4">
                  {isOverdue && (
                    <div className="alert alert-danger text-center fw-bold">
                      QUÁ HẠN – Không thể cải thiện!
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-bold text-primary">
                        Ảnh sau khi cải thiện
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control form-control-lg"
                        onChange={(e) => setAfterImage(e.target.files[0])}
                        disabled={isOverdue}
                        required
                      />
                    </div>

                    <div className="d-flex gap-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary flex-fill py-2"
                        onClick={() => navigate(-1)}
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success flex-fill py-2 fw-bold"
                        disabled={loading || isOverdue}
                      >
                        {loading ? "Đang gửi..." : "Gửi duyệt"}
                      </button>
                    </div>
                  </form>
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
