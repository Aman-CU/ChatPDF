import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Zap, Shield, FileText, Loader2 } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Upload successful:", data);
      toast({
        title: "Upload Successful",
        description: `${selectedFile?.name} has been processed successfully.`,
      });
      // Navigate to chat with the document ID
      setLocation(`/chat?doc=${data.document.id}`);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process PDF file.",
        variant: "destructive",
      });
      setSelectedFile(null);
    },
  });

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      console.log("Uploading file:", file.name);
      uploadMutation.mutate(file);
    }
  };

  // Sample document mutation
  const sampleMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/documents/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sample document');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Sample document created:", data);
      toast({
        title: "Sample Document Ready",
        description: "Sample document created successfully. Redirecting to chat...",
      });
      // Navigate to chat with the document ID
      setLocation(`/chat?doc=${data.document.id}`);
    },
    onError: (error) => {
      console.error("Sample document creation failed:", error);
      toast({
        title: "Sample Creation Failed",
        description: error.message || "Failed to create sample document.",
        variant: "destructive",
      });
    },
  });

  const handleSamplePDF = () => {
    console.log("Creating sample document");
    sampleMutation.mutate();
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Natural Conversations",
      description: "Ask questions in plain English and get intelligent responses about your document content."
    },
    {
      icon: Zap,
      title: "Instant Citations",
      description: "Every answer includes page references so you can verify information and dive deeper."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your documents are processed securely and never stored permanently on our servers."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" data-testid="page-home">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 text-center" data-testid="section-hero">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Chat with Any PDF
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your documents into interactive conversations. Upload a PDF and start asking questions to get instant, cited answers.
            </p>
            
            <div className="max-w-2xl mx-auto mb-8">
              <FileUpload 
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                isUploading={uploadMutation.isPending}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleSamplePDF}
                variant="outline"
                className="gap-2"
                disabled={sampleMutation.isPending}
                data-testid="button-try-sample"
              >
                {sampleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {sampleMutation.isPending ? "Creating Sample..." : "Try Sample Document"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Or upload your own document to get started
              </p>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30" data-testid="section-features">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Choose ChatPDF?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the future of document interaction with our AI-powered platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="p-6 text-center hover-elevate" data-testid={`card-feature-${index}`}>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Getting Started Section */}
        <section className="py-16 px-4" data-testid="section-getting-started">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Get Started in Seconds
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  1
                </div>
                <h3 className="font-semibold text-foreground">Upload Your PDF</h3>
                <p className="text-sm text-muted-foreground">
                  Simply drag and drop or click to browse for your document
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  2
                </div>
                <h3 className="font-semibold text-foreground">Start Asking</h3>
                <p className="text-sm text-muted-foreground">
                  Type your questions naturally, as if you're talking to an expert
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  3
                </div>
                <h3 className="font-semibold text-foreground">Get Answers</h3>
                <p className="text-sm text-muted-foreground">
                  Receive intelligent responses with page citations for verification
                </p>
              </div>
            </div>
            
            <Button size="lg" className="gap-2" onClick={() => setLocation('/dashboard')} data-testid="button-get-started">
              <MessageSquare className="h-5 w-5" />
              Get Started Now
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}