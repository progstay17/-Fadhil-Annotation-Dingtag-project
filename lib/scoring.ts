export interface HighlightSegment {
  text: string
  type: "normal" | "correct" | "added" | "missing" | "changed"
}

export interface ScoringResult {
  score: number
  highlights: HighlightSegment[]
}

/**
 * Calculates accuracy score by comparing input (with \ markers) and output.
 * Ignores whitespace (spaces/newlines) in calculations.
 */
export function calculateScoring(input: string, output: string): ScoringResult {
  // Remove all whitespace for logic comparison
  const cleanInput = input.replace(/\s/g, "")
  const cleanOutput = output.replace(/\s/g, "")

  const highlights: HighlightSegment[] = []

  // Basic character-by-character alignment
  let inIdx = 0
  let outIdx = 0

  let matches = 0
  let totalOpportunities = 0

  // We iterate through the input characters (excluding whitespace)
  while (inIdx < cleanInput.length || outIdx < cleanOutput.length) {
    const inChar = cleanInput[inIdx]
    const outChar = cleanOutput[outIdx]

    if (inChar === "\\") {
      totalOpportunities++
      // Backslash should match a punctuation in output
      if (outChar && /[.,!?;:]/.test(outChar)) {
        highlights.push({ text: outChar, type: "correct" })
        matches++
        inIdx++
        outIdx++
      } else {
        // Missing punctuation where \ was
        highlights.push({ text: "[MISSING]", type: "missing" })
        inIdx++
      }
    } else if (inChar && outChar && inChar.toLowerCase() === outChar.toLowerCase()) {
      // Character match (ignoring case)
      totalOpportunities++
      highlights.push({ text: outChar, type: "normal" })
      matches++
      inIdx++
      outIdx++
    } else if (inChar && !outChar) {
      // Input has character, output doesn't (missing)
      totalOpportunities++
      highlights.push({ text: inChar, type: "changed" })
      inIdx++
    } else if (!inChar && outChar) {
      // Output has extra character
      highlights.push({ text: outChar, type: "added" })
      outIdx++
    } else if (inChar && outChar && inChar !== outChar) {
      // Mismatch
      totalOpportunities++
      highlights.push({ text: outChar, type: "changed" })
      inIdx++
      outIdx++
    } else {
      break
    }
  }

  const score = totalOpportunities > 0 ? (matches / totalOpportunities) * 100 : 100

  // Post-process highlights to merge consecutive segments of same type for better UI
  const mergedHighlights: HighlightSegment[] = []
  if (highlights.length > 0) {
    let current = { ...highlights[0] }
    for (let i = 1; i < highlights.length; i++) {
      if (highlights[i].type === current.type) {
        current.text += highlights[i].text
      } else {
        mergedHighlights.push(current)
        current = { ...highlights[i] }
      }
    }
    mergedHighlights.push(current)
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    highlights: mergedHighlights
  }
}
