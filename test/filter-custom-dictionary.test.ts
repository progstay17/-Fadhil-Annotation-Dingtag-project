import {
  addKnownEntity
} from "../lib/known-entities"
import {
  protectKnownEntities,
  restoreKnownEntities
} from "../lib/known-entities"
import {
  applyFormatWithProtection,
  applySentenceCase,
  formatPreservingReplace
} from "../lib/text-utils"

// Mock localStorage for node test environment
if (typeof window === "undefined") {
  const storage: Record<string, string> = {}
  global.window = {
    localStorage: {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => { storage[key] = val },
      removeItem: (key: string) => { delete storage[key] },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]) }
    }
  } as any
  global.localStorage = global.window.localStorage
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

interface EngineOptions {
  findValue?: string
  replaceValue?: string
  smartReplaceMode?: "format-preserving" | "strict"
  formatMode?: "none" | "sentence" | "lower" | "upper" | "capitalize" | "toggle"
  autoLowercase?: boolean
}

function simulateRunEngine(text: string, options: EngineOptions = {}): string {
  const {
    findValue = "",
    replaceValue = "",
    smartReplaceMode = "format-preserving",
    formatMode = "none",
    autoLowercase = false,
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

  // 1.5. Protect Known Entities
  const { protectedText, entities } = protectKnownEntities(result)
  result = protectedText

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

  // 8. Auto Lowercase
  if (autoLowercase) {
    const acronyms: string[] = []
    let pText = result.replace(/\b[A-Z]{2,}\b/g, match => {
      acronyms.push(match)
      return `__ACR${acronyms.length - 1}__`
    })
    pText = pText.replace(/\b[A-Z][a-z]*\b/g, w => w.toLowerCase())
    result = pText.replace(/__ACR(\d+)__/g, (_, i) => acronyms[parseInt(i)])
  }

  // 9.5. Restore Known Entities
  result = restoreKnownEntities(result, entities)

  return result
}

function runTests() {
  console.log("=== Running Filter Custom Dictionary Integration Tests ===")

  localStorage.clear()

  // Test 1: Auto Lowercase ON with dictionary entry shopee -> Shopee
  addKnownEntity("shopee", "Shopee")
  const out1 = simulateRunEngine("saya beli di shopee", { autoLowercase: true })
  assert(out1 === "saya beli di Shopee", `Test 1 failed! Got: "${out1}"`)
  console.log("✓ Test 1 passed (Auto Lowercase ON preserve canonical)")

  // Test 2: Format Huruf UPPERCASE with dictionary entry shopee -> Shopee
  const out2 = simulateRunEngine("saya beli di shopee", { formatMode: "upper" })
  assert(out2 === "SAYA BELI DI Shopee", `Test 2 failed! Got: "${out2}"`)
  console.log("✓ Test 2 passed (Format Huruf UPPERCASE preserve canonical)")

  // Test 3: Substring overlap in dictionary (shop -> Shop vs shopee -> Shopee)
  localStorage.clear()
  addKnownEntity("shop", "Shop")
  addKnownEntity("shopee", "Shopee")
  const out3 = simulateRunEngine("saya di shopee", { autoLowercase: true })
  assert(out3 === "saya di Shopee", `Test 3 failed! Got: "${out3}"`)
  console.log("✓ Test 3 passed (Substring overlap shopee vs shop)")

  // Test 4: Combination Find & Replace + Dictionary
  localStorage.clear()
  addKnownEntity("shopee", "Shopee")
  const out4 = simulateRunEngine("saya beli di shopee", {
    findValue: "beli",
    replaceValue: "belanja"
  })
  assert(out4 === "saya belanja di Shopee", `Test 4 failed! Got: "${out4}"`)
  console.log("✓ Test 4 passed (Find & Replace + Dictionary)")

  console.log("All Filter Custom Dictionary integration tests passed successfully!")
}

runTests()
