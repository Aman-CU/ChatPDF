import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "What file formats are supported?",
      answer: "Currently, we support PDF files up to 50MB in size. We're working on adding support for other document formats like Word, PowerPoint, and Excel in future updates."
    },
    {
      question: "How accurate are the AI responses?",
      answer: "Our AI provides highly accurate responses based on the content of your uploaded document. Every answer includes page citations so you can verify the information. However, we recommend cross-checking important information with the original source."
    },
    {
      question: "Is my document data secure and private?",
      answer: "Yes, absolutely. Your documents are processed securely and are not stored permanently on our servers. All data is encrypted in transit and during processing. We follow industry-standard security practices to protect your information."
    },
    {
      question: "Can I chat with multiple PDFs at once?",
      answer: "Currently, you can chat with one PDF at a time. This ensures focused and accurate responses. We're considering multi-document support for future releases based on user feedback."
    },
    {
      question: "What types of questions work best?",
      answer: "The AI works best with specific questions about the document content, such as 'What is the main conclusion?' or 'Explain the methodology used.' It can also handle broader questions like 'Summarize chapter 3' or 'What are the key findings?'"
    },
    {
      question: "How long does it take to process a document?",
      answer: "Most documents are processed within 30-60 seconds, depending on the file size and complexity. You'll see a progress indicator during upload and processing."
    },
    {
      question: "Can I save or export my chat conversations?",
      answer: "Chat conversations are temporarily stored during your session for context. We're working on adding features to save and export your conversations for future reference."
    },
    {
      question: "What languages are supported?",
      answer: "Currently, we support documents and conversations in English. We're actively working on adding support for multiple languages including Spanish, French, German, and Chinese."
    },
    {
      question: "Is there a limit on document length?",
      answer: "Documents up to 50MB and approximately 500 pages are supported. For very large documents, processing may take longer, but the system is designed to handle comprehensive academic papers and business reports."
    },
    {
      question: "How do citations work?",
      answer: "Every AI response includes citations showing which pages the information came from. You can click on page references to quickly navigate to the relevant section in the document viewer."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" data-testid="page-faq">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12" data-testid="section-faq-hero">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about ChatPDF and how to get the most out of your document conversations.
            </p>
          </div>
          
          {/* FAQ Accordion */}
          <Card className="p-6" data-testid="card-faq-content">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
          
          {/* Contact Section */}
          <div className="text-center mt-12" data-testid="section-faq-contact">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? We're here to help.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Email us at <span className="text-primary font-medium">support@chatpdf.com</span>
              </p>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}