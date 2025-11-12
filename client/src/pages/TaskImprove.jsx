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
  const [resultFile, setResultFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!afterImage && !resultFile)
      return alert("Vui lòng chọn ít nhất 1 file");

    setLoading(true);
    const formData = new FormData();
    if (afterImage) formData.append("afterImage", afterImage);
    if (resultFile) formData.append("resultFile", resultFile);

    try {
      await api.put(`/tasks/${id}/improve`, formData);
      alert("Cập nhật thành công!");
      navigate("/dashboard");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Thử lại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      {/* MAIN – ĐẨY NỘI DUNG XUỐNG DƯỚI HEADER */}
      <main className="flex-grow-1 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-xl-5">
              {/* CARD – HIỂN THỊ ĐẸP */}
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-header bg-white border-0 py-3 px-4">
                  <h4 className="mb-0 text-success fw-bold">
                    {t("improve_task")}
                  </h4>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-primary">
                        {t("after_image")}
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        onChange={(e) => setAfterImage(e.target.files[0])}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-primary">
                        {t("result_file")} (PDF, DOCX, XLSX...)
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => setResultFile(e.target.files[0])}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm flex-fill"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                      >
                        {t("cancel")}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success btn-sm flex-fill fw-bold"
                        disabled={loading}
                      >
                        {loading ? "Đang gửi..." : t("submit")}
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
