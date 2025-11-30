// client/src/pages/NewIssue.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";
import { showToast } from "../components/Toast";
export default function NewIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    description: "",
    department: "ME",
    assignee: "",
    startDate: "",
    dueDate: "",
    beforeImage: null,
    position: "",
  });
  const [beforePreview, setBeforePreview] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState([]); // { file, name, size, preview, isImage }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, storedUser] = await Promise.all([
          api.get("/auth/users"),
          Promise.resolve(JSON.parse(localStorage.getItem("user") || "{}")),
        ]);
        setUsers(userRes.data.data);
        setCurrentUser(storedUser);
      } catch (err) {
        showToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center d-flex justify-content-center align-items-center min-vh-100 bg-light">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!["manager", "a_manager", "leader"].includes(currentUser.role)) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <div className="alert alert-warning d-inline-block">No access</div>
        </div>
        <Footer />
      </>
    );
  }

  const getEligibleAssignees = () => {
    const role = currentUser.role;
    const group = currentUser.group;
    if (role === "manager" || role === "a_manager") {
      return users.filter(
        (u) => u.department === "ME" && u._id !== currentUser._id
      );
    }
    if (role === "leader") {
      return users.filter(
        (u) =>
          u.department === "ME" &&
          u.group === group &&
          u.role === "member" &&
          u._id !== currentUser._id
      );
    }
    return [];
  };

  const eligibleAssignees = getEligibleAssignees();

  const handleBeforeImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setForm({ ...form, beforeImage: file });
      setBeforePreview(URL.createObjectURL(file));
    }
  };

  const removeBeforeImage = () => {
    if (beforePreview) URL.revokeObjectURL(beforePreview);
    setBeforePreview(null);
    setForm({ ...form, beforeImage: null });
  };

  const handleAttachedFilesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const enhanced = newFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      isImage: file.type.startsWith("image/"),
      url: URL.createObjectURL(file), // để mở file trong tab mới
    }));
    setAttachedFiles((prev) => [...prev, ...enhanced].slice(0, 10));
  };

  const removeAttachedFile = (idx) => {
    const file = attachedFiles[idx];
    if (file.preview) URL.revokeObjectURL(file.preview);
    if (file.url) URL.revokeObjectURL(file.url);
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.description.slice(0, 50) || "ME Task");
    formData.append("description", form.description);
    formData.append("department", form.department);
    formData.append("assignee", form.assignee);
    formData.append("startDate", form.startDate);
    formData.append("dueDate", form.dueDate);
    formData.append("position", form.position);

    if (form.beforeImage) formData.append("beforeImage", form.beforeImage);
    attachedFiles.forEach((item) => formData.append("attachedFile", item.file));

    try {
      await api.post("/tasks", formData);
      showToast("Task assigned!", "Thành công!");
      navigate("/dashboard");
    } catch (err) {
      showToast("Error: " + (err.response?.data?.message || "Failed", "error"));
    }
  };

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
                    {t("assign_task")} - ME
                  </h2>

                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    {/* Các field cũ giữ nguyên */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Department
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value="ME"
                          disabled
                        >
                          <option value="ME">ME</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Assignee
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={form.assignee}
                          onChange={(e) =>
                            setForm({ ...form, assignee: e.target.value })
                          }
                          required
                        >
                          <option value="">-- Select --</option>
                          {eligibleAssignees.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} (
                              {u.role === "leader" ? "Leader" : "Staff"} -{" "}
                              {u.group})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="form-label small fw-semibold">
                        Position
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={form.position}
                        onChange={(e) =>
                          setForm({ ...form, position: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Select Position --</option>
                        {[
                          "ASSEMBLY A",
                          "ASSEMBLY B",
                          "CUTTING",
                          "EMBROIDERY",
                          "FINISH WH",
                          "PANEL",
                          "PRINT",
                          "QC/QA",
                          "VISOR",
                          "WAREHOUSE",
                        ].map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3">
                      <label className="form-label small fw-semibold">
                        Description
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="3"
                        placeholder="Enter task description..."
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="row g-3 mt-1">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Created Date
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={form.startDate}
                          onChange={(e) =>
                            setForm({ ...form, startDate: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Deadline
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={form.dueDate}
                          onChange={(e) =>
                            setForm({ ...form, dueDate: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* ẢNH TRƯỚC – CĂN GIỮA ĐẸP LUNG LINH */}
                    <div className="mt-2">
                      <label className="form-label small fw-semibold text-dark">
                        Before images
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        onChange={handleBeforeImageChange}
                      />
                      {beforePreview && (
                        <div className="mt-3 d-flex justify-content-center">
                          <div className="position-relative">
                            <img
                              src={beforePreview}
                              alt="Before preview"
                              className="img-fluid rounded-4 shadow-lg border"
                              style={{
                                maxHeight: "320px",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                            <button
                              type="button"
                              onClick={removeBeforeImage}
                              className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 mt-2 me-2"
                              style={{ width: "36px", height: "36px" }}
                            >
                              X
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FILE ĐÍNH KÈM – NHẤN LÀ MỞ TAB MỚI */}
                    <div className="mt-2">
                      <label className="form-label small fw-semibold text-dark">
                        File (Ctrl để chọn nhiều file)
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png,.jpeg"
                        onChange={handleAttachedFilesChange}
                      />

                      {attachedFiles.length > 0 && (
                        <div className="mt-3">
                          <small className="text-success fw-bold d-block mb-3">
                            Đã chọn {attachedFiles.length} file:
                          </small>
                          <div className="row g-3">
                            {attachedFiles.map((item, idx) => (
                              <div key={idx} className="col-12">
                                <div className="d-flex align-items-center justify-content-between bg-light rounded-4 px-4 py-3 border shadow-sm hover-shadow transition">
                                  <div className="d-flex align-items-center gap-3 flex-grow-1 text-truncate">
                                    {/* Icon preview */}
                                    {item.isImage ? (
                                      <img
                                        src={item.preview}
                                        alt="preview"
                                        className="rounded-3 border"
                                        style={{
                                          width: "56px",
                                          height: "56px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    ) : (
                                      <i className="bi bi-file-earmark-text-fill text-primary fs-3"></i>
                                    )}

                                    {/* Tên file – nhấn là mở đúng nội dung */}
                                    <div className="text-truncate">
                                      <span
                                        onClick={() => {
                                          // Tạo blob URL có đúng type → browser sẽ hiển thị được
                                          const blob = new Blob([item.file], {
                                            type:
                                              item.file.type ||
                                              "application/octet-stream",
                                          });
                                          const url = URL.createObjectURL(blob);
                                          window.open(url, "_blank");
                                          // Tự động dọn dẹp sau 10 phút để tránh rò rỉ bộ nhớ
                                          setTimeout(
                                            () => URL.revokeObjectURL(url),
                                            600000
                                          );
                                        }}
                                        className="text-primary fw-semibold text-decoration-underline"
                                        style={{ cursor: "pointer" }}
                                        title="Nhấn để mở file"
                                      >
                                        {item.name}
                                      </span>
                                      <div className="text-muted small">
                                        {(item.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                      </div>
                                    </div>
                                  </div>

                                  {/* Nút xóa */}
                                  <button
                                    type="button"
                                    onClick={() => removeAttachedFile(idx)}
                                    className="btn btn-sm btn-danger rounded-circle"
                                    style={{ width: "32px", height: "32px" }}
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-center gap-4 mt-5">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                        onClick={() => navigate("/dashboard")}
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm"
                      >
                        Giao việc
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
