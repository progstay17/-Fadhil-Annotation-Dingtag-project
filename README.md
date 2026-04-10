# Transkripsi Tool

Aplikasi web untuk memperbaiki tanda baca dan EYD (Ejaan Yang Disempurnakan) secara otomatis menggunakan AI. Dibangun dengan Next.js dan Groq AI.

## Fitur

- Perbaikan tanda baca otomatis
- Koreksi EYD (Ejaan Yang Disempurnakan)
- Antarmuka yang simpel dan responsif
- Powered by Groq AI (LLaMA 3.3 70B)

## Tech Stack

- **Framework:** Next.js 16
- **AI:** Groq AI dengan AI SDK
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui

---

## Cara Deploy ke Vercel

### Langkah 1: Fork atau Clone Repository

```bash
git clone https://github.com/progstay17/-Fadhil-Annotation-Dingtag-project.git
cd -Fadhil-Annotation-Dingtag-project
```

### Langkah 2: Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login
2. Klik **"Add New..."** > **"Project"**
3. Pilih repository `-Fadhil-Annotation-Dingtag-project` dari daftar GitHub
4. Klik **"Deploy"**

### Langkah 3: Setup Groq API Key

Setelah deploy selesai, Anda perlu menambahkan Groq API Key:

1. Buka [console.groq.com](https://console.groq.com) dan buat akun (gratis)
2. Buat API Key baru di menu **"API Keys"**
3. Copy API Key yang sudah dibuat

Di Vercel:

1. Buka project Anda di Vercel Dashboard
2. Pergi ke **Settings** > **Environment Variables**
3. Tambahkan variable baru:
   - **Key:** `GROQ_API_KEY`
   - **Value:** (paste API key dari Groq)
4. Klik **"Save"**
5. **Redeploy** project agar environment variable aktif:
   - Pergi ke tab **Deployments**
   - Klik **"..."** pada deployment terbaru
   - Pilih **"Redeploy"**

---

## Menggunakan v0.dev (Alternatif)

Jika Anda ingin mengedit project ini menggunakan [v0.dev](https://v0.dev):

### Langkah 1: Import Project

1. Buka [v0.dev](https://v0.dev)
2. Klik **"Import from GitHub"**
3. Pilih repository ini

### Langkah 2: Connect Groq Integration

1. Di v0, klik tombol **Settings** (ikon gear di pojok kanan atas)
2. Pergi ke bagian **"Integrations"** atau **"Settings"**
3. Cari **"Groq"** dan klik **"Connect"**
4. Ikuti instruksi untuk menghubungkan akun Groq Anda
5. API Key akan otomatis tersedia di project

### Langkah 3: Merge Pull Request

Setelah melakukan perubahan di v0:

1. v0 akan otomatis membuat branch baru (contoh: `v0/progstay17-xxxxx`)
2. Klik tombol **Settings** > **Git**
3. Klik **"Create Pull Request"** untuk membuat PR ke GitHub
4. Di GitHub, review perubahan dan klik **"Merge Pull Request"**
5. Pilih **"Confirm Merge"**

---

## Development Lokal

```bash
# Install dependencies
pnpm install

# Buat file .env.local
echo "GROQ_API_KEY=your_api_key_here" > .env.local

# Jalankan development server
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Environment Variables

| Variable | Deskripsi | Wajib |
|----------|-----------|-------|
| `GROQ_API_KEY` | API Key dari console.groq.com | Ya |

---

## Troubleshooting

### Error: "Groq API key is missing"

1. Pastikan `GROQ_API_KEY` sudah ditambahkan di Environment Variables
2. Pastikan sudah redeploy setelah menambahkan environment variable
3. Cek apakah API Key valid di [console.groq.com](https://console.groq.com)

### Error 500 saat transcribe

1. Cek apakah API Key sudah benar
2. Pastikan akun Groq masih aktif dan memiliki quota
3. Coba generate API Key baru jika masih error

---

## License

MIT
