import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { pdfProcessor } from "./pdf-processor";
import { huggingFaceService } from "./huggingface";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { generateSamplePDFContent } from "./sample-pdf";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed') as any, false);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload PDF endpoint
  app.post("/api/documents/upload", upload.single('pdf'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file provided" });
      }

      console.log(`Processing PDF upload: ${req.file.originalname}`);
      
      const processedDoc = await pdfProcessor.processPDF(
        req.file.buffer,
        req.file.filename || `uploaded_${Date.now()}.pdf`,
        req.file.originalname
      );

      res.json({
        success: true,
        document: {
          id: processedDoc.id,
          filename: processedDoc.filename,
          originalName: processedDoc.originalName,
          pageCount: processedDoc.pageCount,
          uploadedAt: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error("PDF upload error:", error);
      res.status(500).json({ 
        error: "Failed to process PDF file",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json({ documents });
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get specific document
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json({ document });
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Serve PDF file by document ID
  app.get("/api/documents/:id/pdf", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document?.pdfData) {
        return res.status(404).json({ error: "PDF file not found" });
      }

      // Convert base64 string back to binary buffer
      const pdfBuffer = Buffer.from(document.pdfData, 'base64');

      // Set appropriate headers for PDF viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      // Send binary data as buffer
      res.end(pdfBuffer);
    } catch (error) {
      console.error("Error serving PDF:", error);
      res.status(500).json({ error: "Failed to serve PDF file" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteDocument(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Get chat messages for a document
  app.get("/api/documents/:id/messages", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const messages = await storage.getChatMessages(id);
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  // Send chat message
  app.post("/api/documents/:id/chat", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check if document exists
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      console.log(`Processing chat message for document ${id}: ${message}`);

      // Get relevant context from document
      const context = await pdfProcessor.getRelevantContext(id, message);
      
      // Get conversation history
      const chatHistory = await storage.getChatMessages(id);
      const conversationHistory = chatHistory.map(msg => [
        { role: 'user' as const, content: msg.message },
        { role: 'assistant' as const, content: msg.response }
      ]).flat();

      // Generate response using Hugging Face
      const llmResponse = await huggingFaceService.generateChatResponse(
        message,
        context,
        conversationHistory
      );

      // Save chat message
      const chatMessage = await storage.createChatMessage({
        documentId: id,
        message,
        response: llmResponse.response,
        citations: llmResponse.citations || [],
      });

      res.json({
        success: true,
        message: {
          id: chatMessage.id,
          message: chatMessage.message,
          response: chatMessage.response,
          citations: chatMessage.citations,
          timestamp: chatMessage.timestamp,
        }
      });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate document summary
  app.post("/api/documents/:id/summary", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const summary = await huggingFaceService.generateSummary(document.textContent);
      
      res.json({ summary });
    } catch (error) {
      console.error("Summary generation error:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Create sample document endpoint
  app.post("/api/documents/sample", async (req: Request, res: Response) => {
    try {
      console.log("Creating sample document");
      
      const sampleContent = generateSamplePDFContent();
      const textBuffer = Buffer.from(sampleContent, 'utf-8');
      
      const processedDoc = await pdfProcessor.processPDF(
        textBuffer,
        'sample-chatpdf-demo.pdf',
        'ChatPDF Demo Document'
      );

      res.json({
        success: true,
        document: {
          id: processedDoc.id,
          filename: processedDoc.filename,
          originalName: processedDoc.originalName,
          pageCount: 1, // Sample is text-based, so 1 page
          uploadedAt: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error("Sample document creation error:", error);
      res.status(500).json({ 
        error: "Failed to create sample document",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
