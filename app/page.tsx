"use client"

import { TranscriptionForm } from "@/components/transcription-form"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { QrisSection } from "@/components/qris-section"
import { useLanguage } from "@/components/language-provider"
import { Linkedin, Mail } from "lucide-react"

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
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

      <footer className="mt-auto pt-12 pb-8 flex flex-col items-center gap-4 relative">
        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
          {t("footerSignature")}
        </p>
        <div className="flex items-center gap-4 text-muted-foreground/60">
          <span className="font-mono text-[11px] font-medium tracking-tight">Fadhil Ghifari</span>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/fadhil-muhammad-ghifari?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="mailto:fadhil@kunbyte.com"
              className="hover:text-primary transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <QrisSection />
      </footer>
    </main>
  )
}
