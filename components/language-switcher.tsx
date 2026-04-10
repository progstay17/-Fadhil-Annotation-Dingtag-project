"use client"

import { useLanguage } from "./language-provider"
import { Language } from "@/lib/translations"

const languages: { code: Language; label: string }[] = [
  { code: "id", label: "ID" },
  { code: "en", label: "EN" },
  { code: "zh", label: "ZH" },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      {languages.map((lang, index) => (
        <span key={lang.code} className="flex items-center">
          <button
            onClick={() => setLanguage(lang.code)}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              language === lang.code
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.label}
          </button>
          {index < languages.length - 1 && (
            <span className="text-muted-foreground/50">|</span>
          )}
        </span>
      ))}
    </div>
  )
}
