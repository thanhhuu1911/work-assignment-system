import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";

export default function NewIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    assignee: "",
    startDate: "",
    dueDate: "",
    beforeImage: null,
  });
  const [users, setUsers] = useState([]); // LẤY THẬT TỪ DB

  // LẤY DANH SÁCH NHÂN VIÊN THẬT TỪ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        setUsers(res.data.data); // ← ObjectId thật, 100% hợp lệ
      } catch (err) {
        alert("Không tải được danh sách nhân viên");
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.description.slice(0, 50) || "Công việc ME");
    formData.append("description", form.description);
    formData.append("department", form.department);
    formData.append("assignee", form.assignee); // ← BÂY GIỜ LÀ ObjectId THẬT!
    formData.append("startDate", form.startDate);
    formData.append("dueDate", form.dueDate);
    if (form.beforeImage) formData.append("beforeImage", form.beforeImage);

    try {
      await api.post("/tasks", formData);
      alert("GIAO VIỆC THÀNH CÔNG!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || "Không gửi được"));
    }
  };

  return (
    <>
      <Header />
      <div className="container-fluid py-5 bg-light">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <h2 className="text-center mb-5 fw-bold text-success">
                  GIAO NHIỆM VỤ MỚI - PHÒNG ME
                </h2>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Bộ phận</label>
                      <select
                        className="form-select form-select-lg"
                        value={form.department}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            department: e.target.value,
                            assignee: "",
                          })
                        }
                        required
                      >
                        <option value="">Chọn bộ phận</option>
                        <option value="ME">
                          ME - Manufacturing Engineering
                        </option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Nhân viên nhận việc
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={form.assignee}
                        onChange={(e) =>
                          setForm({ ...form, assignee: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Chọn nhân viên --</option>
                        {users
                          .filter((u) => u.department === form.department)
                          .map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} (
                              {u.role === "leader" ? "Leader" : "Staff"})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="form-label fw-bold">
                      Mô tả công việc
                    </label>
                    <textarea
                      className="form-control"
                      rows="6"
                      placeholder="VD: Sửa lỗi máy CNC số 3..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="row mt-4 g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày bắt đầu</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        value={form.startDate}
                        onChange={(e) =>
                          setForm({ ...form, startDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Hạn hoàn thành
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        value={form.dueDate}
                        onChange={(e) =>
                          setForm({ ...form, dueDate: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="form-label fw-bold">Ảnh hiện trạng</label>
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({ ...form, beforeImage: e.target.files[0] })
                      }
                    />
                  </div>

                  <div className="text-center mt-5">
                    <button
                      type="submit"
                      className="btn btn-success btn-lg px-5 py-3 fw-bold"
                    >
                      GIAO NHIỆM VỤ NGAY
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
