import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { createOpenAI } from "@ai-sdk/openai"
import { calculateScoring } from "@/lib/scoring"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

const PROMPT_SYSTEM = `Kamu adalah editor transkripsi audio profesional.

TUGASMU HANYA DUA:
1. Ganti setiap tanda \\ dengan tanda baca yang tepat: . , ! atau ?
2. Perbaiki EYD: huruf kapital awal kalimat, nama orang/tempat, ejaan baku

ATURAN KERAS — TIDAK BOLEH DILANGGAR:
- DILARANG mengubah, menambah, memindahkan, atau menghapus kata apapun
- DILARANG mengubah tanda baca selain \\
- Setiap \\ WAJIB diganti dengan salah satu dari: . , ! ? — tidak boleh dihapus atau dibiarkan
- Jika ragu antara . / ! / ?, pilih titik (.)
- Output hanya teks hasil, TANPA penjelasan, TANPA komentar apapun

CONTOH:
Input:  aku lapar\\ mau makan\\ kamu mau ikut\\
Output: Aku lapar, mau makan. Kamu mau ikut?`

type Provider = "groq" | "openrouter"

const MODELS = {
  groq: "llama-3.3-70b-versatile",
  openrouter: "meta-llama/llama-3.3-70b-instruct:free",
} as const

export async function POST(request: Request) {
  try {
    const { text, provider = "groq" } = await request.json() as { text: string; provider?: Provider }

    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "Input teks diperlukan" },
        { status: 400 }
      )
    }

    // Validate API Keys
    if (provider === "openrouter" && !process.env.OPENROUTER_API_KEY) {
      return Response.json(
        { error: "OpenRouter API Key belum dikonfigurasi" },
        { status: 500 }
      )
    }

    if (provider === "groq" && !process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "Groq API Key belum dikonfigurasi" },
        { status: 500 }
      )
    }

    // Select model based on provider
    const model = provider === "openrouter" 
      ? openrouter(MODELS.openrouter)
      : groq(MODELS.groq)

    const { text: result } = await generateText({
      model,
      system: PROMPT_SYSTEM,
      prompt: text,
      maxOutputTokens: 1000,
      temperature: 0.1,
    })

    const trimmedResult = result.trim() || "(tidak ada hasil)"
    const scoring = calculateScoring(text, trimmedResult)

    return Response.json({
      result: trimmedResult,
      scoring
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan"
    
    // Check for rate limit error
    if (message.toLowerCase().includes("rate limit") || message.includes("429")) {
      return Response.json({ 
        error: "Rate limit tercapai. Coba ganti model atau tunggu beberapa menit.",
        isRateLimit: true 
      }, { status: 429 })
    }
    
    return Response.json({ error: message }, { status: 500 })
  }
}
