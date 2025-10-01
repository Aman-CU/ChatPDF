import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  response: string;
  citations?: { pageNumber: number; content: string }[];
}

export class HuggingFaceService {
  private model = 'meta-llama/Llama-3.1-8B-Instruct'; // Supported model for chat completions

  /**
   * Generate chat response based on document context and user message
   */
  async generateChatResponse(
    userMessage: string,
    documentContext: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<LLMResponse> {
    try {
      // Build messages array with conversation history and context
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: "system", content: "You are a helpful AI assistant that answers questions about documents. Use the provided document context to answer accurately and cite relevant information." }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });

      // Add current question with document context
      const contextualMessage = `Document Context:\n${documentContext.substring(0, 1500)}\n\nUser Question: ${userMessage}`;
      messages.push({ role: "user", content: contextualMessage });

      // Use the new chat completions API format
      const response = await hf.chatCompletion({
        model: this.model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      // Extract response text
      const responseText = response.choices[0]?.message?.content?.trim() || "I apologize, but I couldn't generate a response.";
      
      // Extract citations from the response (simple implementation)
      const citations = this.extractCitations(responseText, documentContext);

      return {
        response: responseText,
        citations,
      };
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw new Error('Failed to generate response from Hugging Face API');
    }
  }

  /**
   * Generate document summary
   */
  async generateSummary(documentText: string): Promise<string> {
    try {
      const prompt = `Please provide a concise summary of the following document:\n\n${documentText.substring(0, 2000)}...\n\nSummary:`;
      
      // Use the new chat completions API for summary
      const response = await hf.chatCompletion({
        model: this.model,
        messages: [
          { role: "system", content: "You are a helpful AI assistant that provides concise document summaries." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content?.trim() || "Unable to generate summary.";
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  /**
   * Build prompt for chat response
   */
  private buildPrompt(
    userMessage: string,
    documentContext: string,
    conversationHistory: ChatMessage[]
  ): string {
    let prompt = `You are a helpful AI assistant that answers questions about documents. `;
    prompt += `Use the following document context to answer the user's question accurately.\n\n`;
    prompt += `Document Context:\n${documentContext.substring(0, 1500)}\n\n`;
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      prompt += `Previous conversation:\n`;
      conversationHistory.slice(-4).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += `\n`;
    }
    
    prompt += `User: ${userMessage}\nAssistant:`;
    
    return prompt;
  }

  /**
   * Extract citations from response (simple keyword matching)
   */
  private extractCitations(response: string, documentContext: string): { pageNumber: number; content: string }[] {
    const citations: { pageNumber: number; content: string }[] = [];
    
    // Simple implementation: look for key phrases from the document in the response
    const documentSentences = documentContext.split('.').filter(s => s.trim().length > 20);
    const responseLower = response.toLowerCase();
    
    documentSentences.forEach((sentence, index) => {
      const sentenceLower = sentence.trim().toLowerCase();
      if (sentenceLower.length > 10 && responseLower.includes(sentenceLower.substring(0, 30))) {
        // Estimate page number based on position in document
        const estimatedPage = Math.floor(index / 10) + 1;
        citations.push({
          pageNumber: estimatedPage,
          content: sentence.trim().substring(0, 100) + '...',
        });
      }
    });

    return citations.slice(0, 3); // Limit to 3 citations
  }
}

export const huggingFaceService = new HuggingFaceService();