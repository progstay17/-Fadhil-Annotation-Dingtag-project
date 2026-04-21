"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useLanguage } from "./language-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HelpIcon } from "./ui/help-icon"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import {
  applyFormatWithProtection,
  formatPreservingReplace,
  getRepeatedWordsIndices,
  numberToIndonesianWords,
} from "@/lib/text-utils"
import { TranslationKey } from "@/lib/translations"
import { Info, HelpCircle, AlertTriangle, Sparkles, Wand2 } from "lucide-react"

interface FilterCustomProps {
  input: string
  setInput: (val: string) => void
  onClear: () => void
}

type FormatMode = "none" | "sentence" | "lower" | "upper" | "capitalize" | "toggle"
type SmartReplaceMode = "format-preserving" | "strict"


export function FilterCustom({ input, setInput, onClear }: FilterCustomProps) {
  const { t } = useLanguage()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Engine States
  const [findValue, setFindValue] = useState("")
  const [replaceValue, setReplaceValue] = useState("")
  const [stripEnabled, setStripEnabled] = useState(false)
  const [removeLineBreak, setRemoveLineBreak] = useState(false)
  const [formatMode, setFormatMode] = useState<FormatMode>("none")
  const [smartReplaceMode, setSmartReplaceMode] = useState<SmartReplaceMode>("format-preserving")
  const [autoCapital, setAutoCapital] = useState(false)

  // Interaction States
  const [activeToken, setActiveToken] = useState<{ word: string, index: number } | null>(null)
  const [batchSelected, setBatchSelected] = useState<number[]>([])
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [replaceTokenInput, setReplaceTokenInput] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<{ text: string, reason: string }[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Refs for scroll sync
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  // LAYER 1: DETECTION (REAL-TIME HIGHLIGHT)
  const renderOverlay = () => {
    const { tokens, indices } = getRepeatedWordsIndices(input)
    const isDark = mounted && resolvedTheme === "dark"

    return tokens.map((token, i) => {
      const isRepeated = indices.includes(i)
      const isBatchSelected = batchSelected.includes(i)

      if (isRepeated || isBatchSelected) {
        return (
          <mark
            key={i}
            className={cn(
              "rounded-sm text-transparent",
              isRepeated && !isBatchSelected && "bg-yellow-200 dark:bg-transparent dark:invert",
              isBatchSelected && "bg-blue-200 dark:bg-blue-500/30"
            )}
          >
            {token}
          </mark>
        )
      }
      return <span key={i}>{token}</span>
    })
  }

  // LAYER 2 & 3: ENGINE EXECUTION
  const processedText = useMemo(() => {
    let text = input

    // 1. Find & Replace
    if (findValue.trim()) {
      const targets = findValue.split(/\s+/).filter(t => t.length > 0)
      targets.forEach(target => {
        if (smartReplaceMode === "format-preserving") {
          // Use regex to find tokens and replace preserving format
          const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(`(\\b|\\s|^)(${escapedTarget})(\\b|\\s|$)`, 'g')
          text = text.replace(regex, (match, p1, p2, p3) => {
            return p1 + formatPreservingReplace(p2, replaceValue) + p3
          })
        } else {
          text = text.replaceAll(target, replaceValue)
        }
      })
    }

    // 2. Add Strip
    if (stripEnabled) {
      // kata kata -> kata-kata, including affixes
      text = text.replace(/\b(\w+)\s+\1(nya|ku|mu|lah|kah|pun)?\b/gi, '$1-$1$2')
    }

    // 3. Remove Line Break
    if (removeLineBreak) {
      text = text.replace(/\n+/g, ' ')
    }

    // 4. Format Huruf (with Acronym Protection)
    if (formatMode !== "none") {
      text = applyFormatWithProtection(text, (t) => {
        if (formatMode === "lower") return t.toLowerCase()
        if (formatMode === "upper") return t.toUpperCase()
        if (formatMode === "sentence") return t.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase())
        if (formatMode === "capitalize") return t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
        if (formatMode === "toggle") return t.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("")
        return t
      })
    }

    // 5. Auto Capital (with Acronym Protection)
    if (autoCapital) {
      text = applyFormatWithProtection(text, (t) => {
        return t.replace(/([.!?]\s+)([a-z])/g, (_, punct, char) =>
          punct + char.toUpperCase()
        )
      })
    }

    // Final clean up: collapse multiple spaces
    text = text.replace(/\s{2,}/g, ' ').trim()

    return text
  }, [input, findValue, replaceValue, stripEnabled, removeLineBreak, formatMode, smartReplaceMode, autoCapital])

  // Sync editor with engine result (optional, but requested by VISION: single editor)
  // We apply the transformation when requested or auto-apply?
  // Let's have a button "Apply Transformations" or just live update?
  // VISION says "Everything happens in one unified editor space."
  // For now, let's show the result and allow "Sync to Editor" or auto-apply if toggled.
  // Given the "Text Processing Engine" description, we'll make it live update.

  const applyEngine = useCallback(() => {
    setInput(processedText)
  }, [processedText, setInput])

  const handleTokenClick = (word: string, index: number, e: React.MouseEvent) => {
    if (e.altKey) {
      // ALT + Click: Select all identical tokens
      const tokens = input.split(/(\s+)/)
      const matches: number[] = []
      tokens.forEach((t, i) => {
        if (t === word) matches.push(i)
      })
      setBatchSelected(matches)
      setActiveToken({ word, index })
      setReplaceTokenInput(word)
      setPopoverOpen(true)
      fetchAiSuggestions(word, input)
    } else {
      // Normal click: Only show suggestion if anomaly detected
      // Detect anomaly: repeated, typo-like, numbers, or missing caps
      const isRepeated = getRepeatedWordsIndices(input).indices.includes(index)
      const isNumber = /^\d+$/.test(word)
      const isAllLowerAcronym = /^[a-z]{2,}$/.test(word) && word.length >= 2 // Simple heuristic

      if (isRepeated || isNumber || isAllLowerAcronym) {
        setActiveToken({ word, index })
        setBatchSelected([index])
        setReplaceTokenInput(word)
        setPopoverOpen(true)
        fetchAiSuggestions(word, input)
      }
    }
  }

  const fetchAiSuggestions = async (token: string, context: string) => {
    // Only fetch for typos or informal spelling
    if (/^[a-zA-Z]+$/.test(token)) {
      setIsAiLoading(true)
      try {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: token,
            provider: "google",
            systemPrompt: `You are a minimal text correction assistant for Indonesian language.
Context (read-only): "${context}"
Target token: "${token}"

Return ONLY a JSON array of max 3 correction suggestions.
Each suggestion: { "text": "corrected", "reason": "short reason" }
Do not change writing style. Fix typos and informal spelling only.
Return only JSON, no other text.`
          }),
        })
        const data = await response.json()
        if (data.result) {
          try {
            const parsed = JSON.parse(data.result)
            setAiSuggestions(Array.isArray(parsed) ? parsed.slice(0, 3) : [])
          } catch {
            setAiSuggestions([])
          }
        }
      } catch {
        setAiSuggestions([])
      } finally {
        setIsAiLoading(false)
      }
    } else {
      setAiSuggestions([])
    }
  }

  const applyReplacement = (newWord: string) => {
    const tokens = input.split(/(\s+)/)
    batchSelected.forEach(idx => {
      tokens[idx] = newWord
    })
    setInput(tokens.join(""))
    setPopoverOpen(false)
    setBatchSelected([])
    setActiveToken(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            V3.3 Engine
          </span>
          <button
            onClick={() => setInput(processedText)}
            className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded hover:bg-primary/20 transition-all font-bold uppercase"
          >
            Apply Engine
          </button>
        </div>
        <div className="flex items-center gap-2">
           <button
            onClick={onClear}
            className="font-mono text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground hover:border-muted-foreground transition-colors uppercase tracking-tighter font-bold cursor-pointer"
          >
            {t("clearButton")}
          </button>
        </div>
      </div>

      {/* Unified Editor */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative group">
         <div className="relative min-h-[300px]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onScroll={handleScroll}
            placeholder={t("inputPlaceholder")}
            className="w-full h-full min-h-[300px] p-6 bg-transparent border-none outline-none font-mono text-sm leading-relaxed text-foreground resize-none placeholder:text-muted-foreground relative z-10 scrollbar-thin"
          />

          {/* Interaction/Highlight Layer */}
          <div
            ref={overlayRef}
            className="absolute inset-0 p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden text-transparent z-20 pointer-events-none"
            aria-hidden="true"
          >
            {renderOverlay()}
          </div>

          {/* Token Click Layer (Invisible but captures clicks) */}
          <div className="absolute inset-0 p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden z-30 pointer-events-none select-none">
             {input.split(/(\s+)/).map((part, i) => {
               if (/\s+/.test(part)) return <span key={i} className="whitespace-pre">{part}</span>
               return (
                 <span
                   key={i}
                   onClick={(e) => handleTokenClick(part, i, e)}
                   className="cursor-pointer pointer-events-auto hover:bg-primary/10 rounded-sm px-0.5 transition-colors"
                 >
                   {part}
                 </span>
               )
             })}
          </div>
        </div>

        {/* Suggestion Popover */}
        <Popover open={popoverOpen} onOpenChange={(open) => {
          if (!open) {
            setPopoverOpen(false)
            setBatchSelected([])
            setActiveToken(null)
          }
        }}>
          <PopoverTrigger asChild>
            <div className="absolute" style={{
              // We could calculate position, but let's just use the center or follow selection
              left: '50%', top: '50%'
            }} />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-2xl bg-card border-border overflow-hidden rounded-lg">
            <div className="bg-primary/5 px-4 py-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Suggestions
              </span>
              <HelpIcon>{t("tutorialSuggestions")}</HelpIcon>
            </div>

            <div className="p-3 flex flex-col gap-3">
              {/* Manual Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase ml-0.5">Edit Token</label>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={replaceTokenInput}
                    onChange={(e) => setReplaceTokenInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyReplacement(replaceTokenInput)}
                    className="flex-1 bg-secondary border border-border rounded px-2 py-1.5 font-mono text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => applyReplacement(replaceTokenInput)}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-primary/90 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase ml-0.5">Recommended</label>
                <div className="flex flex-wrap gap-1.5">
                  {/* Punctuation (Algo) */}
                  {activeToken && [",", ".", "!", "?"].map(p => (
                    <button
                      key={p}
                      onClick={() => applyReplacement(activeToken.word + p)}
                      className="bg-secondary hover:bg-secondary/80 text-[11px] font-mono px-2 py-1 rounded border border-border transition-colors"
                    >
                      {activeToken.word}{p}
                    </button>
                  ))}

                  {/* Numbers (Algo) */}
                  {activeToken && /^\d+$/.test(activeToken.word) && (
                    <button
                      onClick={() => applyReplacement(numberToIndonesianWords(activeToken.word))}
                      className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] text-left px-3 py-2 rounded border border-blue-500/20 transition-colors flex flex-col"
                    >
                      <span className="font-bold">{numberToIndonesianWords(activeToken.word)}</span>
                      <span className="text-[9px] opacity-70">Konversi ke kata</span>
                    </button>
                  )}

                  {/* AI Suggestions */}
                  {isAiLoading ? (
                    <div className="w-full py-4 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : (
                    aiSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => applyReplacement(s.text)}
                        className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] text-left px-3 py-2 rounded border border-purple-500/20 transition-colors flex flex-col"
                      >
                        <span className="font-bold">{s.text}</span>
                        <span className="text-[9px] opacity-70">{s.reason}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-2xl border border-border">
        {/* Left Col: Replacement & Selection */}
        <div className="flex flex-col gap-4">
           <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
              Find
              <HelpIcon>{t("filterFindLabel")}</HelpIcon>
            </label>
            <input
              type="text"
              value={findValue}
              onChange={(e) => setFindValue(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder=". , ! a b kata"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
              Replace
              <HelpIcon>{t("filterReplaceLabel")}</HelpIcon>
            </label>
            <input
              type="text"
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder={t("filterReplacePlaceholder")}
            />
            {!findValue && replaceValue && (
              <span className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                {t("filterReplaceWarning")}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between bg-card/50 p-3 rounded-lg border border-border mt-2">
             <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">Smart Replace Mode</span>
                <HelpIcon>{t("filterDeterministic")}</HelpIcon>
             </div>
             <button
              onClick={() => setSmartReplaceMode(prev => prev === "format-preserving" ? "strict" : "format-preserving")}
              className={cn(
                "px-3 py-1.5 rounded-md font-mono text-[10px] font-bold uppercase transition-all",
                smartReplaceMode === "format-preserving" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}
             >
               {smartReplaceMode === "format-preserving" ? "Format-Preserving" : "Strict"}
             </button>
          </div>
        </div>

        {/* Right Col: Toggles & Formats */}
        <div className="flex flex-col gap-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border cursor-pointer hover:bg-card transition-colors select-none">
                <input
                  type="checkbox"
                  checked={stripEnabled}
                  onChange={(e) => setStripEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-bold uppercase">Add Strip</span>
                  <HelpIcon>{t("filterAddStrip")}</HelpIcon>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border cursor-pointer hover:bg-card transition-colors select-none">
                <input
                  type="checkbox"
                  checked={removeLineBreak}
                  onChange={(e) => setRemoveLineBreak(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-bold uppercase">No Break</span>
                  <HelpIcon>{t("filterNoBreak")}</HelpIcon>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border cursor-pointer hover:bg-card transition-colors select-none col-span-1 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={autoCapital}
                  onChange={(e) => setAutoCapital(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-bold uppercase">Auto Capital after . ! ?</span>
                  <HelpIcon>{t("filterAutoCapital")}</HelpIcon>
                </div>
              </label>
           </div>

           <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                Format Huruf
                <HelpIcon>{t("filterFormatLabel")}</HelpIcon>
              </label>
              <select
                value={formatMode}
                onChange={(e) => setFormatMode(e.target.value as FormatMode)}
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 font-mono text-xs focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
              >
                <option value="none">None</option>
                <option value="sentence">Sentence case</option>
                <option value="lower">lowercase</option>
                <option value="upper">UPPERCASE</option>
                <option value="capitalize">Capitalize Each Word</option>
                <option value="toggle">Toggle Case</option>
              </select>
           </div>
        </div>
      </div>

      {/* Shortcuts Hint */}
      <div className="flex flex-wrap items-center gap-6 text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] px-1 opacity-60">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border">ALT</kbd>
          <span>+ CLICK: Batch Select</span>
          <HelpIcon>{t("tutorialAltClick")}</HelpIcon>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border">Hover</kbd>
          <span>: Suggestion</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Algorithmic First · Precision AI</span>
        </div>
      </div>
    </div>
  )
}
