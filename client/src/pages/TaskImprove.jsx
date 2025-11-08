import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TaskImprove() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("afterImage", file);
    formData.append("status", "completed");

    try {
      await api.put(`/tasks/${id}`, formData);
      alert("GỬI THÀNH CÔNG! Leader sẽ duyệt ngay!");
      navigate("/dashboard");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không gửi được"));
    }
  };

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="card">
          <div className="card-body p-5">
            <h2 className="text-center text-success mb-5">BÁO CÁO CẢI THIỆN</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold">Ảnh SAU KHI SỬA</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </div>
              <div className="text-center">
                <button type="submit" className="btn btn-success btn-lg px-5">
                  GỬI BÁO CÁO
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
