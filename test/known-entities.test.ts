import {
  protectKnownEntities,
  restoreKnownEntities,
  addKnownEntity
} from "../lib/known-entities"

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

function runTests() {
  console.log("=== Running known-entities tests ===")

  // Reset
  localStorage.clear()

  // Test 1: Round-trip
  addKnownEntity("shopee", "Shopee")
  const text1 = "Saya belanja di shopee kemarin"
  const { protectedText: p1, entities: e1 } = protectKnownEntities(text1)
  assert(p1 === "Saya belanja di zzentityz0zz kemarin", `Expected placeholder in p1, got ${p1}`)
  const r1 = restoreKnownEntities(p1, e1)
  assert(r1 === "Saya belanja di Shopee kemarin", `Expected restored r1, got ${r1}`)
  console.log("✓ Test 1 passed (Round-trip)")

  // Test 2: Lowercase transformation
  const text2 = "Saya suka Shopee sekali"
  const { protectedText: p2, entities: e2 } = protectKnownEntities(text2)
  const lower2 = p2.toLowerCase()
  assert(lower2.includes("zzentityz0zz"), `Expected lower2 to contain zzentityz0zz, got ${lower2}`)
  const r2 = restoreKnownEntities(lower2, e2)
  assert(r2 === "saya suka Shopee sekali", `Expected restored r2, got ${r2}`)
  console.log("✓ Test 2 passed (Lowercase transformation)")

  // Test 3: Uppercase transformation
  const { protectedText: p3, entities: e3 } = protectKnownEntities(text2)
  const upper3 = p3.toUpperCase()
  assert(upper3.includes("ZZENTITYZ0ZZ"), `Expected upper3 to contain ZZENTITYZ0ZZ, got ${upper3}`)
  const r3 = restoreKnownEntities(upper3, e3)
  assert(r3 === "SAYA SUKA SHOPEE SEKALI", `Expected restored r3, got ${r3}`)
  console.log("✓ Test 3 passed (Uppercase transformation)")

  // Test 4: Capitalize Each Word
  const text4 = "saya suka shopee sekali"
  const { protectedText: p4, entities: e4 } = protectKnownEntities(text4)
  const cap4 = p4.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  const r4 = restoreKnownEntities(cap4, e4)
  assert(r4 === "Saya Suka Shopee Sekali", `Expected restored r4, got ${r4}`)
  console.log("✓ Test 4 passed (Capitalize Each Word)")

  // Test 5: Multiple entities & sort-by-length precedence
  localStorage.clear()
  addKnownEntity("shop", "Shop")
  addKnownEntity("shopee", "Shopee")
  const text5 = "saya pergi ke shopee dan shop"
  const { protectedText: p5, entities: e5 } = protectKnownEntities(text5)
  assert(p5 === "saya pergi ke zzentityz0zz dan zzentityz1zz", `Expected p5, got ${p5}`)
  assert(e5[0] === "Shopee" && e5[1] === "Shop", "Expected Shopee first then Shop in entities")
  const r5 = restoreKnownEntities(p5.toLowerCase(), e5)
  assert(r5 === "saya pergi ke Shopee dan Shop", `Expected restored r5, got ${r5}`)
  console.log("✓ Test 5 passed (Multiple entities & precedence)")

  // Test 6: Word boundary check
  localStorage.clear()
  addKnownEntity("ok", "OK")
  const text6 = "saya beli di toko ok hari ini"
  const { protectedText: p6, entities: e6 } = protectKnownEntities(text6)
  assert(p6 === "saya beli di toko zzentityz0zz hari ini", `Expected p6, got ${p6}`)
  const r6 = restoreKnownEntities(p6, e6)
  assert(r6 === "saya beli di toko OK hari ini", `Expected restored r6, got ${r6}`)
  console.log("✓ Test 6 passed (Word boundary check)")

  console.log("All known-entities tests passed successfully!")
}

runTests()
