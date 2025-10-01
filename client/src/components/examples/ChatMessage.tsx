import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <ChatMessage 
        message="What is the main topic of this document?"
        isUser={true}
        timestamp="2024-01-15T10:30:00Z"
      />
      
      <ChatMessage 
        message="Based on the document, the main topic is artificial intelligence and machine learning applications in healthcare. The document discusses various AI technologies being implemented in medical diagnosis, treatment planning, and patient care management."
        isUser={false}
        citations={[
          { pageNumber: 3, content: "AI in healthcare introduction" },
          { pageNumber: 7, content: "Machine learning applications" },
          { pageNumber: 12, content: "Medical diagnosis systems" }
        ]}
        timestamp="2024-01-15T10:30:15Z"
      />
      
      <ChatMessage 
        message="Can you tell me more about the specific AI technologies mentioned?"
        isUser={true}
        timestamp="2024-01-15T10:32:00Z"
      />
    </div>
  );
}