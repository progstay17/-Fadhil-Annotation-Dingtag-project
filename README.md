# DingTag Annotation Tool

Fast Text Processing for Annotation & QC

---

## 🇮🇩 Bahasa Indonesia

### Deskripsi
**Fast Text Processing for Annotation & QC**
Alat bantu pemrosesan teks cepat untuk kebutuhan anotasi dan Quality Control (QC) transkripsi audio.

### Pratinjau
![Preview](./preview.gif)
*Screenshot/GIF wajib diisi*

### Fitur Utama
- **Multi-mode processing:** Mendukung berbagai mode (V1, V2, Mode Biasa, Filter Custom).
- **Built-in fixer logic:** Perbaikan otomatis untuk tanda baca dan ejaan.
- **Flat text cleaner:** Membersihkan teks dari format, simbol, dan tanda baca.
- **Real-time duplicate detection:** Deteksi kata berulang secara instan.
- **Token-based editing:** Edit kata per token dengan mudah.
- **Dark/light mode:** Dukungan mode gelap dan terang yang nyaman.
- **QRIS payment support:** Dukungan donasi melalui QRIS.

### Penjelasan Mode
- **Mode Biasa:** Fleksibel, tanpa perlu prompt manual, proses lebih cepat.
- **V1:** Pemrosesan anotasi dasar (basic).
- **V2:** Fitur fixer tingkat lanjut dengan deteksi flag/masalah.
- **Filter Custom:** Berbasis aturan (rule-based) sepenuhnya, tanpa AI.

### Alur Kerja (Workflow)
Input → Pemilihan Mode → Proses → Output → Submit

### Kasus Penggunaan (Use Cases)
- Anotasi Audio
- Quality Control (QC)
- Batch Text Editing

### Memulai (Getting Started)

#### Persyaratan
- Node.js (Versi terbaru direkomendasikan)
- npm / pnpm / yarn

#### Instalasi & Deploy

```bash
# Clone
git clone https://github.com/progstay17/-Fadhil-Annotation-Dingtag-project.git
cd -Fadhil-Annotation-Dingtag-project

# Install dependencies
npm install

# Setup environment
# Buat file .env dan masukkan API Key Anda (GEMINI_API_KEY, GROQ_API_KEY, dll)

# Run development
npm run dev

# Build
npm run build

# Deploy (Vercel)
npx vercel deploy
```

### Dokumentasi API

#### POST `/api/transcribe`
Deskripsi: Memproses teks berdasarkan mode dan provider yang dipilih.
**Request Body:**
```json
{
  "text": "string",
  "provider": "google | groq | aiml | openrouter",
  "systemPrompt": "string (opsional)"
}
```
**Response:**
```json
{
  "result": "teks hasil pemrosesan",
  "scoring": { ... }
}
```

### Roadmap
- Peningkatan UI/UX
- Optimalisasi performa
- Ekspansi fitur baru

### Kontribusi
Kontribusi selalu terbuka! Silakan buka Issue atau Pull Request.

### Lisensi
MIT

---

## 🇬🇧 English

### Description
**Fast Text Processing for Annotation & QC**
A fast text processing tool for audio transcription annotation and Quality Control (QC) needs.

### Preview
![Preview](./preview.gif)
*Screenshot/GIF required*

### Key Features
- **Multi-mode processing:** Supports various modes (V1, V2, Normal Mode, Custom Filter).
- **Built-in fixer logic:** Automatic correction for punctuation and spelling.
- **Flat text cleaner:** Cleans text from formatting, symbols, and punctuation.
- **Real-time duplicate detection:** Instant detection of repeated words.
- **Token-based editing:** Easily edit words per token.
- **Dark/light mode:** Comfortable dark and light mode support.
- **QRIS payment support:** Support for donations via QRIS.

### Modes Explanation
- **Normal Mode:** Flexible, no manual prompt needed, faster processing.
- **V1:** Basic annotation processing.
- **V2:** Advanced fixer with flag/issue detection.
- **Custom Filter:** Fully rule-based, no AI.

### Workflow
Input → Mode Selection → Process → Output → Submit

### Use Cases
- Audio Annotation
- Quality Control (QC)
- Batch Text Editing

### Getting Started

#### Requirements
- Node.js (Latest version recommended)
- npm / pnpm / yarn

#### Installation & Deployment

```bash
# Clone
git clone https://github.com/progstay17/-Fadhil-Annotation-Dingtag-project.git
cd -Fadhil-Annotation-Dingtag-project

# Install dependencies
npm install

# Setup environment
# Create a .env file and add your API Keys (GEMINI_API_KEY, GROQ_API_KEY, etc.)

# Run development
npm run dev

# Build
npm run build

# Deploy (Vercel)
npx vercel deploy
```

### API Documentation

#### POST `/api/transcribe`
Description: Processes text based on the selected mode and provider.
**Request Body:**
```json
{
  "text": "string",
  "provider": "google | groq | aiml | openrouter",
  "systemPrompt": "string (optional)"
}
```
**Response:**
```json
{
  "result": "processed text result",
  "scoring": { ... }
}
```

### Roadmap
- UI/UX improvements
- Performance optimization
- Feature expansion

### Contributing
Contributions are always welcome! Please open an Issue or Pull Request.

### License
MIT

---

## 🇨🇳 中文 (Mandarin)

### 描述
**用于标注和质检的高效文本处理**
专为音频转录标注和质量控制 (QC) 需求设计的高效文本处理工具。

### 预览
![Preview](./preview.gif)
*必须包含截图或 GIF*

### 主要功能
- **多模式处理：** 支持多种模式（V1、V2、普通模式、自定义过滤器）。
- **内置修复逻辑：** 自动纠正标点符号和拼写。
- **平展文本清洗：** 清除文本中的格式、符号和标点。
- **实时重复检测：** 瞬间检测重复词汇。
- **基于 Token 的编辑：** 轻松按词编辑。
- **深色/浅色模式：** 舒适的深浅色界面支持。
- **QRIS 支付支持：** 支持通过 QRIS 进行捐赠。

### 模式说明
- **普通模式：** 灵活，无需手动提示词，处理速度更快。
- **V1：** 基础标注处理。
- **V2：** 带有标记/问题检测的高级修复功能。
- **自定义过滤器：** 完全基于规则，无需 AI。

### 工作流 (Workflow)
输入 → 模式选择 → 处理 → 输出 → 提交

### 应用场景
- 音频标注
- 质量控制 (QC)
- 批量文本编辑

### 入门指南 (Getting Started)

#### 环境要求
- Node.js (建议使用最新版本)
- npm / pnpm / yarn

#### 安装与部署 (Installation & Deployment)

```bash
# Clone
git clone https://github.com/progstay17/-Fadhil-Annotation-Dingtag-project.git
cd -Fadhil-Annotation-Dingtag-project

# Install dependencies
npm install

# Setup environment
# 创建 .env 文件并添加您的 API 密钥 (GEMINI_API_KEY, GROQ_API_KEY 等)

# Run development
npm run dev

# Build
npm run build

# Deploy (Vercel)
npx vercel deploy
```

### API 文档 (API Documentation)

#### POST `/api/transcribe`
描述：根据选择的模式和提供商处理文本。
**请求体 (Request Body)：**
```json
{
  "text": "string",
  "provider": "google | groq | aiml | openrouter",
  "systemPrompt": "string (可选)"
}
```
**响应 (Response)：**
```json
{
  "result": "处理后的文本结果",
  "scoring": { ... }
}
```

### 路线图 (Roadmap)
- UI/UX 改进
- 性能优化
- 功能扩展

### 贡献 (Contributing)
欢迎贡献！请提交 Issue 或 Pull Request。

### 许可证 (License)
MIT
