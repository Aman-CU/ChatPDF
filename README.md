ChatPDF is a full‑stack document chat app that lets you upload PDFs and have AI-powered conversations about their content. It extracts text from PDFs, retrieves relevant context, and generates accurate, cited answers using Hugging Face Inference.

Features:
PDF upload, storage, and inline viewing
Chat interface with conversation history per document
AI answers with simple citation snippets
One-click sample document for quick demo

Tech Stack:
Server: Node.js, Express, TypeScript
AI: @huggingface/inference (Llama 3.1 8B Instruct)
Client: React, Vite, Tailwind
PDF: pdf-parse, react-pdf
ENV:
HUGGINGFACE_API_KEY (required)

Scripts:
Dev: npm run dev
Build: npm run build
Start: npm run start
