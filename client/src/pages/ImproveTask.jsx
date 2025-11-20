// client/src/pages/ImproveTask.jsx – PHIÊN BẢN HOÀN HẢO NHẤT, ĐẸP Y HỆT TASKCARD
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ImproveTask() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [afterImage, setAfterImage] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [completedFiles, setCompletedFiles] = useState([]);
  const [noteToBoss, setNoteToBoss] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        const taskData = res.data;
        if (!["ongoing", "rejected", "review"].includes(taskData.status)) {
          alert("Không thể cải thiện công việc này!");
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

  // Ctrl+V dán ảnh
  useEffect(() => {
    const handlePaste = (e) => {
      const file = e.clipboardData?.files[0];
      if (file && file.type.startsWith("image/")) {
        setAfterImage(file);
        setAfterPreview(URL.createObjectURL(file));
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImage(file);
      setAfterPreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCompletedFiles((prev) => [...prev, ...files].slice(0, 3));
  };

  const handleSubmit = async () => {
    if (!afterImage) return alert("Vui lòng chọn ảnh sau khi cải thiện!");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("afterImage", afterImage);
    completedFiles.forEach((file) => formData.append("completedFile", file));
    if (noteToBoss.trim()) formData.append("improveNote", noteToBoss.trim());

    try {
      await api.put(`/tasks/${id}/improve`, formData);
      alert(
        "Gửi duyệt thành công! Sếp sẽ thấy lời nhắn của bạn trên task card"
      );
      navigate("/dashboard");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Server error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1 bg-light py-5 text-center">
          <div className="spinner-border text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              {/* TASKCARD CẢI THIỆN – ĐẸP Y HỆT TASKCARD CHÍNH THỨC */}
              <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden d-flex flex-column">
                {/* HEADER */}
                <div className="card-header bg-white border-0 py-2 px-3 flex-shrink-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div
                      className="text-primary fw-bold text-truncate"
                      style={{ maxWidth: "140px" }}
                      title={task.position}
                    >
                      {task.position}
                    </div>
                    <span
                      className="badge rounded-pill bg-info text-white px-2 py-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Đang cải thiện
                    </span>
                  </div>
                </div>

                {/* ẢNH TRƯỚC - SAU */}
                <div className="row g-2 p-2 flex-shrink-0">
                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light">
                      {task.attachedFile ? (
                        <div className="d-flex align-items-center justify-content-center bg-white h-100">
                          <img
                            src="/logo-company.png"
                            alt="Logo"
                            className="img-fluid"
                            style={{ maxHeight: "80%", maxWidth: "80%" }}
                          />
                        </div>
                      ) : (
                        <img
                          src={
                            task.beforeImage
                              ? `http://localhost:5000/uploads/${task.beforeImage}`
                              : "/placeholder.jpg"
                          }
                          alt="Trước"
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div
                      className="position-absolute bottom-0 start-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-end fw-bold"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Trước
                    </div>
                  </div>

                  <div className="col-6 position-relative">
                    <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light ">
                      {afterPreview ? (
                        <img
                          src={afterPreview}
                          alt="Sau"
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100">
                          <i className="bi bi-camera-fill text-success fs-1 opacity-50"></i>
                        </div>
                      )}
                    </div>
                    <div
                      className="position-absolute bottom-0 end-0 bg-white bg-opacity-90 text-dark px-2 py-1 rounded-start fw-bold"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Sau
                    </div>
                  </div>
                </div>

                {/* MÔ TẢ CÔNG VIỆC */}
                <div className="px-3 pb-1 flex-shrink-0">
                  <span className="text-primary fw-bold small">
                    Mô tả công việc:
                  </span>
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
                    title={task.description}
                  >
                    {task.description || "Không có mô tả"}
                  </p>
                </div>

                {/* FEEDBACK CŨ (NẾU BỊ TỪ CHỐI) */}
                {task.reviewNote && (
                  <div className="mx-3 mt-2 p-2 bg-danger bg-opacity-10 border border-danger rounded-3">
                    <small className="text-danger fw-bold d-block">
                      Lý do không đạt:
                    </small>
                    <p className="text-danger text-center mb-0 small fw-medium lh-sm">
                      {task.reviewNote}
                    </p>
                  </div>
                )}

                {/* UPLOAD ẢNH SAU */}
                <div className="px-3 py-2">
                  <div
                    className="border-2 border-dashed border-success rounded-3 p-3 text-center bg-white border border-2 border-dashed border-success"
                    style={{ cursor: "pointer" }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleImageChange}
                    />
                    {afterPreview ? (
                      <img
                        src={afterPreview}
                        alt="Preview"
                        className="img-fluid rounded-3"
                        style={{ maxHeight: "180px" }}
                      />
                    ) : (
                      <div>
                        <i
                          className="bi bi-camera-fill text-success"
                          style={{ fontSize: "2rem" }}
                        ></i>
                        <p className="mt-2 mb-0 text-success small fw-bold">
                          Nhấn hoặc Ctrl+V để dán ảnh hoặc file vào
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Ô NHẮN CHO SẾP – ĐẸP NHƯ TASKCARD */}
                <div className="px-3 py-2">
                  <span className="text-success fw-bold small">feedback:</span>
                  <textarea
                    className="form-control form-control-sm mt-1"
                    rows="3"
                    placeholder="vui lòng nhập feedback..."
                    value={noteToBoss}
                    onChange={(e) => setNoteToBoss(e.target.value)}
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                {/* THÔNG TIN + NÚT – Y HỆT TASKCARD */}
                <div className="mt-auto p-3 pt-2 bg-white border-top">
                  <div
                    className="row text-dark mb-3"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <div className="col-6">
                      <div className="d-flex align-items-center mb-1">
                        <strong className="me-1 text-nowrap">
                          Người giao:
                        </strong>
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: "70px" }}
                          title={task.assignedBy?.name}
                        >
                          {task.assignedBy?.name || "N/A"}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <strong className="me-1 text-nowrap">Ngày tạo:</strong>
                        <span className="text-nowrap">
                          {new Date(task.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center mb-1">
                        <strong className="me-1 text-nowrap">
                          Người thực hiện:
                        </strong>
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: "70px" }}
                          title={task.assignee?.name}
                        >
                          {task.assignee?.name || "N/A"}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <strong className="me-1 text-nowrap">Hạn chót:</strong>
                        <span
                          className={
                            task.isOverdue
                              ? "text-danger fw-bold"
                              : "text-nowrap"
                          }
                        >
                          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                          {task.isOverdue && " (Quá hạn)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <button
                      className="btn btn-outline-secondary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                      onClick={() => navigate(-1)}
                      disabled={submitting}
                      style={{ minWidth: "110px" }}
                    >
                      Quay lại
                    </button>

                    <button
                      className="btn btn-success btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                      onClick={handleSubmit}
                      disabled={submitting || !afterImage}
                      style={{ minWidth: "110px" }}
                    >
                      {submitting ? "Đang gửi..." : "GỬI"}
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
