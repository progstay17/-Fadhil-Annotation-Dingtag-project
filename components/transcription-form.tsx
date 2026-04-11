"use client"

import { useState, useCallback } from "react"
import { TranscriptionCard } from "./transcription-card"
import { StatusIndicator, StatusState } from "./status-indicator"
import { Kbd } from "@/components/ui/kbd"
import { useLanguage } from "./language-provider"

export function TranscriptionForm() {
  const { t } = useLanguage()
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [status, setStatus] = useState<{ state: StatusState; messageKey: string }>({
    state: "idle",
    messageKey: "statusReady",
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const process = useCallback(async () => {
    if (!input.trim()) {
      setStatus({ state: "error", messageKey: "statusEmptyInput" })
      return
    }

    setIsProcessing(true)
    setStatus({ state: "loading", messageKey: "statusProcessing" })
    setResult("")

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("statusError"))
      }

      setResult(data.result)
      setStatus({ state: "success", messageKey: "statusDone" })
    } catch (error) {
      const message = error instanceof Error ? error.message : t("statusError")
      setResult("")
      // Truncate long error messages for display
      const displayMessage = message.length > 80 ? message.slice(0, 80) + "..." : message
      setStatus({ state: "error", messageKey: displayMessage })
    } finally {
      setIsProcessing(false)
    }
  }, [input, t])

  const copyToClipboard = useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setStatus({ state: "success", messageKey: "statusCopied" })
      setTimeout(() => setStatus({ state: "idle", messageKey: "statusReady" }), 2000)
    } catch {
      setStatus({ state: "error", messageKey: "statusCopyFailed" })
    }
  }, [result])

  const moveToInput = useCallback(() => {
    if (!result) return
    setInput(result)
    setResult("")
    setStatus({ state: "idle", messageKey: "statusMoved" })
  }, [result])

  const clearAll = useCallback(() => {
    setInput("")
    setResult("")
    setStatus({ state: "idle", messageKey: "statusReady" })
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        process()
      }
    },
    [process]
  )

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      <TranscriptionCard
        label={t("inputLabel")}
        hint={
          <span>
            {t("inputHint")} <Kbd>\</Kbd> {t("inputHintSuffix")}
          </span>
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("inputPlaceholder")}
          className="w-full bg-transparent border-none outline-none font-mono text-sm leading-relaxed text-foreground resize-none min-h-40 placeholder:text-muted-foreground"
        />
      </TranscriptionCard>

      <div className="flex gap-2.5">
        <button
          onClick={process}
          disabled={isProcessing}
          className="font-mono text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
        >
          {isProcessing ? t("processingButton") : `${t("processButton")} \u2192`}
        </button>
      </div>

      <div className="w-full h-px bg-border" />

      <TranscriptionCard
        label={t("outputLabel")}
        actions={
          result && (
            <>
              <button
                onClick={copyToClipboard}
                className="font-mono text-[11px] bg-secondary text-muted-foreground border border-border px-3 py-1.5 rounded-md hover:text-foreground hover:border-muted-foreground transition-colors"
              >
                {t("copyButton")}
              </button>
              <button
                onClick={moveToInput}
                className="font-mono text-[11px] bg-secondary text-muted-foreground border border-border px-3 py-1.5 rounded-md hover:text-foreground hover:border-muted-foreground transition-colors"
              >
                {t("editButton")}
              </button>
              <button
                onClick={clearAll}
                className="font-mono text-[11px] bg-secondary text-muted-foreground border border-border px-3 py-1.5 rounded-md hover:text-foreground hover:border-muted-foreground transition-colors"
              >
                {t("clearButton")}
              </button>
            </>
          )
        }
      >
        <div className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words min-h-14">
          {result || (
            <span className="text-muted-foreground">
              {t("outputPlaceholder")}
            </span>
          )}
        </div>
      </TranscriptionCard>

      <StatusIndicator state={status.state} messageKey={status.messageKey} />

      <footer className="font-mono text-[11px] text-muted-foreground leading-relaxed mt-2">
        <p>
          {t("footerInstructions")}{" "}
          <span className="inline-block bg-secondary border border-border rounded px-1.5 text-primary">
            \
          </span>{" "}
          {t("footerInstructionsSuffix")}
        </p>
        <p>{t("footerPoweredBy")}</p>
      </footer>
    </div>
  )
}
