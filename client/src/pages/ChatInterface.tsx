import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import PDFViewer from "@/components/PDFViewer";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, MessageSquare, Loader2 } from "lucide-react";

interface ChatData {
  id: string;
  message: string;
  response: string;
  citations?: { pageNumber: number; content: string }[];
  timestamp: string;
  isUser?: boolean;
}

interface Document {
  id: string;
  originalName: string;
  pageCount: string; // returned as string from API; we parseInt when needed
  uploadedAt: string;
  textContent: string;
}

export default function ChatInterface() {
  const [, setLocation] = useLocation();
  const [documentId, setDocumentId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const API_BASE = (import.meta as any).env?.VITE_API_URL || '';
  const api = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

  // Get document ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('doc');
    if (docId) {
      setDocumentId(docId);
    } else {
      // No document ID, redirect to home
      setLocation('/');
    }
  }, [setLocation]);

  // Fetch document data
  const { data: documentData, isLoading: isLoadingDocument, error: documentError } = useQuery({
    queryKey: ['/api/documents', documentId],
    enabled: !!documentId,
  });

  // Fetch chat messages
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/documents', documentId, 'messages'],
    enabled: !!documentId,
  });

  const document = (documentData as any)?.document;
  const messages = (messagesData as any)?.messages || [];

  // Send chat message mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(api(`/api/documents/${documentId}/chat`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh messages
      queryClient.invalidateQueries({
        queryKey: ['/api/documents', documentId, 'messages'],
      });
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        title: "Message Failed",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message: string) => {
    if (!documentId) return;
    chatMutation.mutate(message);
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handleFileUpload = () => {
    setLocation('/');
  };

  // Show loading state
  if (isLoadingDocument) {
    return (
      <div className="min-h-screen flex flex-col" data-testid="page-chat-interface">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading document...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (documentError || !document) {
    return (
      <div className="min-h-screen flex flex-col" data-testid="page-chat-interface">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Document not found</h2>
            <p className="text-muted-foreground mb-4">
              The document you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBackToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Convert chat messages to the format expected by ChatMessage component
  const convertedMessages = messages.flatMap((msg: ChatData) => [
    {
      message: msg.message,
      isUser: true,
      timestamp: msg.timestamp,
    },
    {
      message: msg.response,
      response: msg.response,
      citations: msg.citations,
      isUser: false,
      timestamp: msg.timestamp,
    }
  ]);

  return (
    <div className="min-h-screen flex flex-col" data-testid="page-chat-interface">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Document Panel */}
        <div className="w-3/5 border-r border-border flex flex-col" data-testid="panel-document">
          {/* Document Header */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBackToHome}
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="font-semibold text-foreground" data-testid="text-document-title">
                    {document.originalName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {document.pageCount} pages
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFileUpload}
                className="gap-2"
                data-testid="button-upload-new"
              >
                <Upload className="h-4 w-4" />
                Upload New
              </Button>
            </div>
          </div>
          
          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden">
            <PDFViewer 
              file={null}
              documentName={document.originalName}
              pageCount={parseInt(document.pageCount)}
              documentContent={document.textContent}
              isLoaded={true}
              documentId={documentId || undefined}
            />
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-2/5 flex flex-col" data-testid="panel-chat">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Chat</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ask questions about the document
            </p>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages-area">
            {isLoadingMessages ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            ) : convertedMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions about the document to get started
                </p>
              </div>
            ) : (
              convertedMessages.map((msg: any, index: number) => (
                <ChatMessage
                  key={index}
                  message={msg.message}
                  response={msg.response}
                  citations={msg.citations}
                  timestamp={msg.timestamp}
                  isUser={msg.isUser}
                />
              ))
            )}
            
            {/* Show loading indicator when sending message */}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <Card className="p-4 max-w-[80%] bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="border-t border-border p-4">
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={chatMutation.isPending}
              placeholder="Ask a question about the document..."
            />
          </div>
        </div>
      </main>
    </div>
  );
}