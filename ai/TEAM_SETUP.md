# Dwarik Door AI Setup for Teammates

Welcome! We use **Graphify** to maintain a persistent knowledge graph of our codebase. This makes our AI tools (like Gemini or Cursor) significantly faster and smarter.

## Zero-Setup Workflow

Good news! We automated everything. You do not need to install anything manually.

Just run your dev server as usual:
```bash
npm run dev
```

**What happens automatically:**
1. The first time you run this, it will quietly create a Python virtual environment (`.graphify-env`) and install Graphify for you.
2. It will parse the codebase and update the local graph incrementally.
3. Your Next.js dev server starts normally.

*That's it! The local AI graph will automatically stay updated on your machine as you write code.*

---

## (Optional) Advanced AI Features

If you ever add massive new architectural folders and want the AI to generate deep semantic connections using LLMs, you will need a Gemini API key.

1. Copy `.env.example` to `.env.local`.
2. Add your `GEMINI_API_KEY`.
3. Run `npm run graphify` manually while passing the API key (or use the `run_graphify.command` script). 

For 99% of your daily work, you never need an API key. `npm run dev` handles the structural updates perfectly for free.
