"use client"

import { TranscriptionForm } from "@/components/transcription-form"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-8">
      <header className="w-full max-w-3xl mb-8 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <pre className="font-mono text-[10px] leading-[1.1] text-primary font-bold">
{`    _    ___ _____
   / \  |_ _|_   _|
  / _ \  | |  | |
 / ___ \ | |  | |
/_/   \_\___| |_|  `}
            </pre>
            <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground font-bold">
              ALPHA INNOVATION TECHNOLOGY
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="flex items-baseline gap-3 border-t border-border pt-4">
          <h1 className="font-mono text-lg font-medium text-primary tracking-tight">
            {t("appName")}
          </h1>
          <span className="font-mono text-xs text-muted-foreground">
            {t("tagline")}
          </span>
        </div>
      </header>

      <TranscriptionForm />

      <footer className="mt-auto pt-12 pb-4">
        <p className="text-xs text-muted-foreground font-mono">
          {t("footerSignature")}
        </p>
      </footer>
    </main>
  )
}
