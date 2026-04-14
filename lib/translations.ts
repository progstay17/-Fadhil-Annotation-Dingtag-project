export type Language = "id" | "en" | "zh"

export const translations = {
  id: {
    // Header
    appName: "DingTag Annotation tool",
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
    flatTextButton: "Flat Teks",
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
    modelGoogle: "Google Gemini (Gratis & Cepat)",
    modelAiml: "Gemma 3 (AIML API)",
    modelOpenRouter: "Llama 3.3 (OpenRouter Free)",

    // V2.1 Mode
    modeLabel: "Mode Transkripsi",
    v1Title: "V1 — Standar",
    v1Desc: "Proses langsung. Cepat, tanpa validasi tambahan.",
    v2Title: "V2.1 — Beta",
    v2Desc: "Proses + validasi + algorithmic fixer otomatis. Lebih akurat, sedikit lebih lambat.",
    v2BadgeProcessing: "memproses...",
    v2BadgeValid: "✓ valid",
    v2BadgeFixedAI: "✓ difix AI",
    v2BadgeFixedAlgo: "✓ difix otomatis",
    v2BadgeWarning: "⚠ difix otomatis · cek kata",
    v2BadgeError: "✗ perlu review",
    v2FixerTitle: "Perubahan oleh fixer",
    v2Warning: "Peringatan: jumlah kata berubah. Hasil perlu dicek ulang.",
    footerSignature: "untuk AIT dari Fadhil Ghifarion 法迪",

    // Footer
    footerInstructions: "cara pakai: ketik transkripsi → tandai jeda suara dengan",
    footerInstructionsSuffix: "→ klik proses",
    footerPoweredBy: "gratis. ganti model jika limit.",
  },
  en: {
    // Header
    appName: "DingTag Annotation tool",
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
    flatTextButton: "Flat Text",
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
    modelGoogle: "Google Gemini (Free & Fast)",
    modelAiml: "Gemma 3 (AIML API)",
    modelOpenRouter: "Llama 3.3 (OpenRouter Free)",

    // V2.1 Mode
    modeLabel: "Transcription Mode",
    v1Title: "V1 — Standard",
    v1Desc: "Direct process. Fast, no additional validation.",
    v2Title: "V2.1 — Beta",
    v2Desc: "Process + validation + automatic algorithmic fixer. More accurate, slightly slower.",
    v2BadgeProcessing: "processing...",
    v2BadgeValid: "✓ valid",
    v2BadgeFixedAI: "✓ fixed (AI)",
    v2BadgeFixedAlgo: "✓ fixed (algo)",
    v2BadgeWarning: "⚠ fixed (algo) · check words",
    v2BadgeError: "✗ needs review",
    v2FixerTitle: "Changes by fixer",
    v2Warning: "Warning: word count changed. Result may need manual check.",
    footerSignature: "for AIT from Fadhil Ghifarion 法迪",

    // Footer
    footerInstructions: "how to use: type transcription → mark pauses with",
    footerInstructionsSuffix: "→ click process",
    footerPoweredBy: "free. switch model if limited.",
  },
  zh: {
    // Header
    appName: "DingTag Annotation tool",
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
    flatTextButton: "平展文本",
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
    modelGoogle: "Google Gemini (免费且快速)",
    modelAiml: "Gemma 3 (AIML API)",
    modelOpenRouter: "Llama 3.3 (OpenRouter Free)",

    // V2.1 Mode
    modeLabel: "转录模式",
    v1Title: "V1 — 标准",
    v1Desc: "直接处理。快速，无需额外验证。",
    v2Title: "V2.1 — Beta",
    v2Desc: "处理 + 验证 + 自动算法修复。更准确，速度稍慢。",
    v2BadgeProcessing: "处理中...",
    v2BadgeValid: "✓ 有效",
    v2BadgeFixedAI: "✓ AI 修复",
    v2BadgeFixedAlgo: "✓ 自动修复",
    v2BadgeWarning: "⚠ 自动修复 · 检查字数",
    v2BadgeError: "✗ 需要审核",
    v2FixerTitle: "修复程序所做的更改",
    v2Warning: "警告：字数已更改。结果可能需要手动检查。",
    footerSignature: "Fadhil Ghifarion 法迪 为 AIT 提供",

    // Footer
    footerInstructions: "使用方法：输入转录内容 → 用",
    footerInstructionsSuffix: "标记停顿 → 点击处理",
    footerPoweredBy: "免费。限制时请切换模型。",
  },
} as const

export type TranslationKey = keyof typeof translations.id
