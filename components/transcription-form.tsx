"use client"

import { useState, useCallback } from "react"
import { TranscriptionCard } from "./transcription-card"
import { StatusIndicator, StatusState } from "./status-indicator"
import { Kbd } from "@/components/ui/kbd"

export function TranscriptionForm() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [status, setStatus] = useState<{ state: StatusState; message: string }>({
    state: "idle",
    message: "siap",
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const process = useCallback(async () => {
    if (!input.trim()) {
      setStatus({ state: "error", message: "input kosong" })
      return
    }

    setIsProcessing(true)
    setStatus({ state: "loading", message: "memproses..." })
    setResult("")

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan")
      }

      setResult(data.result)
      setStatus({ state: "success", message: "selesai" })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan"
      setResult("")
      // Truncate long error messages for display
      const displayMessage = message.length > 80 ? message.slice(0, 80) + "..." : message
      setStatus({ state: "error", message: displayMessage })
    } finally {
      setIsProcessing(false)
    }
  }, [input])

  const copyToClipboard = useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setStatus({ state: "success", message: "tersalin ke clipboard" })
      setTimeout(() => setStatus({ state: "idle", message: "siap" }), 2000)
    } catch {
      setStatus({ state: "error", message: "gagal menyalin" })
    }
  }, [result])

  const moveToInput = useCallback(() => {
    if (!result) return
    setInput(result)
    setResult("")
    setStatus({ state: "idle", message: "teks dipindah ke input" })
  }, [result])

  const clearAll = useCallback(() => {
    setInput("")
    setResult("")
    setStatus({ state: "idle", message: "siap" })
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
        label="input"
        hint={
          <span>
            gunakan <Kbd>\</Kbd> sebagai penanda jeda suara
          </span>
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="mbaknya bilang akun dananya kena freeze\ lah gimana coba gue..."
          className="w-full bg-transparent border-none outline-none font-mono text-sm leading-relaxed text-foreground resize-none min-h-40 placeholder:text-muted-foreground"
        />
      </TranscriptionCard>

      <div className="flex gap-2.5">
        <button
          onClick={process}
          disabled={isProcessing}
          className="font-mono text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
        >
          {isProcessing ? "Memproses..." : "Proses \u2192"}
        </button>
      </div>

      <div className="w-full h-px bg-border" />

      <TranscriptionCard
        label="hasil"
        actions={
          result && (
            <>
              <button
                onClick={copyToClipboard}
                className="font-mono text-[11px] bg-secondary text-muted-foreground border border-border px-3 py-1.5 rounded-md hover:text-foreground hover:border-muted-foreground transition-colors"
              >
                salin
              </button>
              <button
                onClick={moveToInput}
                className="font-mono text-[11px] bg-secondary text-muted-foreground border border-border px-3 py-1.5 rounded-md hover:text-foreground hover:border-muted-foreground transition-colors"
              >
                edit ulang
              </button>
              <button
                onClick={clearAll}
                className="font-mono text-[11px] bg-secondary text-muted-foreground border border-border px-3 py-1.5 rounded-md hover:text-foreground hover:border-muted-foreground transition-colors"
              >
                bersihkan
              </button>
            </>
          )
        }
      >
        <div className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words min-h-14">
          {result || (
            <span className="text-muted-foreground">
              hasil akan muncul di sini...
            </span>
          )}
        </div>
      </TranscriptionCard>

      <StatusIndicator state={status.state} message={status.message} />

      <footer className="font-mono text-[11px] text-muted-foreground leading-relaxed mt-2">
        <p>
          cara pakai: ketik transkripsi &rarr; tandai jeda suara dengan{" "}
          <span className="inline-block bg-secondary border border-border rounded px-1.5 text-primary">
            \
          </span>{" "}
          &rarr; klik proses
        </p>
        <p>powered by Groq (Llama 3.3). gratis.</p>
      </footer>
    </div>
  )
}
