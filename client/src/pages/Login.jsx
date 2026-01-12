// client/src/pages/Login.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset lỗi

    try {
      // DÙNG form.email, form.password – KHÔNG DÙNG email, password
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 bg-light">
      <div
        className="card shadow-lg"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="card-body p-5">
          <h2 className="text-center mb-4 fw-bold">{t("login")}</h2>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 btn-lg">
              <img
                src="/login.png"
                alt="login"
                className="me-2"
                style={{ width: "25px", height: "25px" }}
              />
              {t("login")}
            </button>
          </form>

          <p className="text-center mt-4 text-muted">
            Don’t have an account?{" "}
            <Link to="/register" className="text-primary">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
