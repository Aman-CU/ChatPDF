import { type Document, type InsertDocument, type ChatMessage, type InsertChatMessage, type TextChunk, type InsertTextChunk } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for the ChatPDF application
export interface IStorage {
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  deleteDocument(id: string): Promise<void>;

  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(documentId: string): Promise<ChatMessage[]>;
  deleteChatMessages(documentId: string): Promise<void>;

  // Text chunk operations
  createTextChunk(chunk: InsertTextChunk): Promise<TextChunk>;
  getTextChunks(documentId: string): Promise<TextChunk[]>;
  deleteTextChunks(documentId: string): Promise<void>;
  searchTextChunks(documentId: string, query: string): Promise<TextChunk[]>;

  // PDF binary data operations
  getPDFData(documentId: string): Promise<Buffer | undefined>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private chatMessages: Map<string, ChatMessage>;
  private textChunks: Map<string, TextChunk>;

  constructor() {
    this.documents = new Map();
    this.chatMessages = new Map();
    this.textChunks = new Map();
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: new Date() 
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
    // Also delete related chat messages and text chunks
    await this.deleteChatMessages(id);
    await this.deleteTextChunks(id);
  }

  // Chat message operations
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      timestamp: new Date(),
      citations: (insertMessage.citations as { pageNumber: number; content: string }[]) || []
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(documentId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.documentId === documentId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async deleteChatMessages(documentId: string): Promise<void> {
    const messagesToDelete = Array.from(this.chatMessages.entries())
      .filter(([_, msg]) => msg.documentId === documentId)
      .map(([id, _]) => id);
    
    messagesToDelete.forEach(id => this.chatMessages.delete(id));
  }

  // Text chunk operations
  async createTextChunk(insertChunk: InsertTextChunk): Promise<TextChunk> {
    const id = randomUUID();
    const chunk: TextChunk = { 
      ...insertChunk, 
      id,
      embedding: (insertChunk.embedding as number[]) || null
    };
    this.textChunks.set(id, chunk);
    return chunk;
  }

  async getTextChunks(documentId: string): Promise<TextChunk[]> {
    return Array.from(this.textChunks.values())
      .filter(chunk => chunk.documentId === documentId)
      .sort((a, b) => parseInt(a.chunkIndex) - parseInt(b.chunkIndex));
  }

  async deleteTextChunks(documentId: string): Promise<void> {
    const chunksToDelete = Array.from(this.textChunks.entries())
      .filter(([_, chunk]) => chunk.documentId === documentId)
      .map(([id, _]) => id);
    
    chunksToDelete.forEach(id => this.textChunks.delete(id));
  }

  async searchTextChunks(documentId: string, query: string): Promise<TextChunk[]> {
    const chunks = await this.getTextChunks(documentId);
    const queryLower = query.toLowerCase();
    
    // Simple text-based search for now
    return chunks.filter(chunk => 
      chunk.content.toLowerCase().includes(queryLower)
    );
  }

  // PDF binary data operations (deprecated - use document.pdfData directly)
  async getPDFData(documentId: string): Promise<Buffer | undefined> {
    const document = await this.getDocument(documentId);
    if (!document?.pdfData) {
      return undefined;
    }
    
    // Convert base64 back to buffer
    return Buffer.from(document.pdfData, 'base64');
  }
}

export const storage = new MemStorage();
