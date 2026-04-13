"use client"

import { useState, useCallback } from "react"
import { TranscriptionCard } from "./transcription-card"
import { StatusIndicator, StatusState } from "./status-indicator"
import { ScoringResult } from "@/lib/scoring"
import { Kbd } from "@/components/ui/kbd"
import { useLanguage } from "./language-provider"

type Provider = "groq" | "google" | "aiml"

export function TranscriptionForm() {
  const { t } = useLanguage()
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [scoring, setScoring] = useState<ScoringResult | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [provider, setProvider] = useState<Provider>("google")
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
        body: JSON.stringify({ text: input.trim(), provider }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("statusError"))
      }

      setResult(data.result)
      setScoring(data.scoring)
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
  }, [input, provider, t])

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
    setScoring(null)
    setShowDiff(false)
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{t("modelLabel")}:</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            disabled={isProcessing}
            className="font-mono text-xs bg-secondary text-foreground border border-border rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="google">{t("modelGoogle")}</option>
            <option value="aiml">{t("modelAiml")}</option>
            <option value="groq">{t("modelGroq")}</option>
          </select>
        </div>
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
              {scoring && (
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className={`font-mono text-[11px] border px-3 py-1.5 rounded-md transition-colors ${
                    showDiff
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {t("showDiff")}
                </button>
              )}
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
          {result ? (
            showDiff && scoring ? (
              <div className="flex flex-wrap gap-x-1 gap-y-1">
                {scoring.highlights.map((seg, i) => (
                  <span
                    key={i}
                    className={
                      seg.type === "correct" ? "bg-green-500/20 text-green-600 px-0.5 rounded" :
                      seg.type === "added" ? "bg-blue-500/20 text-blue-600 px-0.5 rounded border border-blue-500/30" :
                      seg.type === "missing" ? "bg-red-500/20 text-red-600 px-0.5 rounded italic border border-dashed border-red-500/50" :
                      seg.type === "changed" ? "bg-yellow-500/20 text-yellow-600 px-0.5 rounded" :
                      ""
                    }
                  >
                    {seg.text}
                  </span>
                ))}
              </div>
            ) : result
          ) : (
            <span className="text-muted-foreground">
              {t("outputPlaceholder")}
            </span>
          )}
        </div>
      </TranscriptionCard>

      {scoring && (
        <div className="bg-secondary/30 border border-border rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("accuracyScore")}
            </span>
            <span className={`font-mono text-lg font-bold ${
              scoring.score > 90 ? "text-green-500" :
              scoring.score > 70 ? "text-yellow-500" :
              "text-red-500"
            }`}>
              {scoring.score}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                scoring.score > 90 ? "bg-green-500" :
                scoring.score > 70 ? "bg-yellow-500" :
                "bg-red-500"
              }`}
              style={{ width: `${scoring.score}%` }}
            />
          </div>
          <p className="font-mono text-[11px] text-muted-foreground italic">
            {scoring.score > 90 ? t("perfectScore") :
             scoring.score > 70 ? t("goodScore") :
             t("lowScore")}
          </p>
        </div>
      )}

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
