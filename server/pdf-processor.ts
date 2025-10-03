import { storage } from './storage';
import { InsertDocument, InsertTextChunk } from '@shared/schema';

export interface ProcessedDocument {
  id: string;
  filename: string;
  originalName: string;
  textContent: string;
  pageCount: number;
  chunks: Array<{
    content: string;
    pageNumber: number;
    chunkIndex: number;
  }>;
}
export class PDFProcessor {
  /**
   * Process uploaded PDF file and extract text content
   */
  async processPDF(file: Buffer, filename: string, originalName: string): Promise<ProcessedDocument> {
    try {
      let textContent: string;
      let pageCount: number;
      // LIGHT_PDF: fast path for constrained hosts (skips heavy parsing)
      const lightMode = process.env.LIGHT_PDF === '1';

      if (lightMode) {
        textContent = `PDF Document: ${originalName}\n\n` +
          `Light parsing mode is enabled on the server (LIGHT_PDF=1). ` +
          `The original PDF was stored, and you can still chat using fallback context.`;
        pageCount = 1;
      } else if (filename.includes('sample') || originalName.includes('Demo')) {
        // Text-based sample document
        textContent = file.toString('utf-8');
        pageCount = 1;
        console.log(`Processed sample text document: ${originalName}, Text length: ${textContent.length}`);
      } else {
        // Real PDF: try extracting with pdfjs
        console.log('Processing PDF file with buffer length:', file.length);
        try {
          const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
          const uint8Array = new Uint8Array(file);
          const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
          const pdfDocument = await loadingTask.promise;
          pageCount = pdfDocument.numPages;
          let fullText = '';
          for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const t = await page.getTextContent();
            const pageText = (t.items as any[]).map((it: any) => it.str).join(' ');
            fullText += pageText + '\n\n';
          }
          textContent = fullText.trim();
          console.log(`Successfully extracted PDF content: ${originalName}, Text length: ${textContent.length}, Pages: ${pageCount}`);
          if (!textContent || textContent.trim().length === 0) {
            textContent = `PDF Document: ${originalName}\n\nThis PDF appears to be image-based or contains no extractable text.`;
            pageCount = 1;
          }
        } catch (pdfError) {
          console.error('Error parsing PDF:', pdfError);
          textContent = `PDF Document Analysis: ${originalName}\n\n` +
            `We encountered technical difficulties extracting the text automatically. ` +
            `You can still chat with a fallback context or try a different PDF.`;
          pageCount = 1;
        }
        console.log(`Processed PDF: ${originalName}, Final text length: ${textContent.length}`);
      }

      // Persist document
      const insertDocument: InsertDocument = {
        filename,
        originalName,
        textContent,
        pageCount: pageCount.toString(),
        pdfData: file.toString('base64'),
      };
      const document = await storage.createDocument(insertDocument);

      // Chunk and store
      const chunks = this.chunkText(textContent, pageCount);
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const insertChunk: InsertTextChunk = {
          documentId: document.id,
          content: chunk.content,
          pageNumber: chunk.pageNumber.toString(),
          chunkIndex: i.toString(),
          embedding: null,
        };
        await storage.createTextChunk(insertChunk);
      }

      return {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName,
        textContent: document.textContent,
        pageCount,
        chunks,
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  /**
   * Chunk text into smaller pieces for better processing
   */
  private chunkText(text: string, pageCount: number): Array<{
    content: string;
    pageNumber: number;
    chunkIndex: number;
  }> {
    const chunks: Array<{
      content: string;
      pageNumber: number;
      chunkIndex: number;
    }> = [];

    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    const chunkSize = 1000; // characters per chunk
    const overlap = 100; // character overlap between chunks
    
    let currentChunk = '';
    let chunkIndex = 0;
    let estimatedPage = 1;
    const avgCharsPerPage = text.length / pageCount;

    for (const paragraph of paragraphs) {
      // Estimate current page based on character position
      const currentPosition = text.indexOf(paragraph);
      estimatedPage = Math.max(1, Math.ceil(currentPosition / avgCharsPerPage));

      if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          content: currentChunk.trim(),
          pageNumber: estimatedPage,
          chunkIndex,
        });

        // Start new chunk with overlap
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + ' ' + paragraph;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + paragraph;
      }
    }

    // Add the last chunk if it has content
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        pageNumber: estimatedPage,
        chunkIndex,
      });
    }

    console.log(`Created ${chunks.length} text chunks for document`);
    return chunks;
  }

  /**
   * Get relevant context for a user query from document chunks
   */
  async getRelevantContext(documentId: string, query: string, maxChunks: number = 3): Promise<string> {
    try {
      // First try to get relevant chunks by searching
      let relevantChunks = await storage.searchTextChunks(documentId, query);
      
      // If no relevant chunks found, get the first few chunks to ensure AI has context
      if (relevantChunks.length === 0) {
        console.log('No query-specific chunks found, returning first chunks for context');
        const allChunks = await storage.getTextChunks(documentId);
        relevantChunks = allChunks.slice(0, maxChunks);
      }
      
      // Sort by relevance and combine
      const sortedChunks = relevantChunks
        .slice(0, maxChunks)
        .map(chunk => chunk.content)
        .join('\n\n');

      console.log(`Returning context with ${relevantChunks.length} chunks, total length: ${sortedChunks.length}`);
      return sortedChunks;
    } catch (error) {
      console.error('Error getting relevant context:', error);
      // As a last resort, try to get the document text directly
      try {
        const document = await storage.getDocument(documentId);
        if (document && document.textContent) {
          console.log('Returning direct document content as context');
          return document.textContent.substring(0, 3000); // First 3000 chars
        }
      } catch (docError) {
        console.error('Error getting document content:', docError);
      }
      return '';
    }
  }
}

export const pdfProcessor = new PDFProcessor();