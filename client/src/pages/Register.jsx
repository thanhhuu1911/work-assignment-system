// client/src/pages/Register.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { showToast } from "../components/Toast";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    group: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // Chỉ gửi group nếu là leader hoặc member
      if (!["leader", "member"].includes(form.role)) {
        delete payload.group;
      }
      await api.post("/auth/register", payload);
      showToast("Registration successful! Please log in.", "Thành công!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const showGroup = ["leader", "member"].includes(form.role);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 bg-light">
      <div
        className="card shadow-lg border-0"
        style={{ maxWidth: "520px", width: "100%" }}
      >
        <div className="card-body p-5">
          <h2 className="text-center mb-4 fw-bold text-dark">
            {t("register")}
          </h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {/* Role */}
            <div className="mb-3">
              <select
                className="form-select"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value, group: "" })
                }
                required
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="manager">Manager</option>
                {/* <option value="a_manager">Assistant Manager</option> */}
                <option value="leader">Leader</option>
                <option value="member">Staff</option>
              </select>
            </div>

            {/* Group (only for Leader & Staff) */}
            {showGroup && (
              <div className="mb-3">
                <select
                  className="form-select"
                  value={form.group}
                  onChange={(e) => setForm({ ...form, group: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select Group
                  </option>
                  <option value="Lean">Lean</option>
                  <option value="IE">IE</option>
                  {/* <option value="Data">Data</option> */}
                </select>
              </div>
            )}

            {/* Department (auto-filled) */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Department"
                value="ME"
                readOnly
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-bold">
              <img
                src="/signup.png"
                alt="signup"
                className="me-2"
                style={{ width: "25px", height: "25px" }}
              />
              {t("register")}
            </button>
          </form>

          <p className="text-center mt-3 text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
