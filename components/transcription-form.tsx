"use client"

import { useState, useCallback } from "react"
import { TranscriptionCard } from "./transcription-card"
import { StatusIndicator, StatusState } from "./status-indicator"
import { calculateScoring, ScoringResult } from "@/lib/scoring"
import { Kbd } from "@/components/ui/kbd"
import { useLanguage } from "./language-provider"

type Provider = "groq" | "google" | "aiml" | "openrouter"

const PROMPT_1 = `Kamu editor transkripsi audio. Lakukan DUA hal saja:
1. Ganti setiap \\ dengan . , ! atau ? sesuai konteks
2. Kapitalkan awal kalimat dan nama diri (orang, tempat, merek)

LARANGAN:
- Jangan ubah, tambah, atau hapus kata apapun
- Jangan ubah ejaan kata — baku maupun tidak baku, biarkan apa adanya
- Jangan sentuh tanda baca selain \\
- Setiap \\ WAJIB diganti, tidak boleh dihapus atau dilewati
- Jika ragu pilih titik (.)

Output: teks hasil saja, tanpa komentar.

Contoh:
Input:  gue lagi di warung\\ mau beli nasi uduk\\ abis deh\\
Output: Gue lagi di warung, mau beli nasi uduk. Abis deh.`

function getPrompt2(original: string, hasil: string, masalah: string[]) {
  return `Kamu adalah asisten editor transkripsi. Tugasmu adalah memperbaiki hasil transkripsi sebelumnya yang memiliki kesalahan posisi tanda baca.

Teks Asli (dengan penanda \\):
${original}

Hasil Saat Ini (salah):
${hasil}

Masalah yang ditemukan:
${masalah.map((m) => `- ${m}`).join("\n")}

Tugas:
Perbaiki HANYA posisi tanda baca yang salah tersebut. Jangan mengubah kata-kata, jangan menambah penjelasan, jangan memberikan komentar. Output harus berupa teks transkripsi yang sudah diperbaiki saja.`
}

function normalizeInput(text: string): string {
  // kata \kata selanjutnya  → kata\ kata selanjutnya
  // kata \ kata selanjutnya → kata\ kata selanjutnya
  return text
    .replace(/\s+\\(\S)/g, "\\ $1")
    .replace(/\s+\\\s+/g, "\\ ")
}

function stripExtraText(text: string): string {
  const markers = ["catatan:", "note:", "output:", "hasil:", "penjelasan:"]
  const lines = text.split("\n")
  const filteredLines = lines.filter((line) => {
    const trimmedLine = line.trim().toLowerCase()
    if (markers.some((marker) => trimmedLine.startsWith(marker))) return false
    if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) return false
    return true
  })
  return filteredLines.join("\n").trim()
}

function validator(input: string, output: string): { ok: boolean; masalah: string[] } {
  const masalah: string[] = []
  const inputWords = input.split(/\s+/).filter(w => w.length > 0)
  const outputWords = output.split(/\s+/).filter(w => w.length > 0)

  const anchors: { word: string; pos: number }[] = []
  inputWords.forEach((word, index) => {
    if (word.endsWith("\\")) {
      anchors.push({ word: word.slice(0, -1).toLowerCase(), pos: index })
    }
  })

  const slashCount = (input.match(/\\/g) || []).length
  const punctuationRegex = /[.,!?]$/

  // Find words in output that carry punctuation
  const outputPunctuationWords = outputWords
    .map((word, index) => (punctuationRegex.test(word) ? { word, index } : null))
    .filter((item): item is { word: string; index: number } => item !== null)

  if (outputPunctuationWords.length !== slashCount) {
    masalah.push(`jumlah tanda baca tidak sesuai jumlah penanda jeda (ada ${outputPunctuationWords.length}, seharusnya ${slashCount})`)
    return { ok: false, masalah }
  }

  anchors.forEach((anchor, i) => {
    const item = outputPunctuationWords[i]
    if (!item) return

    const outputWord = item.word
    const baseOutputWord = outputWord.replace(/[.,!?]$/, "").toLowerCase()

    // Position check is handled by matching anchors to carrier list by index
    // But we still verify word content match with fuzzy 3-char prefix
    const isMatch = baseOutputWord.startsWith(anchor.word.slice(0, 3)) || anchor.word.startsWith(baseOutputWord.slice(0, 3))

    // Also check if the absolute position matches
    if (item.index !== anchor.pos) {
      masalah.push(`tanda baca ke-${i + 1} ("${baseOutputWord}") berada di posisi ${item.index + 1}, seharusnya di posisi ${anchor.pos + 1} ("${anchor.word}")`)
    } else if (!isMatch) {
      masalah.push(`tanda baca ke-${i + 1} berada di kata "${baseOutputWord}", seharusnya di sekitar "${anchor.word}"`)
    }
  })

  return { ok: masalah.length === 0, masalah }
}

interface FixerChange {
  original: string
  fixed: string
}

function algorithmicFixer(input: string, output: string): { result: string; changes: FixerChange[]; wordCountMismatch: boolean } {
  const changes: FixerChange[] = []
  const inputWords = input.split(/\s+/).filter(w => w.length > 0)
  const outputWords = output.split(/\s+/).filter(w => w.length > 0)
  const wordCountMismatch = inputWords.length !== outputWords.length

  const anchors: { word: string; pos: number }[] = []
  inputWords.forEach((word, index) => {
    if (word.endsWith("\\")) {
      anchors.push({ word: word.slice(0, -1).toLowerCase(), pos: index })
    }
  })

  let finalWordsArray = [...outputWords]
  const punctuationRegex = /[.,!?]$/

  // Rule 1: Remove all punctuation from words that are NOT in an anchor position
  const anchorIndicesInOutput = new Set<number>()
  anchors.forEach((anchor) => {
    let foundIndex = -1
    for (let offset = 0; offset <= 2; offset++) {
      const checkIndices = offset === 0 ? [anchor.pos] : [anchor.pos - offset, anchor.pos + offset]
      for (const idx of checkIndices) {
        if (idx >= 0 && idx < finalWordsArray.length && !anchorIndicesInOutput.has(idx)) {
          const word = finalWordsArray[idx].replace(punctuationRegex, "").toLowerCase()
          if (word.startsWith(anchor.word.slice(0, 3)) || anchor.word.startsWith(word.slice(0, 3))) {
            foundIndex = idx
            break
          }
        }
      }
      if (foundIndex !== -1) break
    }
    if (foundIndex === -1 && anchor.pos < finalWordsArray.length && !anchorIndicesInOutput.has(anchor.pos)) {
      foundIndex = anchor.pos
    }
    if (foundIndex !== -1) {
      anchorIndicesInOutput.add(foundIndex)
    }
  })

  // Apply removal and lowercasing
  for (let i = 0; i < finalWordsArray.length; i++) {
    if (!anchorIndicesInOutput.has(i) && punctuationRegex.test(finalWordsArray[i])) {
      const original = finalWordsArray[i]
      let fixed = original.replace(punctuationRegex, "")

      // If it was sentence-ending punctuation, replace with comma
      if (/[.!?]$/.test(original)) {
        fixed = fixed + ","
      }

      finalWordsArray[i] = fixed
      changes.push({ original, fixed })

      // Lowercase next word if previous was sentence ender
      if (/[.!?]$/.test(original) && i + 1 < finalWordsArray.length) {
        const nextWord = finalWordsArray[i+1]
        if (/^[A-Z]/.test(nextWord)) {
          const lowerNext = nextWord[0].toLowerCase() + nextWord.slice(1)
          finalWordsArray[i+1] = lowerNext
          changes.push({ original: nextWord, fixed: lowerNext })
        }
      }
    }
  }

  // Rule 2: Ensure each anchor has punctuation (insert comma if missing)
  const sortedAnchorIndices = Array.from(anchorIndicesInOutput).sort((a,b) => a-b)
  sortedAnchorIndices.forEach((idx, i) => {
    const isLastAnchor = i === sortedAnchorIndices.length - 1
    const hasPunctuation = punctuationRegex.test(finalWordsArray[idx])

    if (!hasPunctuation) {
      const original = finalWordsArray[idx]
      const fixed = original + (isLastAnchor ? "." : ",")
      finalWordsArray[idx] = fixed
      changes.push({ original, fixed })
    } else if (isLastAnchor && !finalWordsArray[idx].endsWith(".")) {
      // Force period on last anchor
      const original = finalWordsArray[idx]
      const fixed = original.replace(punctuationRegex, ".")
      finalWordsArray[idx] = fixed
      changes.push({ original, fixed })
    }
  })

  // Rule 6: Between two words: Hyphen (-) only if NO punctuation, Comma (,) if IS punctuation
  // Wait, Rule 5 says \ between repeated words means comma/punct, not hyphen.
  // We'll run a pass to ensure no extra hyphens were introduced by AI if a \ was there.
  // Actually the fixer's primary job is punctuation placement.

  let result = finalWordsArray.join(" ")

  // FINAL CLEANUP PASS
  result = result
    .replace(/\\/g, "")      // Remove any remaining \
    .replace(/,\s*,/g, ",")  // Double commas
    .replace(/,\s*\./g, ".") // Comma followed by period
    .replace(/\s+/g, " ")    // Normalize spaces
    .trim()

  // Ensure last word has sentence-ender
  if (finalWordsArray.length > 0) {
    const lastIdx = finalWordsArray.length - 1
    const lastWord = finalWordsArray[lastIdx]
    if (!/[.!?]$/.test(lastWord)) {
      const original = lastWord
      const fixed = original.replace(/[.,]$/, "") + "."
      finalWordsArray[lastIdx] = fixed
      // Only push to changes if it actually changed
      if (original !== fixed) {
        changes.push({ original, fixed })
      }
    }
  }

  result = finalWordsArray.join(" ")

  // FINAL CLEANUP PASS (Again to ensure joining didn't mess up)
  result = result
    .replace(/\\/g, "")      // Remove any remaining \
    .replace(/,\s*,/g, ",")  // Double commas
    .replace(/,\s*\./g, ".") // Comma followed by period
    .replace(/\s+/g, " ")    // Normalize spaces
    .trim()

  return { result, changes, wordCountMismatch }
}

export function TranscriptionForm() {
  const { t } = useLanguage()
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [scoring, setScoring] = useState<ScoringResult | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [provider, setProvider] = useState<Provider>("google")
  const [version, setVersion] = useState<"v1" | "v2.2">("v1")
  const [status, setStatus] = useState<{ state: StatusState; messageKey: string }>({
    state: "idle",
    messageKey: "statusReady",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [v2Status, setV2Status] = useState<{
    state: "idle" | "loading" | "valid" | "fixed_ai" | "fixed_algo" | "fixed_warning" | "error"
    retryCount: number
    masalah: string[]
    totalSlashes: number
    fixerChanges: FixerChange[]
    wordCountMismatch: boolean
  }>({
    state: "idle",
    retryCount: 0,
    masalah: [],
    totalSlashes: 0,
    fixerChanges: [],
    wordCountMismatch: false,
  })
  const [showFixerDiff, setShowFixerDiff] = useState(false)

  const process = useCallback(async () => {
    if (!input.trim()) {
      setStatus({ state: "error", messageKey: "statusEmptyInput" })
      return
    }

    const normalizedInputText = normalizeInput(input.trim())

    setIsProcessing(true)
    setStatus({ state: "loading", messageKey: "statusProcessing" })
    setResult("")
    setShowFixerDiff(false)
    const totalSlashes = (normalizedInputText.match(/\\/g) || []).length
    setV2Status({
      state: "loading",
      retryCount: 0,
      masalah: [],
      totalSlashes,
      fixerChanges: [],
      wordCountMismatch: false
    })

    try {
      let currentResult = ""
      let currentScoring: ScoringResult | null = null
      let currentRetry = 0
      let isValid = false
      let currentMasalah: string[] = []

      // Initial Call
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: normalizedInputText,
          provider,
          systemPrompt: PROMPT_1
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t("statusError"))

      currentResult = stripExtraText(data.result)
      currentScoring = data.scoring

      if (version === "v2.2") {
        const validation = validator(normalizedInputText, currentResult)
        isValid = validation.ok
        currentMasalah = validation.masalah

        // AI Retry Loop
        while (!isValid && currentRetry < 2) {
          currentRetry++
          setV2Status(prev => ({ ...prev, retryCount: currentRetry, masalah: currentMasalah }))

          const retryResponse = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: currentResult,
              provider,
              systemPrompt: getPrompt2(normalizedInputText, currentResult, currentMasalah)
            }),
          })

          const retryData = await retryResponse.json()
          if (!retryResponse.ok) throw new Error(retryData.error || t("statusError"))

          currentResult = stripExtraText(retryData.result)
          currentScoring = retryData.scoring

          const retryValidation = validator(input.trim(), currentResult)
          isValid = retryValidation.ok
          currentMasalah = retryValidation.masalah
        }

        let finalState: "valid" | "fixed_ai" | "fixed_algo" | "fixed_warning" = "valid"
        let fixerChanges: FixerChange[] = []
        let wordCountMismatch = false

        if (isValid) {
          finalState = currentRetry > 0 ? "fixed_ai" : "valid"
        } else {
          // STEP 4: ALGORITHMIC FIXER
          const fixResult = algorithmicFixer(normalizedInputText, currentResult)
          currentResult = fixResult.result
          fixerChanges = fixResult.changes
          wordCountMismatch = fixResult.wordCountMismatch
          finalState = wordCountMismatch ? "fixed_warning" : "fixed_algo"
        }

        setV2Status({
          state: finalState,
          retryCount: currentRetry,
          masalah: currentMasalah,
          totalSlashes,
          fixerChanges,
          wordCountMismatch
        })
      }

      const finalScoring = calculateScoring(normalizedInputText, currentResult)
      setResult(currentResult)
      setScoring(finalScoring)
      setStatus({ state: "success", messageKey: "statusDone" })
    } catch (error) {
      const message = error instanceof Error ? error.message : t("statusError")
      setResult("")
      // Truncate long error messages for display
      const displayMessage = message.length > 80 ? message.slice(0, 80) + "..." : message
      setStatus({ state: "error", messageKey: displayMessage })
      if (version === "v2.2") {
        setV2Status(prev => ({
          ...prev,
          state: "error",
          masalah: [message]
        }))
      } else {
        setV2Status(prev => ({ ...prev, state: "idle" }))
      }
    } finally {
      setIsProcessing(false)
    }
  }, [input, provider, version, t])

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
    setV2Status({ state: "idle", retryCount: 0, masalah: [], totalSlashes: 0, fixerChanges: [], wordCountMismatch: false })
    setShowFixerDiff(false)
  }, [])

  const flatten = useCallback(() => {
    if (!input.trim()) return
    const flattened = input
      .toLowerCase()
      .replace(/[\\.,!?;:]/g, "")
      // Remove Quotation marks
      .replace(/["''""]/g, "")
      .replace(/[''']/g, "")
      // Remove Ellipsis
      .replace(/\.\.\.|\u2026/g, "")
      // Remove Parentheses and brackets
      .replace(/[()\[\]]/g, "")
      // Remove standalone dashes and hyphens (surrounded by spaces or at start/end)
      // but keep intra-word hyphens like "benar-benar"
      .replace(/(^|\s)[-\u2013\u2014](\s|$)/g, "$1$2")
      .replace(/\s+/g, " ")
      .trim()
    setResult(flattened)
    setScoring(null)
    setStatus({ state: "success", messageKey: "statusDone" })
    setTimeout(() => setStatus({ state: "idle", messageKey: "statusReady" }), 1500)
  }, [input])

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

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {t("modeLabel")}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setVersion("v1")}
              disabled={isProcessing}
              className={`flex flex-col items-start p-3 rounded-md border transition-all text-left ${
                version === "v1"
                  ? "bg-primary/5 border-primary ring-1 ring-primary"
                  : "bg-card border-border hover:bg-secondary/50"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="font-mono text-sm font-bold flex items-center gap-2">
                {t("v1Title")}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground mt-1">
                {t("v1Desc")}
              </span>
            </button>
            <button
              onClick={() => setVersion("v2.2")}
              disabled={isProcessing}
              className={`flex flex-col items-start p-3 rounded-md border transition-all text-left ${
                version === "v2.2"
                  ? "bg-primary/5 border-primary ring-1 ring-primary"
                  : "bg-card border-border hover:bg-secondary/50"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="font-mono text-sm font-bold flex items-center gap-2">
                {t("v2Title")}
                <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[9px] font-bold uppercase tracking-tighter text-muted-foreground border border-border">
                  Beta
                </span>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground mt-1">
                {t("v2Desc")}
              </span>
            </button>
          </div>
        </div>

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
              <option value="openrouter">{t("modelOpenRouter")}</option>
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
        <button
          onClick={flatten}
          disabled={isProcessing || !input.trim()}
          className="font-mono text-xs font-medium bg-white text-black border border-black px-4 py-2.5 rounded-md hover:bg-gray-100 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {t("flatTextButton")}
        </button>
      </div>
      </div>

      <div className="w-full h-px bg-border" />

      <TranscriptionCard
        label={t("outputLabel")}
        hint={
          version === "v2.2" && v2Status.state !== "idle" && (
            <div className="flex items-center gap-2">
              {v2Status.state === "loading" && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 animate-pulse font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                  {t("v2BadgeProcessing")}
                </span>
              )}
              {v2Status.state === "valid" && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 font-bold">
                  {t("v2BadgeValid")} · {v2Status.totalSlashes}/{v2Status.totalSlashes}
                </span>
              )}
              {v2Status.state === "fixed_ai" && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 font-bold">
                  {t("v2BadgeFixed_ai")}
                </span>
              )}
              {v2Status.state === "fixed_algo" && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold">
                  {t("v2BadgeFixed_algo")}
                </span>
              )}
              {v2Status.state === "fixed_warning" && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 font-bold">
                  {t("v2BadgeFixed_warning")}
                </span>
              )}
              {v2Status.state === "error" && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 font-bold">
                  {t("v2BadgeError")}
                </span>
              )}
            </div>
          )
        }
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
        <div className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words min-h-14 relative pb-6">
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

          {version === "v2.2" && v2Status.state !== "idle" && (
            <div className="absolute bottom-0 left-0 right-0 pt-2 border-t border-border/50 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground italic">
                  {v2Status.state === "loading" && (
                    <>{t("statusProcessing")} {v2Status.retryCount > 0 && <span className="font-bold ml-1">retry {v2Status.retryCount}/2</span>}</>
                  )}
                  {v2Status.state === "valid" && `selesai. semua ${v2Status.totalSlashes} tanda baca sesuai posisi.`}
                  {v2Status.state === "fixed_ai" && `selesai setelah ${v2Status.retryCount}x fix otomatis.`}
                  {v2Status.state === "fixed_algo" && `selesai. algorithmic fixer digunakan.`}
                  {v2Status.state === "fixed_warning" && `selesai. algorithmic fixer digunakan dengan peringatan.`}
                  {v2Status.state === "error" && `perlu review manual: ${v2Status.masalah[0]}`}
                </span>
              </div>
              {v2Status.wordCountMismatch && (
                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tight">
                  {t("v2Warning")}
                </span>
              )}
            </div>
          )}
        </div>
      </TranscriptionCard>

      {version === "v2.2" && v2Status.fixerChanges.length > 0 && (
        <div className="bg-secondary/50 border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowFixerDiff(!showFixerDiff)}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-secondary transition-colors"
          >
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("v2FixerTitle")} ({v2Status.fixerChanges.length})
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {showFixerDiff ? "▲" : "▼"}
            </span>
          </button>
          {showFixerDiff && (
            <div className="px-4 py-3 border-t border-border flex flex-col gap-1.5 max-h-60 overflow-y-auto">
              {v2Status.fixerChanges.map((change, i) => (
                <div key={i} className="font-mono text-[11px] flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 line-through decoration-red-600/50">
                    {change.original}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 font-bold">
                    {change.fixed}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
