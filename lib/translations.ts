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
    charCount: "karakter",
    
    // Buttons
    processButton: "Proses",
    flatTextButton: "Teks Datar",
    processingButton: "Memproses...",
    copyButton: "salin",
    editButton: "edit ulang",
    clearButton: "bersihkan",
    pasteButton: "tempel",
    insertPromptButton: "Insert Prompt",
    promptCopied: "Tersalin!",
    
    // Status
    statusReady: "siap",
    statusProcessing: "memproses...",
    statusDone: "selesai",
    statusCopied: "tersalin ke clipboard",
    statusMoved: "teks dipindah ke input",
    statusEmptyInput: "input kosong",
    statusCopyFailed: "gagal menyalin",
    statusError: "Terjadi kesalahan",
    statusNoFilter: "Tidak ada filter atau format yang dipilih",
    
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

    // Mode
    modeLabel: "Mode Transkripsi",
    biasaTitle: "Mode Biasa",
    biasaDesc: "Koreksi tanda baca & EYD standar tanpa metode backslash.",
    v1Title: "V1 — Standar",
    v1Desc: "Proses langsung. Cepat, tanpa validasi tambahan.",
    v2Title: "V2.2 — Beta",
    v2Desc: "Proses + validasi + algorithmic fixer otomatis. Lebih akurat, sedikit lebih lambat.",
    v3Title: "Filter Custom",
    v3Desc: "Hapus elemen tertentu atau ubah format teks secara manual.",
    tagAnnotator: "[Recommended for Annotator]",
    tagQC: "[Recommended for QC]",
    tagLessRecommended: "[Less Recommended for Annotation]",
    tagRecommended: "[Recommended for Annotation]",

    // Filters
    filterLabel: "Filter",
    filterPlaceholder: "Ketik karakter atau kata yang ingin dihapus, pisahkan dengan spasi",
    replaceLabel: "Ganti dengan",
    replacePlaceholder: "Kosongkan untuk menghapus",
    caseSensitiveLabel: "Case Sensitive (perhatikan huruf besar/kecil)",
    caseLabel: "Format Huruf",
    caseNone: "(tidak ada)",
    caseSentence: "Sentence case",
    caseLower: "lowercase",
    caseUpper: "UPPERCASE",
    caseCapital: "Capitalize Each Word",
    caseToggle: "tOGGLE cASE",

    // Tutorial Popup
    tutorialTitle: "Cara pakai metode Backslash",
    tutorialBody: "Mode ini menggunakan tanda \\ sebagai penanda jeda suara.\n\nKetik atau paste transkripsi, lalu tambahkan \\ di setiap posisi jeda — titik, koma, tanda tanya, atau seru akan ditentukan otomatis oleh AI.\n\nContoh:\nInput: gue lagi di warung\\ mau beli nasi uduk\\ abis deh\\\nOutput: Gue lagi di warung, mau beli nasi uduk. Abis deh.",
    tutorialButton: "Mengerti",

    v2BadgeProcessing: "memproses...",
    v2BadgeValid: "✓ valid",
    v2BadgeFixed_ai: "✓ difix AI",
    v2BadgeFixed_algo: "✓ difix otomatis",
    v2BadgeFixed_warning: "⚠ difix otomatis · cek kata",
    v2BadgeError: "✗ perlu review",
    v2FixerTitle: "Perubahan oleh fixer",
    v2Warning: "Peringatan: jumlah kata berubah. Hasil perlu dicek ulang.",
    v2MissingWords: "⚠ Beberapa kata dari input hilang/berubah.",
    footerSignature: "for AIT from Fadhil Ghifarion 法迪",

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
    charCount: "characters",
    
    // Buttons
    processButton: "Process",
    flatTextButton: "Flat Text",
    processingButton: "Processing...",
    copyButton: "copy",
    editButton: "edit again",
    clearButton: "clear",
    pasteButton: "paste",
    insertPromptButton: "Insert Prompt",
    promptCopied: "Copied!",
    
    // Status
    statusReady: "ready",
    statusProcessing: "processing...",
    statusDone: "done",
    statusCopied: "copied to clipboard",
    statusMoved: "text moved to input",
    statusEmptyInput: "input is empty",
    statusCopyFailed: "failed to copy",
    statusError: "An error occurred",
    statusNoFilter: "No filter or format selected",
    
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

    // Mode
    modeLabel: "Transcription Mode",
    biasaTitle: "Normal Mode",
    biasaDesc: "Standard punctuation & grammar correction without backslash method.",
    v1Title: "V1 — Standard",
    v1Desc: "Direct process. Fast, no additional validation.",
    v2Title: "V2.2 — Beta",
    v2Desc: "Process + validation + automatic algorithmic fixer. More accurate, slightly slower.",
    v3Title: "Custom Filter",
    v3Desc: "Remove specific elements or change text format manually.",
    tagAnnotator: "[Recommended for Annotator]",
    tagQC: "[Recommended for QC]",
    tagLessRecommended: "[Less Recommended for Annotation]",
    tagRecommended: "[Recommended for Annotation]",

    // Filters
    filterLabel: "Filter",
    filterPlaceholder: "Type characters or words to remove, separated by spaces",
    replaceLabel: "Replace with",
    replacePlaceholder: "Leave empty to remove",
    caseSensitiveLabel: "Case Sensitive",
    caseLabel: "Letter Format",
    caseNone: "(none)",
    caseSentence: "Sentence case",
    caseLower: "lowercase",
    caseUpper: "UPPERCASE",
    caseCapital: "Capitalize Each Word",
    caseToggle: "tOGGLE cASE",

    // Tutorial Popup
    tutorialTitle: "How to use the Backslash method",
    tutorialBody: "This mode uses the \\ sign as a voice pause marker.\n\nType or paste the transcription, then add \\ at each pause position — periods, commas, question marks, or exclamation points will be automatically determined by the AI.\n\nExample:\nInput: i'm at the shop\\ want to buy breakfast\\ it's gone\\\nOutput: I'm at the shop, want to buy breakfast. It's gone.",
    tutorialButton: "Understood",

    v2BadgeProcessing: "processing...",
    v2BadgeValid: "✓ valid",
    v2BadgeFixed_ai: "✓ fixed (AI)",
    v2BadgeFixed_algo: "✓ fixed (algo)",
    v2BadgeFixed_warning: "⚠ fixed (algo) · check words",
    v2BadgeError: "✗ needs review",
    v2FixerTitle: "Changes by fixer",
    v2Warning: "Warning: word count changed. Result may need manual check.",
    v2MissingWords: "⚠ Some words from input are missing/changed.",
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
    charCount: "字符",
    
    // Buttons
    processButton: "处理",
    flatTextButton: "平展文本",
    processingButton: "处理中...",
    copyButton: "复制",
    editButton: "重新编辑",
    clearButton: "清除",
    pasteButton: "粘贴",
    insertPromptButton: "插入提示词",
    promptCopied: "已复制！",
    
    // Status
    statusReady: "就绪",
    statusProcessing: "处理中...",
    statusDone: "完成",
    statusCopied: "已复制到剪贴板",
    statusMoved: "文本已移至输入框",
    statusEmptyInput: "输入为空",
    statusCopyFailed: "复制失败",
    statusError: "发生错误",
    statusNoFilter: "未选择过滤器或格式",
    
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

    // Mode
    modeLabel: "转录模式",
    biasaTitle: "普通模式",
    biasaDesc: "标准标点和语法纠正，不使用反斜杠方法。",
    v1Title: "V1 — 标准",
    v1Desc: "直接处理。快速，无需额外验证。",
    v2Title: "V2.2 — Beta",
    v2Desc: "处理 + 验证 + 自动算法修复。更准确，速度稍慢。",
    v3Title: "自定义过滤器",
    v3Desc: "手动删除特定元素或更改文本格式。",
    tagAnnotator: "[Recommended for Annotator]",
    tagQC: "[Recommended for QC]",
    tagLessRecommended: "[Less Recommended for Annotation]",
    tagRecommended: "[Recommended for Annotation]",

    // Filters
    filterLabel: "过滤",
    filterPlaceholder: "输入要删除的字符或单词，用空格分隔",
    replaceLabel: "替换为",
    replacePlaceholder: "留空表示删除",
    caseSensitiveLabel: "区分大小写",
    caseLabel: "字母格式",
    caseNone: "（无）",
    caseSentence: "句子大小写",
    caseLower: "小写",
    caseUpper: "大写",
    caseCapital: "每个单词首字母大写",
    caseToggle: "反转大小写",

    // Tutorial Popup
    tutorialTitle: "如何使用反斜杠方法",
    tutorialBody: "此模式使用 \\ 符号作为语音停顿标记。\n\n输入或粘贴转录内容，然后在每个停顿位置添加 \\ — 句号、逗号、问号或感叹号将由 AI 自动确定。\n\n示例：\n输入：我在店里\\ 想买早餐\\ 卖完了\\\n输出：我在店里，想买早餐。卖完了。",
    tutorialButton: "明白了",

    v2BadgeProcessing: "处理中...",
    v2BadgeValid: "✓ 有效",
    v2BadgeFixed_ai: "✓ AI 修复",
    v2BadgeFixed_algo: "✓ 自动修复",
    v2BadgeFixed_warning: "⚠ 自动修复 · 检查字数",
    v2BadgeError: "✗ 需要审核",
    v2FixerTitle: "修复程序所做的更改",
    v2Warning: "警告：字数已更改。结果可能需要手动检查。",
    v2MissingWords: "⚠ 输入中的某些单词缺失/已更改。",
    footerSignature: "for AIT from Fadhil Ghifarion 法迪",

    // Footer
    footerInstructions: "使用方法：输入转录内容 → 用",
    footerInstructionsSuffix: "标记停顿 → 点击处理",
    footerPoweredBy: "免费。限制时请切换模型。",
  },
} as const

export type TranslationKey = keyof typeof translations.id
