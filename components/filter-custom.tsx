"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { useLanguage } from "./language-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FilterCustomProps {
  input: string
  setInput: (val: string) => void
  onClear: () => void
}

type FormatMode = "none" | "sentence" | "lower" | "upper" | "capitalize" | "toggle"

export function FilterCustom({ input, setInput, onClear }: FilterCustomProps) {
  const { t } = useLanguage()

  // Pipeline State
  const [findValue, setFindValue] = useState("")
  const [replaceValue, setReplaceValue] = useState("")
  const [stripEnabled, setStripEnabled] = useState(false)
  const [formatMode, setFormatMode] = useState<FormatMode>("none")

  // Interactive Output State
  const [interactiveOutput, setInteractiveOutput] = useState<string>("")

  // Popover State
  const [activeToken, setActiveToken] = useState<{ word: string, index: number } | null>(null)
  const [replaceTokenInput, setReplaceTokenInput] = useState("")
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Refs for scroll sync
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset interactive changes when input changes
  useEffect(() => {
    setInteractiveOutput("")
    setActiveToken(null)
    setPopoverOpen(false)
  }, [input])

  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  // LAYER 1: Repeated word detection (visual only)
  const getRepeatedWordsIndices = (text: string) => {
    const tokens = text.split(/(\s+)/)
    const indices: number[] = []

    // We want to find adjacent word tokens that are identical
    // tokens array looks like: ["word", "  ", "word", " ", "other"]
    for (let i = 0; i < tokens.length - 2; i += 2) {
      const currentWord = tokens[i]
      const nextWord = tokens[i+2]

      if (currentWord && nextWord && currentWord === nextWord && !/[.,!?\\-]/.test(currentWord)) {
        indices.push(i, i+2)
      }
    }
    return { tokens, indices }
  }

  const renderOverlay = () => {
    const { tokens, indices } = getRepeatedWordsIndices(input)
    return tokens.map((token, i) => {
      const isRepeated = indices.includes(i)
      if (isRepeated) {
        return <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 text-transparent rounded-sm">{token}</mark>
      }
      return <span key={i}>{token}</span>
    })
  }

  // PIPELINE EXECUTION
  const pipelineResult = useMemo(() => {
    let text = input

    // Layer 2 & 3: Find & Replace
    if (findValue.trim()) {
      const targets = findValue.split(/\s+/).filter(t => t.length > 0)
      targets.forEach(target => {
        // Use global regex with escape for special chars
        const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escapedTarget, 'g')
        text = text.replace(regex, replaceValue)
      })
    }

    // Collapse spaces and trim (always)
    text = text.replace(/\s+/g, ' ').trim()

    // Layer 4: Add Strip
    if (stripEnabled) {
      const tokens = text.split(/(\s+)/)
      for (let i = 0; i < tokens.length - 2; i += 2) {
        const currentWord = tokens[i]
        const whitespace = tokens[i+1]
        const nextWord = tokens[i+2]

        if (currentWord && nextWord && currentWord === nextWord && !/[.,!?\\-]/.test(currentWord)) {
          // Replace currentWord, whitespace, nextWord with currentWord-nextWord
          tokens[i] = `${currentWord}-${nextWord}`
          tokens[i+1] = ""
          tokens[i+2] = ""
        }
      }
      text = tokens.join("")
    }

    // Layer 5: Format Huruf
    if (formatMode !== "none") {
      if (formatMode === "lower") {
        text = text.toLowerCase()
      } else if (formatMode === "upper") {
        text = text.toUpperCase()
      } else if (formatMode === "sentence") {
        text = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase())
      } else if (formatMode === "capitalize") {
        text = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
      } else if (formatMode === "toggle") {
        text = text.split("").map(c =>
          c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
        ).join("")
      }
    }

    // Final clean up
    text = text.replace(/\s+/g, ' ').trim()

    return text
  }, [input, findValue, replaceValue, stripEnabled, formatMode])

  // Current effective output (pipeline result OR interactive override)
  const currentOutput = interactiveOutput || pipelineResult

  const handleTokenReplace = () => {
    if (!activeToken) return
    const targetWord = activeToken.word
    const tokens = currentOutput.split(/(\s+)/)
    const newTokens = tokens.map(t => t === targetWord ? replaceTokenInput : t)
    const newOutput = newTokens.join("").replace(/\s+/g, ' ').trim()
    setInteractiveOutput(newOutput)
    setPopoverOpen(false)
    setActiveToken(null)
    setReplaceTokenInput("")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Input Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("inputLabel")}</span>
            <span className="text-[9px] text-muted-foreground/60">{input.length} {t("charCount")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const text = await navigator.clipboard.readText()
                setInput(text)
              }}
              className="font-mono text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground hover:border-muted-foreground transition-colors uppercase tracking-tighter font-bold cursor-pointer"
            >
              {t("pasteButton")}
            </button>
            <button
              onClick={onClear}
              className="font-mono text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground hover:border-muted-foreground transition-colors uppercase tracking-tighter font-bold cursor-pointer"
            >
              {t("clearButton")}
            </button>
          </div>
        </div>

        <div className="relative min-h-40">
          {/* Highlight Overlay */}
          <div
            ref={overlayRef}
            className="absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none select-none overflow-hidden text-transparent"
            aria-hidden="true"
          >
            {renderOverlay()}
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onScroll={handleScroll}
            placeholder={t("inputPlaceholder")}
            className="w-full h-full min-h-40 p-4 bg-transparent border-none outline-none font-mono text-sm leading-relaxed text-foreground resize-none placeholder:text-muted-foreground relative z-10"
          />
        </div>
      </div>

      {/* Find & Replace Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("filterFindLabel")}</label>
          <input
            type="text"
            value={findValue}
            onChange={(e) => setFindValue(e.target.value)}
            className="w-full bg-card border border-border rounded-md px-3 py-2 font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
            placeholder=". , ! a b kata"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("filterReplaceLabel")}</label>
          <input
            type="text"
            value={replaceValue}
            onChange={(e) => setReplaceValue(e.target.value)}
            className="w-full bg-card border border-border rounded-md px-3 py-2 font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
            placeholder={t("filterReplacePlaceholder")}
          />
          {!findValue && replaceValue && (
            <span className="text-[10px] text-red-500 font-bold ml-1 animate-pulse">{t("filterReplaceWarning")}</span>
          )}
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-wrap items-center gap-6 bg-secondary/30 p-3 rounded-lg border border-border">
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setStripEnabled(!stripEnabled)}>
          <div className={cn(
            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
            stripEnabled ? "bg-primary border-primary" : "bg-card border-border"
          )}>
            {stripEnabled && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
          </div>
          <span className="font-mono text-xs font-medium">{t("filterAddStrip")}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground uppercase">{t("filterFormatLabel")}</span>
          <select
            value={formatMode}
            onChange={(e) => setFormatMode(e.target.value as FormatMode)}
            className="font-mono text-xs bg-card text-foreground border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
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

      {/* Output Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("outputLabel")}</span>
            <span className="text-[9px] text-muted-foreground/60">{currentOutput.length} {t("charCount")}</span>
          </div>
          <div className="flex items-center gap-2">
             <button
              onClick={async () => {
                await navigator.clipboard.writeText(currentOutput)
              }}
              className="font-mono text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground hover:border-muted-foreground transition-colors uppercase tracking-tighter font-bold cursor-pointer"
            >
              {t("copyButton")}
            </button>
            <button
              onClick={() => {
                setInput(currentOutput)
                setInteractiveOutput("")
              }}
              className="font-mono text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground hover:border-muted-foreground transition-colors uppercase tracking-tighter font-bold cursor-pointer"
            >
              {t("editButton")}
            </button>
          </div>
        </div>

        <div className="p-4 font-mono text-sm leading-relaxed text-foreground min-h-20 whitespace-pre-wrap break-words">
          {currentOutput ? (
            <div className="inline">
              {currentOutput.split(/(\s+)/).map((part, i) => {
                if (/\s+/.test(part)) return <span key={i} className="whitespace-pre">{part}</span>

                const isSelected = activeToken?.index === i
                const isMatching = activeToken !== null && activeToken.word === part

                return (
                  <Popover key={i} open={popoverOpen && activeToken?.index === i} onOpenChange={(open) => {
                    if (!open) {
                      setPopoverOpen(false)
                      setActiveToken(null)
                    }
                  }}>
                    <PopoverTrigger asChild>
                      <span
                        onClick={() => {
                          setActiveToken({ word: part, index: i })
                          setReplaceTokenInput(part)
                          setPopoverOpen(true)
                        }}
                        className={cn(
                          "px-0.5 rounded transition-colors cursor-pointer border border-transparent hover:bg-secondary/80",
                          isMatching && !isSelected && "bg-blue-100 dark:bg-blue-900/30",
                          isSelected && "ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/50"
                        )}
                      >
                        {part}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 shadow-xl">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("filterReplaceAllWith").replace("{part}", part)}</span>
                          <input
                            autoFocus
                            type="text"
                            value={replaceTokenInput}
                            onChange={(e) => setReplaceTokenInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleTokenReplace()
                              if (e.key === "Escape") {
                                setPopoverOpen(false)
                                setActiveToken(null)
                              }
                            }}
                            className="w-full bg-secondary border border-border rounded px-2 py-1 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <button
                            onClick={() => {
                              setPopoverOpen(false)
                              setActiveToken(null)
                            }}
                            className="text-[10px] font-bold uppercase px-2 py-1 hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleTokenReplace}
                            className="bg-primary text-primary-foreground text-[10px] font-bold uppercase px-3 py-1 rounded hover:bg-primary/90 transition-colors"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )
              })}
            </div>
          ) : (
            <span className="text-muted-foreground italic">{t("outputPlaceholder")}</span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-2">
        <span>{t("filterDeterministic")}</span>
        <span>•</span>
        <span>{t("filterNoAi")}</span>
        <span>•</span>
        <span>{t("filterRealtime")}</span>
      </div>
    </div>
  )
}
