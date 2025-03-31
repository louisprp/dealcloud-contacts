# 🤖 AI Contact Creator for DealCloud

A Next.js 15 web app for effortlessly transforming raw, unstructured contact lists into clean, structured contacts ready for import into DealCloud CRM — powered by Google Gemini 2.0 Flash Lite and the Vercel AI SDK.

## ✨ Features

- ⚡️ Paste in unstructured contact info (from Excel, Notepad, etc.)
- 🧠 Google Gemini 2.0 Flash Lite extracts relevant company names
- 🔍 Automatically fetches DealCloud company IDs
- 🧬 AI parses and structures contact details:
  - First Name / Last Name
  - Gender
  - Email
  - Phone
  - Contact Type & Job Title
  - Employer
- 🔁 Checks for duplicate contacts in your CRM
- ✅ Provides a diff-style preview before insertion
- 📬 Seamlessly inserts only new, clean contact records into DealCloud

## 🛠️ Tech Stack

| Tech | Description |
|------|-------------|
| [Next.js 15 (App Router)](https://nextjs.org/docs) | React framework for server-rendered apps |
| [Tailwind CSS 4.0](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible and beautiful UI components |
| [Vercel AI SDK](https://sdk.vercel.ai/docs) | Handles LLM interactions |
| [Google Gemini 2.0 Flash Lite](https://deepmind.google/technologies/gemini/) | Powers AI contact parsing |
| [TanStack Table](https://tanstack.com/table) | Powerful data table rendering |

---

## 📹 Demo

> 🎥 _A short demo video..._

https://github.com/user-attachments/assets/0b069945-1282-4d94-824c-785bcde66b3d

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/dealcloud-ai-contact-creator.git
cd dealcloud-ai-contact-creator
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
DEALCLOUD_SITE=your_site_key_here
DEALCLOUD_CLIENT_ID=your_client_id_here
DEALCLOUD_CLIENT_SECRET=your_client_secret_here
```

> 🔐 Make sure not to commit sensitive API keys.

### 4. Run the App

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🧪 How It Works

1. **Paste Your Data**  
   Drop in a messy list of contact info.

2. **AI Parsing**  
   Gemini extracts structured fields and identifies company names.

3. **Company Resolution**  
   Fetches internal DealCloud company IDs using the company names.

4. **Contact Generation**  
   Fills in all required contact fields. Infers missing ones when possible.

5. **Duplication Check**  
   Existing contacts are filtered out to avoid duplication.

6. **Review & Confirm**  
   See a diff-style preview of new contacts to be created.

7. **Insert**  
   Clean, deduplicated contacts are inserted into DealCloud.

---

## 📄 License

MIT © louisprp
