"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useLanguage } from "./language-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer } from "vaul"
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
  const [hoverToken, setHoverToken] = useState<{ word: string, index: number } | null>(null)
  const [batchSelected, setBatchSelected] = useState<number[]>([])
  const [batchEditEnabled, setBatchEditEnabled] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [hoverPopoverOpen, setHoverPopoverOpen] = useState(false)
  const [replaceTokenInput, setReplaceTokenInput] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<{ text: string, reason: string }[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)

  const [ctrlDragStart, setCtrlDragStart] = useState<number | null>(null)
  const [showMobileSheet, setShowMobileSheet] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const pressTimer = useRef<NodeJS.Timeout | null>(null)

  // Refs for scroll sync
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const popoverAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
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

    return tokens.map((token, i) => {
      const isRepeated = indices.includes(i)
      const isBatchSelected = batchSelected.includes(i)

      return (
        <span
          key={i}
          data-index={i}
          className={cn(
            "token-span rounded-sm transition-colors",
            isRepeated && !isBatchSelected && "bg-yellow-200 dark:bg-transparent dark:invert",
            isBatchSelected && "bg-blue-200 dark:bg-blue-500/30",
            !isRepeated && !isBatchSelected && "text-transparent"
          )}
        >
          {token}
        </span>
      )
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

  const handleCopy = () => {
    navigator.clipboard.writeText(input)
  }

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText()
    setInput(text)
  }

  const getTokenInfoAtPos = (pos: number) => {
    const tokens = input.split(/(\s+)/)
    let currentPos = 0
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (pos >= currentPos && pos <= currentPos + token.length) {
        // If it's whitespace, we might want the word before or after
        if (/\s+/.test(token)) return null
        return { word: token, index: i, start: currentPos, end: currentPos + token.length }
      }
      currentPos += token.length
    }
    return null
  }

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLTextAreaElement
    const pos = target.selectionStart
    const tokenInfo = getTokenInfoAtPos(pos)

    if (tokenInfo && (e.altKey || batchEditEnabled)) {
      e.preventDefault()
      const tokens = input.split(/(\s+)/)
      const matches: number[] = []
      tokens.forEach((t, i) => {
        if (t === tokenInfo.word) matches.push(i)
      })
      setBatchSelected(matches)
      setActiveToken({ word: tokenInfo.word, index: tokenInfo.index })
      setReplaceTokenInput(tokenInfo.word)

      if (popoverAnchorRef.current) {
        const span = overlayRef.current?.querySelector(`[data-index="${tokenInfo.index}"]`)
        if (span) {
          const rect = span.getBoundingClientRect()
          popoverAnchorRef.current.style.left = `${rect.left}px`
          popoverAnchorRef.current.style.top = `${rect.top}px`
          popoverAnchorRef.current.style.width = `${rect.width}px`
          popoverAnchorRef.current.style.height = `${rect.height}px`
        }
      }
      setPopoverOpen(true)
    }
  }

  const handleEditorMouseDown = (e: React.MouseEvent) => {
    if (e.ctrlKey) {
      const target = e.target as HTMLTextAreaElement
      const tokenInfo = getTokenInfoAtPos(target.selectionStart)
      if (tokenInfo) {
        setCtrlDragStart(tokenInfo.index)
      }
    }
  }

  const handleEditorMouseUp = (e: React.MouseEvent) => {
    if (e.ctrlKey && ctrlDragStart !== null) {
      const target = e.target as HTMLTextAreaElement
      const tokenInfo = getTokenInfoAtPos(target.selectionStart)
      if (tokenInfo) {
        const start = Math.min(ctrlDragStart, tokenInfo.index)
        const end = Math.max(ctrlDragStart, tokenInfo.index)
        const tokens = input.split(/(\s+)/)
        const matches: number[] = []
        for (let i = start; i <= end; i++) {
          if (i % 2 === 0) matches.push(i)
        }
        setBatchSelected(matches)
        setActiveToken({ word: tokens[matches[0]], index: matches[0] })
        setReplaceTokenInput(tokens[matches[0]])

        if (popoverAnchorRef.current) {
          const span = overlayRef.current?.querySelector(`[data-index="${matches[0]}"]`)
          if (span) {
            const rect = span.getBoundingClientRect()
            popoverAnchorRef.current.style.left = `${rect.left}px`
            popoverAnchorRef.current.style.top = `${rect.top}px`
            popoverAnchorRef.current.style.width = `${rect.width}px`
            popoverAnchorRef.current.style.height = `${rect.height}px`
          }
        }
        setPopoverOpen(true)
      }
      setCtrlDragStart(null)
    }
  }

  const handleEditorTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length >= 2) return

    const target = e.target as HTMLTextAreaElement
    const pos = target.selectionStart
    const tokenInfo = getTokenInfoAtPos(pos)

    if (tokenInfo) {
      pressTimer.current = setTimeout(() => {
        if ('vibrate' in navigator) navigator.vibrate(30)
        const tokens = input.split(/(\s+)/)
        const matches: number[] = []
        tokens.forEach((t, i) => {
          if (t === tokenInfo.word) matches.push(i)
        })
        setBatchSelected(matches)
        setActiveToken({ word: tokenInfo.word, index: tokenInfo.index })
        setReplaceTokenInput(tokenInfo.word)
        setPopoverOpen(true)
      }, 500)
    }
  }

  const handleEditorTouchEnd = (e: React.TouchEvent) => {
    if (pressTimer.current) clearTimeout(pressTimer.current)

    // Tap token (anomali) -> bottom sheet
    if (isTouchDevice && !batchEditEnabled) {
      const target = e.target as HTMLTextAreaElement
      const tokenInfo = getTokenInfoAtPos(target.selectionStart)
      if (tokenInfo) {
        const isRepeated = getRepeatedWordsIndices(input).indices.includes(tokenInfo.index)
        const isNumber = /^\d+$/.test(tokenInfo.word)
        const likelyTypo = /(.)\1{2,}/.test(tokenInfo.word) || (tokenInfo.word.length <= 4 && !/^\d+$/.test(tokenInfo.word) && /^[a-zA-Z]+$/.test(tokenInfo.word))

        if (isRepeated || isNumber || likelyTypo) {
          setHoverToken({ word: tokenInfo.word, index: tokenInfo.index })
          setShowMobileSheet(true)
          fetchAiSuggestions(tokenInfo.word, input)
        }
      }
    }
  }

  const handleEditorMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice || !overlayRef.current || popoverOpen) return

    const x = e.clientX
    const y = e.clientY

    const spans = overlayRef.current.querySelectorAll('.token-span')
    let found = null
    for (const span of Array.from(spans)) {
      const rect = span.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const index = parseInt(span.getAttribute('data-index') || '-1')
        const word = span.textContent || ''
        if (word.trim().length === 0) continue
        found = { word, index, rect }
        break
      }
    }

    if (found) {
      const isRepeated = getRepeatedWordsIndices(input).indices.includes(found.index)
      const isNumber = /^\d+$/.test(found.word)
      const likelyTypo = /(.)\1{2,}/.test(found.word) || (found.word.length <= 4 && !/^\d+$/.test(found.word) && /^[a-zA-Z]+$/.test(found.word))

      if (isRepeated || isNumber || likelyTypo) {
        setHoverToken({ word: found.word, index: found.index })
        if (popoverAnchorRef.current) {
          popoverAnchorRef.current.style.left = `${found.rect.left}px`
          popoverAnchorRef.current.style.top = `${found.rect.top}px`
          popoverAnchorRef.current.style.width = `${found.rect.width}px`
          popoverAnchorRef.current.style.height = `${found.rect.height}px`
        }
        setHoverPopoverOpen(true)
        fetchAiSuggestions(found.word, input)
      }
    }
  }

  const fetchAiSuggestions = async (token: string, context: string) => {
    // Typo detection heuristic (Bug 6)
    const likelyTypo = (t: string) => {
      if (/(.)\1{2,}/.test(t)) return true
      if (t.length <= 4 && !/^\d+$/.test(t)) return true
      return false
    }

    if (!likelyTypo(token)) {
      setAiSuggestions([])
      return
    }

    setIsAiLoading(true)
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: token,
          provider: "google",
          systemPrompt: `Kamu adalah asisten koreksi teks Bahasa Indonesia yang minimal.
Konteks (read-only): "${context}"
Token target: "${token}"

Kembalikan HANYA JSON array, maksimal 3 item:
[{ "text": "koreksi", "reason": "alasan singkat" }]

Rules:
- Hanya koreksi typo dan ejaan informal
- JANGAN ubah gaya bahasa
- JANGAN ubah konteks
- Kembalikan JSON saja, tanpa teks lain`
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
      // AI gagal -> hidden silently (Bug 6)
      setAiSuggestions([])
    } finally {
      setIsAiLoading(false)
    }
  }

  const applyReplacement = (newWord: string, targetIndices?: number[]) => {
    const tokens = input.split(/(\s+)/)
    const indicesToUpdate = targetIndices || batchSelected
    indicesToUpdate.forEach(idx => {
      tokens[idx] = newWord
    })
    setInput(tokens.join(""))
    setPopoverOpen(false)
    setHoverPopoverOpen(false)
    setBatchSelected([])
    setActiveToken(null)
  }

  const getAlgoSuggestions = (token: string) => {
    const suggestions: { category: string, text: string, reason: string }[] = []

    // Kategori 1: Format Teks
    if (/^[a-zA-Z]+$/.test(token)) {
      suggestions.push({ category: "Format", text: token[0].toUpperCase() + token.slice(1).toLowerCase(), reason: "Capitalize" })
      suggestions.push({ category: "Format", text: token.toUpperCase(), reason: "UPPERCASE" })
      suggestions.push({ category: "Format", text: token.toLowerCase(), reason: "lowercase" })
    }

    // Kategori 2 & 3: Tanda Baca
    const wordPart = token.replace(/[.,!?]$/, "")
    const hasPunct = /[.,!?]$/.test(token)

    if (hasPunct) {
      suggestions.push({ category: "Tanda Baca", text: wordPart, reason: "hapus tanda baca" })
    } else {
      suggestions.push({ category: "Tanda Baca", text: token + ",", reason: "tambah koma" })
      suggestions.push({ category: "Tanda Baca", text: token + ".", reason: "tambah titik" })
      suggestions.push({ category: "Tanda Baca", text: token + "!", reason: "tambah seru" })
      suggestions.push({ category: "Tanda Baca", text: token + "?", reason: "tambah tanya" })
    }

    // Kategori 5: Angka -> Terbilang
    if (/^\d+$/.test(token)) {
      suggestions.push({ category: "Angka", text: numberToIndonesianWords(token), reason: "Konversi ke kata" })
    }

    return suggestions
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
            onClick={handleCopy}
            className="font-mono text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground hover:border-muted-foreground transition-colors uppercase tracking-tighter font-bold cursor-pointer"
          >
            Salin
          </button>
          <button
            onClick={handlePaste}
            className="font-mono text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground hover:border-muted-foreground transition-colors uppercase tracking-tighter font-bold cursor-pointer"
          >
            Tempel
          </button>
          <button
            onClick={onClear}
            className="font-mono text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground hover:border-muted-foreground transition-colors uppercase tracking-tighter font-bold cursor-pointer"
          >
            Bersihkan
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
            onClick={handleEditorClick}
            onMouseDown={handleEditorMouseDown}
            onMouseUp={handleEditorMouseUp}
            onMouseMove={handleEditorMouseMove}
            onMouseLeave={() => !popoverOpen && setHoverPopoverOpen(false)}
            onTouchStart={handleEditorTouchStart}
            onTouchEnd={handleEditorTouchEnd}
            placeholder={t("inputPlaceholder")}
            className="w-full h-full min-h-[300px] p-6 bg-transparent border-none outline-none font-mono text-sm leading-relaxed text-foreground resize-none placeholder:text-muted-foreground relative z-30 scrollbar-thin"
          />

          {/* Interaction/Highlight Layer */}
          <div
            ref={overlayRef}
            className="absolute inset-0 p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden text-transparent z-10 pointer-events-none"
            style={{
              font: "inherit",
              padding: "inherit",
              lineHeight: "inherit",
            }}
            aria-hidden="true"
          >
            {renderOverlay()}
          </div>
        </div>

        {/* Hidden Anchor for Popovers */}
        <div ref={popoverAnchorRef} className="fixed pointer-events-none z-[100]" />

        {/* Batch Edit Popover (Triggered by ALT+Click or CTRL+Drag or Batch Edit Mode) */}
        <Popover open={popoverOpen} onOpenChange={(open) => {
          if (!open) {
            setPopoverOpen(false)
            setBatchSelected([])
            setActiveToken(null)
          }
        }}>
          <PopoverTrigger asChild>
             <div className="absolute" style={{
               left: popoverAnchorRef.current?.style.left,
               top: popoverAnchorRef.current?.style.top,
               width: popoverAnchorRef.current?.style.width,
               height: popoverAnchorRef.current?.style.height,
             }} />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-2xl bg-card border-border overflow-hidden rounded-lg" side="top" align="center" sideOffset={5}>
            <div className="bg-primary/10 px-4 py-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Wand2 className="w-3 h-3" />
                Batch Edit
              </span>
            </div>

            <div className="p-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase ml-0.5">Edit {batchSelected.length} tokens</label>
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
              <div className="flex gap-2">
                <button
                  onClick={() => applyReplacement("")}
                  className="flex-1 bg-red-500/10 text-red-600 border border-red-500/20 py-2 rounded text-[10px] font-bold uppercase hover:bg-red-500/20 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(batchSelected.map(idx => input.split(/(\s+)/)[idx]).join(" "))
                    setPopoverOpen(false)
                  }}
                  className="flex-1 bg-secondary border border-border py-2 rounded text-[10px] font-bold uppercase hover:bg-secondary/80 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Suggestion Popover (Hover Desktop) */}
        <Popover open={hoverPopoverOpen} onOpenChange={setHoverPopoverOpen}>
           <PopoverTrigger asChild>
              <div className="absolute" style={{
                left: popoverAnchorRef.current?.style.left,
                top: popoverAnchorRef.current?.style.top,
                width: popoverAnchorRef.current?.style.width,
                height: popoverAnchorRef.current?.style.height,
              }} />
           </PopoverTrigger>
           <PopoverContent className="w-64 p-0 shadow-2xl bg-card border-border overflow-hidden rounded-xl" onMouseEnter={() => setHoverPopoverOpen(true)} onMouseLeave={() => setHoverPopoverOpen(false)} side="top" align="center" sideOffset={5}>
              <div className="bg-primary/5 px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Suggestions
                </span>
              </div>

              <div className="p-2 flex flex-col gap-2 max-h-80 overflow-y-auto">
                {hoverToken && (
                  <>
                    {/* Algorithm Suggestions grouped by category */}
                    {Object.entries(
                      getAlgoSuggestions(hoverToken.word).reduce((acc, s) => {
                        if (!acc[s.category]) acc[s.category] = []
                        acc[s.category].push(s)
                        return acc
                      }, {} as Record<string, any[]>)
                    ).map(([category, items]) => (
                      <div key={category} className="flex flex-col gap-1">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase px-1">{category}</p>
                        {items.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => applyReplacement(s.text, [hoverToken.index])}
                            className="w-full text-left px-3 py-1.5 hover:bg-primary/5 rounded font-mono text-xs flex justify-between items-center transition-colors"
                          >
                            <span>{s.text}</span>
                            <span className="text-[9px] text-muted-foreground opacity-70">{s.reason}</span>
                          </button>
                        ))}
                      </div>
                    ))}

                    {/* AI Suggestions */}
                    {(isAiLoading || aiSuggestions.length > 0) && (
                      <div className="flex flex-col gap-1 pt-1 border-t border-border/50">
                        <p className="text-[9px] font-bold text-purple-600 uppercase px-1">Koreksi</p>
                        {isAiLoading ? (
                           <div className="py-2 flex justify-center"><div className="w-3 h-3 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
                        ) : (
                          aiSuggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => applyReplacement(s.text, [hoverToken.index])}
                              className="w-full text-left px-3 py-1.5 hover:bg-purple-500/5 rounded font-mono text-xs flex flex-col transition-colors border border-transparent hover:border-purple-500/20"
                            >
                              <span className="font-bold text-purple-700 dark:text-purple-400">{s.text}</span>
                              <span className="text-[9px] text-muted-foreground">{s.reason}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
           </PopoverContent>
        </Popover>

        {/* Mobile Bottom Sheet (Vaul) */}
        <Drawer.Root open={showMobileSheet} onOpenChange={setShowMobileSheet}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
            <Drawer.Content className="bg-card flex flex-col rounded-t-[20px] h-auto max-h-[85vh] fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-border shadow-2xl">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 my-4" />

              <div className="p-4 pt-0 overflow-y-auto scrollbar-none">
                <div className="flex flex-col gap-1 mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Token dipilih</p>
                  <p className="text-xl font-mono font-bold text-primary">{hoverToken?.word}</p>
                </div>

                <div className="h-px bg-border/50 mb-4" />

                <div className="flex flex-col gap-4 pb-8">
                  {hoverToken && (
                    <>
                      {/* Algorithm Suggestions grouped by category */}
                      {Object.entries(
                        getAlgoSuggestions(hoverToken.word).reduce((acc, s) => {
                          if (!acc[s.category]) acc[s.category] = []
                          acc[s.category].push(s)
                          return acc
                        }, {} as Record<string, any[]>)
                      ).map(([category, items]) => (
                        <div key={category} className="flex flex-col gap-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{category}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {items.map((s, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  applyReplacement(s.text, [hoverToken.index])
                                  setShowMobileSheet(false)
                                }}
                                className="w-full text-left px-4 py-3 bg-secondary/50 active:bg-secondary rounded-xl font-mono text-sm flex justify-between items-center transition-all border border-border/50"
                              >
                                <span>{s.text}</span>
                                <span className="text-xs text-muted-foreground opacity-60">{s.reason}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* AI Suggestions */}
                      {(isAiLoading || aiSuggestions.length > 0) && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
                          <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Koreksi AI</p>
                          {isAiLoading ? (
                             <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {aiSuggestions.map((s, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    applyReplacement(s.text, [hoverToken.index])
                                    setShowMobileSheet(false)
                                  }}
                                  className="w-full text-left px-4 py-3 bg-purple-500/5 active:bg-purple-500/10 rounded-xl font-mono text-sm flex flex-col transition-all border border-purple-500/10"
                                >
                                  <span className="font-bold text-purple-700 dark:text-purple-400">{s.text}</span>
                                  <span className="text-xs text-muted-foreground">{s.reason}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-border bg-card">
                 <button
                  onClick={() => setShowMobileSheet(false)}
                  className="w-full py-4 bg-secondary text-muted-foreground font-bold rounded-xl active:scale-[0.98] transition-transform"
                 >
                   Tutup
                 </button>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        {/* Batch Toolbar Mobile (Visible when tokens are selected) */}
        {isTouchDevice && batchSelected.length > 0 && (
           <div className="fixed bottom-0 left-0 right-0 z-[60] bg-card border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex items-center justify-around px-4 py-4 animate-in slide-in-from-bottom duration-300">
             <button
               onClick={() => setPopoverOpen(true)}
               className="flex flex-col items-center gap-1 text-primary active:scale-90 transition-transform"
             >
               <Wand2 className="w-5 h-5" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Ganti</span>
             </button>
             <button
               onClick={() => applyReplacement("")}
               className="flex flex-col items-center gap-1 text-red-500 active:scale-90 transition-transform"
             >
               <AlertTriangle className="w-5 h-5" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Hapus</span>
             </button>
             <button
               onClick={() => {
                 navigator.clipboard.writeText(batchSelected.map(idx => input.split(/(\s+)/)[idx]).join(" "))
                 setBatchSelected([])
               }}
               className="flex flex-col items-center gap-1 text-muted-foreground active:scale-90 transition-transform"
             >
               <Info className="w-5 h-5" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Salin</span>
             </button>
             <button
               onClick={() => setBatchSelected([])}
               className="flex flex-col items-center gap-1 text-muted-foreground/40 active:scale-90 transition-transform"
             >
               <HelpCircle className="w-5 h-5" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Batal</span>
             </button>
           </div>
        )}
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

              <label className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border cursor-pointer hover:bg-card transition-colors select-none">
                <input
                  type="checkbox"
                  checked={autoCapital}
                  onChange={(e) => setAutoCapital(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-bold uppercase">Auto Capital</span>
                  <HelpIcon>{t("filterAutoCapital")}</HelpIcon>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border cursor-pointer hover:bg-card transition-colors select-none">
                <input
                  type="checkbox"
                  checked={batchEditEnabled}
                  onChange={(e) => setBatchEditEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-bold uppercase">Batch Edit</span>
                  <HelpIcon>
                    Batch Edit
                    {"\n"}Aktifkan untuk mengedit semua kata identik sekaligus.
                    {"\n"}Klik kata → semua yang sama terpilih → edit satu → semua berubah.
                    {"\n"}Tanpa Batch Edit: ALT+Click untuk select massal.
                  </HelpIcon>
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
