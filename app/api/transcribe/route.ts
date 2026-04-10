import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
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

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "Input teks diperlukan" },
        { status: 400 }
      )
    }

    const { text: result } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: PROMPT_SYSTEM,
      prompt: text,
      maxOutputTokens: 1000,
      temperature: 0.1,
    })

    return Response.json({ result: result.trim() || "(tidak ada hasil)" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan"
    return Response.json({ error: message }, { status: 500 })
  }
}
