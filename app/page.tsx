"use client"

import { TranscriptionForm } from "@/components/transcription-form"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-12">
      <header className="w-full max-w-3xl mb-10 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="font-mono text-lg font-medium text-primary tracking-tight">
            {t("appName")}
          </h1>
          <span className="font-mono text-xs text-muted-foreground">
            {t("tagline")}
          </span>
        </div>
        <LanguageSwitcher />
      </header>

      <TranscriptionForm />

      <footer className="mt-auto pt-12 pb-4">
        <p className="text-xs text-muted-foreground font-mono">
          for AIT from Fadhil Ghifarion 法迪
        </p>
      </footer>
    </main>
  )
}
