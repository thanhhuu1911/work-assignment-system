// client/src/components/LanguageToggle.jsx
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-2 py-1 shadow-sm"
      style={{
        fontSize: "0.75rem",
        fontWeight: "600",
        border: "1.5px solid #fbfbfbff",
        background: "rgba(176, 152, 255, 0.59)",
        backdropFilter: "blur(4px)",
      }}
      title="Chuyển ngôn ngữ"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-globe"
        viewBox="0 0 16 16"
      >
        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h3.568a12.5 12.5 0 0 0-.338-2.5H8.5zM7.5 8.5V6h-3.5v2.5h3.5zM8.5 8.5h3.568a12.5 12.5 0 0 0-.338 2.5H8.5V8.5zM7.5 11h-3.5v2.5h3.5V11zm1 0v2.5h3.568a12.5 12.5 0 0 0-.338-2.5H8.5zM4.847 11H1.674a6.958 6.958 0 0 0 .656 2.5h2.49a12.5 12.5 0 0 1-.312-2.5zM2.255 12a7.025 7.025 0 0 0 3.072 2.933 6.7 6.7 0 0 1-.597-.933 9.267 9.267 0 0 1-.64-1.539H2.255zm3.29 3.923c.552-1.035 1.217-1.651 1.887-1.855A7.97 7.97 0 0 0 7.855 12H5.59v2.923z" />
      </svg>
      <span>{i18n.language === "vi" ? "VI" : "EN"}</span>
    </button>
  );
}
