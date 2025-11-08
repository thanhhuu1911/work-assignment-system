import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm py-3 mb-4">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img
            src="http://localhost:5000/images/Logo_ME.jpg"
            alt="Logo"
            style={{
              width: 55,
              height: 55,
              borderRadius: "70%",
              marginRight: "10px",
            }}
          />

          <h4 className="mb-0 fw-bold text-primary">Team ME</h4>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="fw-medium">{user.name || "Guest"}_ME</span>
          <LanguageToggle />
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
