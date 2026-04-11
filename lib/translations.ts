export type Language = "id" | "en" | "zh"

export const translations = {
  id: {
    // Header
    appName: "// transkripsi.tool",
    tagline: "tanda baca + EYD otomatis",
    
    // Form
    inputLabel: "input",
    inputHint: "gunakan",
    inputHintSuffix: "sebagai penanda jeda suara",
    inputPlaceholder: "mbaknya bilang akun dananya kena freeze\\ lah gimana coba gue...",
    outputLabel: "hasil",
    outputPlaceholder: "hasil akan muncul di sini...",
    
    // Buttons
    processButton: "Proses",
    processingButton: "Memproses...",
    copyButton: "salin",
    editButton: "edit ulang",
    clearButton: "bersihkan",
    
    // Status
    statusReady: "siap",
    statusProcessing: "memproses...",
    statusDone: "selesai",
    statusCopied: "tersalin ke clipboard",
    statusMoved: "teks dipindah ke input",
    statusEmptyInput: "input kosong",
    statusCopyFailed: "gagal menyalin",
    statusError: "Terjadi kesalahan",
    
    // Scoring
    accuracyScore: "Skor Akurasi",
    showDiff: "Lihat Detail Perbedaan",
    perfectScore: "Sempurna!",
    goodScore: "Bagus, periksa sedikit.",
    lowScore: "Banyak ketidaksesuaian.",

    // Model selector
    modelLabel: "model",
    modelGroq: "Groq (Llama 3.3)",
    modelGoogle: "Google Gemini (Fast & Stable)",
    modelAIML: "AIML API (Gemma 3 4B)",
    
    // Footer
    footerInstructions: "cara pakai: ketik transkripsi → tandai jeda suara dengan",
    footerInstructionsSuffix: "→ klik proses",
    footerPoweredBy: "gratis. ganti model jika limit.",
  },
  en: {
    // Header
    appName: "// transcription.tool",
    tagline: "auto punctuation + grammar",
    
    // Form
    inputLabel: "input",
    inputHint: "use",
    inputHintSuffix: "as pause marker",
    inputPlaceholder: "she said the account got frozen\\ so what am I supposed to do now...",
    outputLabel: "result",
    outputPlaceholder: "result will appear here...",
    
    // Buttons
    processButton: "Process",
    processingButton: "Processing...",
    copyButton: "copy",
    editButton: "edit again",
    clearButton: "clear",
    
    // Status
    statusReady: "ready",
    statusProcessing: "processing...",
    statusDone: "done",
    statusCopied: "copied to clipboard",
    statusMoved: "text moved to input",
    statusEmptyInput: "input is empty",
    statusCopyFailed: "failed to copy",
    statusError: "An error occurred",
    
    // Scoring
    accuracyScore: "Accuracy Score",
    showDiff: "Show Diff Details",
    perfectScore: "Perfect!",
    goodScore: "Good, check slightly.",
    lowScore: "Many inconsistencies.",

    // Model selector
    modelLabel: "model",
    modelGroq: "Groq (Llama 3.3)",
    modelGoogle: "Google Gemini (Fast & Stable)",
    modelAIML: "AIML API (Gemma 3 4B)",
    
    // Footer
    footerInstructions: "how to use: type transcription → mark pauses with",
    footerInstructionsSuffix: "→ click process",
    footerPoweredBy: "free. switch model if limited.",
  },
  zh: {
    // Header
    appName: "// 转录工具",
    tagline: "自动标点 + 语法校正",
    
    // Form
    inputLabel: "输入",
    inputHint: "使用",
    inputHintSuffix: "作为停顿标记",
    inputPlaceholder: "她说账户被冻结了\\ 那我现在该怎么办...",
    outputLabel: "结果",
    outputPlaceholder: "结果将显示在这里...",
    
    // Buttons
    processButton: "处理",
    processingButton: "处理中...",
    copyButton: "复制",
    editButton: "重新编辑",
    clearButton: "清除",
    
    // Status
    statusReady: "就绪",
    statusProcessing: "处理中...",
    statusDone: "完成",
    statusCopied: "已复制到剪贴板",
    statusMoved: "文本已移至输入框",
    statusEmptyInput: "输入为空",
    statusCopyFailed: "复制失败",
    statusError: "发生错误",
    
    // Scoring
    accuracyScore: "准确率得分",
    showDiff: "显示差异细节",
    perfectScore: "完美！",
    goodScore: "不错，稍作检查。",
    lowScore: "存在较多不一致。",

    // Model selector
    modelLabel: "模型",
    modelGroq: "Groq (Llama 3.3)",
    modelGoogle: "Google Gemini (快速且稳定)",
    modelAIML: "AIML API (Gemma 3 4B)",
    
    // Footer
    footerInstructions: "使用方法：输入转录内容 → 用",
    footerInstructionsSuffix: "标记停顿 → 点击处理",
    footerPoweredBy: "免费。限制时请切换模型。",
  },
} as const

export type TranslationKey = keyof typeof translations.id
