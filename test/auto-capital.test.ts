import {
  applyFormatWithProtection,
  applySentenceCase,
  formatPreservingReplace
} from "../lib/text-utils"
import { protectKnownEntities, restoreKnownEntities } from "../lib/known-entities"

// Helper asserting condition
function assertEqual(actual: string, expected: string, testName: string) {
  if (actual !== expected) {
    throw new Error(`[FAIL] ${testName}: Expected "${expected}", got "${actual}"`)
  }
  console.log(`✓ [PASS] ${testName}`)
}

interface RunEngineOptions {
  findValue?: string
  replaceValue?: string
  smartReplaceMode?: "format-preserving" | "strict"
  stripEnabled?: boolean
  removeLineBreak?: boolean
  formatMode?: "none" | "sentence" | "lower" | "upper" | "capitalize" | "toggle"
  autoCapital?: boolean
  autoSentence?: boolean
  autoLowercase?: boolean
  autoFixSpace?: boolean
}

// Simulated runEngine matching components/filter-custom.tsx
function runEngine(text: string, options: RunEngineOptions = {}): string {
  const {
    findValue = "",
    replaceValue = "",
    smartReplaceMode = "format-preserving",
    stripEnabled = false,
    removeLineBreak = false,
    formatMode = "none",
    autoCapital = false,
    autoSentence = false,
    autoLowercase = false,
    autoFixSpace = false,
  } = options

  let result = text

  // 1. Find & Replace
  if (findValue.trim()) {
    const targets = findValue.split(/\s+/).filter(t => t.length > 0)
    targets.forEach(target => {
      if (smartReplaceMode === "format-preserving") {
        const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(\\b|\\s|^)(${escapedTarget})(\\b|\\s|$)`, 'g')
        result = result.replace(regex, (match, p1, p2, p3) => {
          return p1 + formatPreservingReplace(p2, replaceValue) + p3
        })
      } else {
        result = result.replaceAll(target, replaceValue)
      }
    })
  }

  // 1.5. Protect Known Entities (Dictionary)
  const { protectedText, entities } = protectKnownEntities(result)
  result = protectedText

  // 2. Add Strip
  if (stripEnabled) {
    result = result.replace(/\b([a-zA-Z0-9]+)\s+\1\b/gi, (match, word1) => {
      const words = match.split(/\s+/)
      return words[0] + '-' + words[1].toLowerCase()
    })
  }

  // 3. Remove Line Break
  if (removeLineBreak) {
    result = result.replace(/\n+/g, ' ')
  }

  // 4. Format Huruf
  if (formatMode !== "none") {
    result = applyFormatWithProtection(result, (t) => {
      if (formatMode === "lower") return t.toLowerCase()
      if (formatMode === "upper") return t.toUpperCase()
      if (formatMode === "sentence") return applySentenceCase(t)
      if (formatMode === "capitalize") return t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
      if (formatMode === "toggle") return t.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("")
      return t
    })
  }

  // 6. Auto Capital After .!? (if ON) - Exact code from components/filter-custom.tsx
  if (autoCapital) {
    result = applyFormatWithProtection(result, (t) => {
      return t.replace(/(^|[.!?]\s+)([a-z])/g, (_, punct, char) =>
        punct + char.toUpperCase()
      )
    })
  }

  // 7. Auto Sentence Case (if ON)
  if (autoSentence) {
    result = applySentenceCase(result)
  }

  // 8. Auto Lowercase (if ON)
  if (autoLowercase) {
    if (autoSentence) {
      result = result.toLowerCase()
      result = applySentenceCase(result)
    } else {
      // Protect acronyms, lowercase rest
      const acronyms: string[] = []
      let protectedText = result.replace(/\b[A-Z]{2,}\b/g, match => {
        acronyms.push(match)
        return `__ACR${acronyms.length - 1}__`
      })
      protectedText = protectedText.replace(/\b[A-Z][a-z]*\b/g, w => w.toLowerCase())
      result = protectedText.replace(/__ACR(\d+)__/g, (_, i) => acronyms[parseInt(i)])
    }
  }

  // 9. Auto Fix Space
  if (autoFixSpace) {
    result = result
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // 9.5. Restore Known Entities
  result = restoreKnownEntities(result, entities)

  return result
}

function runAutoCapitalTests() {
  console.log("=== Running Auto Capital (Step 6) Tests ===")

  // 1. Toggle autoCapital ON. Input: "sprei itu bagus." (huruf pertama lowercase di awal teks)
  const res1 = runEngine("sprei itu bagus.", { autoCapital: true })
  assertEqual(res1, "Sprei itu bagus.", "Test 1: Auto Capital ON (start of string)")

  // 2. Toggle autoCapital ON. Input: "sprei itu bagus. beli di toko." (dua kalimat)
  const res2 = runEngine("sprei itu bagus. beli di toko.", { autoCapital: true })
  assertEqual(res2, "Sprei itu bagus. Beli di toko.", "Test 2: Auto Capital ON (multi-sentence)")

  // 3. Toggle autoCapital OFF. Input: "sprei itu bagus."
  const res3 = runEngine("sprei itu bagus.", { autoCapital: false })
  assertEqual(res3, "sprei itu bagus.", "Test 3: Auto Capital OFF (no-op)")

  // 4. Toggle autoCapital ON + Acronym protection check.
  const res4 = runEngine("qris itu praktis, saya suka QRIS juga.", { autoCapital: true })
  assertEqual(res4, "Qris itu praktis, saya suka QRIS juga.", "Test 4: Auto Capital ON (Acronym QRIS preserved, qris capitalized)")

  console.log("All Auto Capital tests passed successfully!")
}

runAutoCapitalTests()
