import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bot } from "lucide-react";

interface Citation {
  pageNumber: number;
  content: string;
}

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  response?: string;
  citations?: Citation[];
  timestamp?: string;
}

export default function ChatMessage({ 
  message, 
  isUser, 
  response, 
  citations = [], 
  timestamp 
}: ChatMessageProps) {
  const formatTime = (time?: string) => {
    if (!time) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* User Message */}
        {isUser && (
          <Card className={`p-3 bg-primary text-primary-foreground`} data-testid={`message-user`}>
            <p className="text-sm">{message}</p>
          </Card>
        )}
        
        {/* AI Response */}
        {!isUser && (
          <Card className="p-3 bg-card" data-testid={`message-ai`}>
            <div className="space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                {response || message}
              </p>
              
              {citations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {citations.map((citation, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs"
                        data-testid={`citation-${index}`}
                      >
                        Page {citation.pageNumber}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
        
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
            {formatTime(timestamp)}
          </span>
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}