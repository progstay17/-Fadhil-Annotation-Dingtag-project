"use client"

import { cn } from "@/lib/utils"
import { useLanguage } from "./language-provider"
import { TranslationKey, translations } from "@/lib/translations"

export type StatusState = "idle" | "loading" | "success" | "error"

interface StatusIndicatorProps {
  state: StatusState
  messageKey: string
}

export function StatusIndicator({ state, messageKey }: StatusIndicatorProps) {
  const { t, language } = useLanguage()
  
  // Check if messageKey is a valid translation key, otherwise use it as raw message
  const message = messageKey in translations[language] 
    ? t(messageKey as TranslationKey) 
    : messageKey

  return (
    <div className="flex items-center gap-2 h-5">
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
          state === "idle" && "bg-muted-foreground",
          state === "loading" && "bg-primary animate-pulse",
          state === "success" && "bg-emerald-500",
          state === "error" && "bg-red-400"
        )}
      />
      <span className="font-mono text-[11px] text-muted-foreground">
        {message}
      </span>
    </div>
  )
}
