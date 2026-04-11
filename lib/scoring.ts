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
  // Example: "aku lapar\ mau makan\" -> ["aku lapar", "\", " mau makan", "\"]
  const inputTokens = inputClean.split(/(\\)/g).filter(t => t !== "")

  // 3. Simple word-level comparison logic
  // Since the rule is "Don't change words", we can assume words stay the same.
  // We look for where the markers should be.

  let currentPos = 0
  let totalMarkers = 0
  let correctMarkers = 0
  let addedPunctuation = 0
  let missingMarkers = 0

  const highlights: HighlightSegment[] = []

  // Helper to check if a string is a punctuation mark
  const isPunct = (s: string) => /[.,!?;:]/.test(s)

  // This is a simplified heuristic-based comparison
  // In a real scenario, we might use a proper diff library or Levenshtein

  const inputWords = inputClean.split(" ")
  const outputWords = outputClean.split(" ")

  // Count markers in input
  totalMarkers = (inputClean.match(/\\/g) || []).length

  // Build highlights and calculate score
  // We'll iterate through the input tokens
  let outputPtr = 0
  const outputTokens = outputClean.split(/([.,!?;:\s]+)/g).filter(t => t !== "")

  for (const token of inputTokens) {
    if (token === "\\") {
      // Look for a punctuation in output around this position
      let found = false
      // Check next few tokens in output for punctuation
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
        highlights.push({ text: " [MISSING] ", type: "missing" })
        missingMarkers++
      }
    } else {
      // It's normal text
      const cleanToken = token.trim()
      if (cleanToken === "") {
         highlights.push({ text: " ", type: "normal" })
         continue
      }

      // Match the words from the token in the output
      const tokenWords = cleanToken.split(/\s+/)
      for (const word of tokenWords) {
        // Find this word in output
        let wordFound = false
        while (outputPtr < outputTokens.length) {
          const outToken = outputTokens[outputPtr]
          if (outToken.toLowerCase().includes(word.toLowerCase())) {
            highlights.push({ text: outToken, type: "normal" })
            outputPtr++
            wordFound = true
            break
          } else if (isPunct(outToken)) {
            // Unintended punctuation
            highlights.push({ text: outToken, type: "added" })
            addedPunctuation++
            outputPtr++
          } else {
            // Unexpected word change
            highlights.push({ text: outToken, type: "changed" })
            outputPtr++
          }
        }

        if (!wordFound) {
           // Word from input missing in output
        }
      }
    }
  }

  // Final score calculation
  // Base score 100
  // Penalty for missing markers and added punctuation
  const penaltyPerError = totalMarkers > 0 ? (100 / totalMarkers) : 10
  let score = 100

  if (totalMarkers > 0) {
    score = (correctMarkers / totalMarkers) * 100
    // Additional penalty for hallucinations (added punctuation)
    score -= (addedPunctuation * 5)
  } else if (addedPunctuation > 0) {
    score = Math.max(0, 100 - (addedPunctuation * 10))
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    highlights
  }
}
