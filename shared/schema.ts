import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// PDF Document schema
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  textContent: text("text_content").notNull(),
  pageCount: varchar("page_count").notNull(),
  pdfData: text("pdf_data"), // Base64 encoded PDF binary data
});

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  citations: json("citations").$type<{pageNumber: number, content: string}[]>().default([]),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Text chunks for vector search
export const textChunks = pgTable("text_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  content: text("content").notNull(),
  pageNumber: varchar("page_number").notNull(),
  chunkIndex: varchar("chunk_index").notNull(),
  embedding: json("embedding").$type<number[]>(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertTextChunkSchema = createInsertSchema(textChunks).omit({
  id: true,
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type TextChunk = typeof textChunks.$inferSelect;
export type InsertTextChunk = z.infer<typeof insertTextChunkSchema>;
