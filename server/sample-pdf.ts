// Simple sample PDF content generation
export function generateSamplePDFContent(): string {
  return `ChatPDF Sample Document

Introduction to AI-Powered Document Analysis

This is a sample document to demonstrate the capabilities of ChatPDF, an AI-powered system that allows you to have conversations with your documents.

What is ChatPDF?
ChatPDF is an innovative tool that combines the power of artificial intelligence with document processing to create an interactive experience. Users can upload PDF documents and ask questions about the content, receiving intelligent responses with citations.

Key Features:
1. Natural Language Processing: Ask questions in plain English
2. Contextual Understanding: The AI understands the document context
3. Citation Support: Responses include page references
4. Real-time Chat: Interactive conversation interface

How It Works:
When you upload a PDF document, the system:
- Extracts text content from the PDF
- Processes the text into manageable chunks
- Uses AI models to understand the content
- Provides intelligent responses to user questions

Benefits:
- Faster document review and analysis
- Enhanced comprehension through Q&A
- Easy access to specific information
- Improved productivity for research and study

Use Cases:
- Research paper analysis
- Legal document review
- Technical manual consultation
- Educational material study
- Business report analysis

Technical Implementation:
The system uses advanced natural language processing models from Hugging Face, specifically designed for question-answering tasks. The architecture includes:
- PDF text extraction
- Document chunking for context
- Vector search for relevant content
- AI-powered response generation

Getting Started:
To begin using ChatPDF, simply upload a PDF document and start asking questions. The AI will analyze the content and provide relevant, cited responses to help you understand and work with your documents more effectively.

This completes the sample document. Try asking questions about the content above to test the system's capabilities!`;
}