# Transcription Tool / 转录工具

A web application for automatically correcting punctuation and Indonesian spelling (EYD) using AI. Built with Next.js and Groq AI.

一个使用AI自动纠正标点符号和印尼语拼写（EYD）的网络应用程序。使用Next.js和Groq AI构建。

## Features / 功能

- Automatic punctuation correction / 自动标点符号纠正
- Indonesian spelling (EYD) correction / 印尼语拼写纠正
- Simple and responsive interface / 简洁响应式界面
- Powered by Groq AI (LLaMA 3.3 70B) / 由Groq AI驱动

## Tech Stack / 技术栈

- **Framework:** Next.js 16
- **AI:** Groq AI with AI SDK
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui

---

## Deploy to Vercel / 部署到Vercel

### Step 1: Fork or Clone Repository / 第一步：Fork或克隆仓库

```bash
git clone https://github.com/progstay17/-Fadhil-Annotation-Dingtag-project.git
cd -Fadhil-Annotation-Dingtag-project
```

### Step 2: Deploy to Vercel / 第二步：部署到Vercel

**English:**
1. Go to [vercel.com](https://vercel.com) and login
2. Click **"Add New..."** > **"Project"**
3. Select the `-Fadhil-Annotation-Dingtag-project` repository from your GitHub list
4. Click **"Deploy"**

**中文：**
1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New..."** > **"Project"**
3. 从GitHub列表中选择 `-Fadhil-Annotation-Dingtag-project` 仓库
4. 点击 **"Deploy"**

### Step 3: Setup API Keys / 第三步：设置API密钥

After deployment, you need to add the API Keys (Groq and/or OpenRouter):

部署完成后，您需要添加API密钥（Groq 和/或 OpenRouter）：

**Get API Keys / 获取API密钥：**
1. **Groq:** Go to [console.groq.com](https://console.groq.com)
2. **OpenRouter:** Go to [openrouter.ai](https://openrouter.ai/keys)
3. Create a new API Key in each respective dashboard and copy it.

   访问 [console.groq.com](https://console.groq.com) 或 [openrouter.ai](https://openrouter.ai/keys) 创建并复制新的API密钥。

**Add to Vercel / 添加到Vercel：**

1. Open your project in Vercel Dashboard / 在Vercel仪表板中打开您的项目
2. Go to **Settings** > **Environment Variables** / 进入 **Settings** > **Environment Variables**
3. Add the following variables / 添加以下变量：
   - **Key:** `GROQ_API_KEY` | **Value:** (your Groq key)
   - **Key:** `OPENROUTER_API_KEY` | **Value:** (your OpenRouter key)
4. Click **"Save"** for each / 为每个变量点击 **"Save"**
5. **Redeploy** the project to activate the environment variable / **重新部署**项目以激活环境变量：
   - Go to the **Deployments** tab / 进入 **Deployments** 标签
   - Click **"..."** on the latest deployment / 点击最新部署旁的 **"..."**
   - Select **"Redeploy"** / 选择 **"Redeploy"**

---

## Using v0.dev (Alternative) / 使用v0.dev（替代方案）

If you want to edit this project using [v0.dev](https://v0.dev):

如果您想使用 [v0.dev](https://v0.dev) 编辑此项目：

### Step 1: Import Project / 第一步：导入项目

1. Go to [v0.dev](https://v0.dev) / 访问 [v0.dev](https://v0.dev)
2. Click **"Import from GitHub"** / 点击 **"Import from GitHub"**
3. Select this repository / 选择此仓库

### Step 2: Connect Groq Integration / 第二步：连接Groq集成

1. In v0, click the **Settings** button (gear icon in the top right corner)
   
   在v0中，点击右上角的 **Settings** 按钮（齿轮图标）

2. Go to **"Settings"** section / 进入 **"Settings"** 部分

3. Find **"Groq"** and click **"Connect"**
   
   找到 **"Groq"** 并点击 **"Connect"**

4. Follow the instructions to connect your Groq account
   
   按照说明连接您的Groq账户

5. The API Key will be automatically available in the project
   
   API密钥将自动在项目中可用

### Step 3: Merge Pull Request / 第三步：合并Pull Request

After making changes in v0 / 在v0中进行更改后：

1. v0 will automatically create a new branch (e.g., `v0/progstay17-xxxxx`)
   
   v0将自动创建新分支（例如：`v0/progstay17-xxxxx`）

2. Click **Settings** > **Git** / 点击 **Settings** > **Git**

3. Click **"Create Pull Request"** to create a PR to GitHub
   
   点击 **"Create Pull Request"** 在GitHub上创建PR

4. In GitHub, review the changes and click **"Merge Pull Request"**
   
   在GitHub中，审查更改并点击 **"Merge Pull Request"**

5. Select **"Confirm Merge"** / 选择 **"Confirm Merge"**

---

## Local Development / 本地开发

```bash
# Install dependencies / 安装依赖
pnpm install

# Create .env.local file / 创建.env.local文件
# Add both keys if you want to use both providers
echo "GROQ_API_KEY=your_groq_key_here" > .env.local
echo "OPENROUTER_API_KEY=your_openrouter_key_here" >> .env.local

# Run development server / 运行开发服务器
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

---

## Environment Variables / 环境变量

| Variable | Description / 描述 | Required / 必需 |
|----------|-------------------|-----------------|
| `GROQ_API_KEY` | API Key from console.groq.com / 来自console.groq.com的API密钥 | Yes / 是 |
| `OPENROUTER_API_KEY` | API Key from openrouter.ai / 来自openrouter.ai的API密钥 | No / 否 (Optional) |

---

## Troubleshooting / 故障排除

### Error: "API key is missing" / 错误："API密钥缺失"

1. Make sure `GROQ_API_KEY` or `OPENROUTER_API_KEY` is added in Environment Variables.
   
   确保已在环境变量中添加 `GROQ_API_KEY` 或 `OPENROUTER_API_KEY`。

2. Make sure you redeploy after adding the environment variable.
   
   确保添加环境变量后重新部署。

3. Check if the API Key is valid at [console.groq.com](https://console.groq.com) or [openrouter.ai](https://openrouter.ai).
   
   在 [console.groq.com](https://console.groq.com) 或 [openrouter.ai](https://openrouter.ai) 检查API密钥是否有效。

### Error 500 when transcribing / 转录时出现错误500

1. Check if the API Key is correct / 检查API密钥是否正确
2. Make sure your Groq account is active and has quota / 确保Groq账户处于活动状态并有配额
3. Try generating a new API Key if the error persists / 如果错误持续，尝试生成新的API密钥

---

## License / 许可证

MIT
