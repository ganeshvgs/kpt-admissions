//src/LanguageSwitcher.jsx

import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <button
      onClick={() =>
        i18n.changeLanguage(i18n.language === "en" ? "kn" : "en")
      }
      className="px-3 py-1 border rounded text-sm"
    >
      {i18n.language === "en" ? "ಕನ್ನಡ" : "English"}
    </button>
  );
}
