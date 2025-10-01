import ChatInput from '../ChatInput';
import { useState } from 'react';

export default function ChatInputExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium mb-2">Recent Messages:</h3>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet...</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {messages.map((msg, index) => (
              <li key={index} className="text-foreground">• {msg}</li>
            ))}
          </ul>
        )}
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}