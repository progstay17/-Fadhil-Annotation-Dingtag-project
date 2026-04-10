import { TranscriptionForm } from "@/components/transcription-form"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-12">
      <header className="w-full max-w-3xl mb-10 flex items-baseline gap-3">
        <h1 className="font-mono text-lg font-medium text-primary tracking-tight">
          // transkripsi.tool
        </h1>
        <span className="font-mono text-xs text-muted-foreground">
          tanda baca + EYD otomatis
        </span>
      </header>

      <TranscriptionForm />
    </main>
  )
}
