import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container-fluid text-center">
        <p className="mb-2">
          © 2025 Work Assignment System. All rights reserved.
        </p>
        <p className="mb-2">
          Contact: thanhhuu123455@gamil.com | Hotline: 0368206517
        </p>
        <LanguageToggle />
      </div>
    </footer>
  );
}
