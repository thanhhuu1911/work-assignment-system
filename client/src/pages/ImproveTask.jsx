// client/src/pages/ImproveTask.jsx
import { useState } from "react";
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
  // const [resultFile, setResultFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!afterImage) {
      return alert("Vui lòng chọn ảnh!");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("afterImage", afterImage);

    console.log("Đang gửi file:", afterImage.name, afterImage.size);

    try {
      const res = await api.put(`/tasks/${id}/improve`, formData);
      console.log("Server trả về:", res.data);
      alert("Cập nhật thành công!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Lỗi API:", err.response || err);
      const msg = err.response?.data?.message || "Lỗi server";
      alert("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-xl-5">
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-header bg-white text-primary py-3 px-4">
                  <h4 className="mb-0 text-center fw-bold">
                    {t("improve_task")}
                  </h4>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-primary">
                        {t("Chọn ảnh")}
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        accept="image/*"
                        onChange={(e) => setAfterImage(e.target.files[0])}
                      />
                      <small className="text-dark">
                        Chọn ảnh sau khi cải thiện
                      </small>
                    </div>
                    {/* 
                    <div className="mb-4">
                      <label className="form-label fw-bold text-primary">
                        {t("result_file")}
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => setResultFile(e.target.files[0])}
                      />
                      <small className="text-muted">PDF, DOCX, XLSX...</small>
                    </div> */}

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary flex-fill py-2 fw-bold"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                      >
                        {t("cancel")}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary flex-fill py-2 text-white fw-bold"
                        disabled={loading}
                      >
                        {loading ? t("sending") : t("submit")}
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
