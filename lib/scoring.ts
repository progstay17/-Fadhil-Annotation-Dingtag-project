export interface HighlightSegment {
  text: string
  type: "normal" | "correct" | "added" | "missing" | "changed"
}

export interface ScoringResult {
  score: number
  highlights: HighlightSegment[]
}

export function calculateScoring(input: string, output: string): ScoringResult {
  // 1. Normalize and clean
  const inputClean = input.replace(/\s+/g, " ").trim()
  const outputClean = output.replace(/\s+/g, " ").trim()

  // 2. Tokenize input by markers
  const inputTokens = inputClean.split(/(\\)/g).filter(t => t !== "")

  let correctMarkers = 0
  let addedPunctuation = 0
  let missingMarkers = 0

  const highlights: HighlightSegment[] = []
  const isPunct = (s: string) => /[.,!?;:]/.test(s)

  // Tokenize output and handle spaces separately
  const outputTokens = outputClean.split(/([.,!?;:\s]+)/g).filter(t => t !== "")
  let outputPtr = 0

  for (const token of inputTokens) {
    if (token === "\\") {
      let found = false
      const lookAhead = 2
      for (let i = 0; i < lookAhead && (outputPtr + i) < outputTokens.length; i++) {
        if (isPunct(outputTokens[outputPtr + i])) {
          highlights.push({ text: outputTokens[outputPtr + i], type: "correct" })
          outputPtr += i + 1
          correctMarkers++
          found = true
          break
        }
      }

      if (!found) {
        highlights.push({ text: "[MISSING]", type: "missing" })
        missingMarkers++
      }
    } else {
      const tokenWords = token.trim().split(/\s+/)
      for (const word of tokenWords) {
        if (word === "") continue

        let wordFound = false
        while (outputPtr < outputTokens.length) {
          const outToken = outputTokens[outputPtr]

          if (outToken.trim() === "") {
            // It's just a space or newline, push as normal and continue
            highlights.push({ text: outToken, type: "normal" })
            outputPtr++
            continue
          }

          if (outToken.toLowerCase().includes(word.toLowerCase())) {
            highlights.push({ text: outToken, type: "normal" })
            outputPtr++
            wordFound = true
            break
          } else if (isPunct(outToken)) {
            highlights.push({ text: outToken, type: "added" })
            addedPunctuation++
            outputPtr++
          } else {
            highlights.push({ text: outToken, type: "changed" })
            outputPtr++
          }
        }
      }
    }
  }

  // Push remaining output tokens
  while (outputPtr < outputTokens.length) {
    const outToken = outputTokens[outputPtr]
    highlights.push({
      text: outToken,
      type: isPunct(outToken) ? "added" : "changed"
    })
    if (isPunct(outToken)) addedPunctuation++
    outputPtr++
  }

  const totalMarkers = (inputClean.match(/\\/g) || []).length
  let score = 100

  if (totalMarkers > 0) {
    score = (correctMarkers / totalMarkers) * 100
    score -= (addedPunctuation * 5) + (missingMarkers * 5)
  } else if (addedPunctuation > 0) {
    score = Math.max(0, 100 - (addedPunctuation * 10))
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    highlights
  }
}
