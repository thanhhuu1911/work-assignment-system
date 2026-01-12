// client/src/components/Header.jsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // CHUYỂN ĐỔI CHỨC VỤ ĐẸP
  const getRoleDisplay = (role) => {
    const roleMap = {
      member: "STAFF",
      leader: "LEADER",
      a_manager: "A.Manager",
      manager: "MANAGER",
    };
    return roleMap[role] || "member";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm py-3 mb-4 border-bottom">
      <div className="container-fluid d-flex justify-content-between align-items-center px-4">
        {/* Logo + Tên nhóm */}
        <div className="d-flex align-items-center gap-2">
          <img
            src="/Logo_ME.jpg"
            alt="ME Logo"
            style={{
              width: 70,
              height: 70,
              borderRadius: "70%",
              marginRight: "12px",
              border: "2px solid #ffffffb4",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <h2 className="mb-0 fw-bold text-primary">Team ME</h2>
        </div>

        {/* Thông tin người dùng + Ngôn ngữ + Logout */}
        <div className="d-flex align-items-center gap-3">
          {/* HIỂN THỊ: Tên_Chức vụ_ME */}
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-dark">
              {user.name || "Guest"}
            </span>
            <span className="text-dark fw-medium">
              _{getRoleDisplay(user.role)}_ME
            </span>
          </div>

          <LanguageToggle />

          <button
            className="btn btn-outline-danger btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center "
            onClick={handleLogout}
          >
            <img
              src="/logout.png"
              alt="logout"
              className="me-1"
              style={{ width: "20px", height: "20px" }}
            />
            {t("logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
