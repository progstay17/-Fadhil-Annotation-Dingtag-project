import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { calculateScoring } from "@/lib/scoring"

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

type Provider = "groq" | "google" | "aimlapi"

const MODELS = {
  groq: "llama-3.3-70b-versatile",
  google: "gemini-2.5-flash",
  aimlapi: "google/gemma-3-4b-it",
} as const

export async function POST(request: Request) {
  try {
    const { text, provider = "google" } = await request.json() as { text: string; provider?: Provider }

    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "Input teks diperlukan" },
        { status: 400 }
      )
    }

    // Initialize provider and model based on request
    let model;

    if (provider === "google") {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (!apiKey || apiKey.includes("your_") || apiKey.includes("_here")) {
        return Response.json({ error: "Gemini API Key (GEMINI_API_KEY) belum dikonfigurasi." }, { status: 500 });
      }

      const google = createGoogleGenerativeAI({ apiKey });
      model = google(MODELS.google);
    } else if (provider === "aimlapi") {
      const apiKey = process.env.AIML_API_KEY;
      if (!apiKey || apiKey.includes("your_") || apiKey.includes("_here")) {
        return Response.json({ error: "AIML API Key belum dikonfigurasi." }, { status: 500 });
      }
      const aiml = createOpenAI({
        apiKey,
        baseURL: "https://api.aimlapi.com/v1",
      });
      model = aiml(MODELS.aimlapi);
    } else {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey || apiKey.includes("your_") || apiKey.includes("_here")) {
        return Response.json({ error: "Groq API Key belum dikonfigurasi." }, { status: 500 });
      }
      const groq = createGroq({ apiKey });
      model = groq(MODELS.groq);
    }

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
