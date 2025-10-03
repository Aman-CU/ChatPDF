import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from "lucide-react";

interface PDFViewerProps {
  file?: File | null;
  documentName?: string;
  pageCount?: number;
  documentContent?: string;
  isLoaded?: boolean;
  documentId?: string;
}

export default function PDFViewer({ file, documentName, pageCount = 0, documentContent, isLoaded = false, documentId }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const API_BASE = (import.meta as any).env?.VITE_API_URL || '';
  const api = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      console.log("Previous page:", currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(prev => prev + 1);
      console.log("Next page:", currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
    console.log("Zoom in:", Math.min(zoomLevel + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
    console.log("Zoom out:", Math.max(zoomLevel - 25, 50));
  };

  // Create PDF URL from file or fetch from API for stored documents
  useEffect(() => {
    if (file) {
      // For uploaded files, create blob URL
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (documentId) {
      // For stored documents, use API endpoint
      const apiUrl = api(`/api/documents/${documentId}/pdf`);
      setPdfUrl(apiUrl);
    } else {
      setPdfUrl(null);
    }
  }, [file, documentId]);

  if (!file && !isLoaded) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 text-center" data-testid="card-no-document">
        <div className="p-6 rounded-full bg-muted/50 mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No document loaded
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload a PDF to start viewing and chatting with your document
        </p>
      </Card>
    );
  }

  // If we have a PDF file or loaded document, show PDF viewer
  if (file || (isLoaded && documentId)) {
    return (
      <div className="h-full flex flex-col" data-testid="pdf-viewer-container">
        {/* Header with controls */}
        <div className="border-b p-3 bg-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground truncate" data-testid="text-document-name">
              {documentName || file?.name}
            </h3>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                data-testid="button-zoom-out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2 min-w-[60px] text-center" data-testid="text-zoom-level">
                {zoomLevel}%
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                data-testid="button-zoom-in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                data-testid="button-previous-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2" data-testid="text-page-info">
                Page {currentPage} of {pageCount}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNextPage}
                disabled={currentPage >= pageCount}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              {pageCount} pages
            </span>
          </div>
        </div>
        
        {/* PDF Viewer Area */}
        <div className="flex-1 bg-muted/30" data-testid="pdf-content-area">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#page=${currentPage}&zoom=${zoomLevel}`}
              className="w-full h-full border-0"
              title={documentName || (file ? file.name : "PDF Document")}
              data-testid="pdf-iframe"
            />
          ) : isLoaded && documentContent ? (
            // Fallback: Show formatted document content if PDF not available
            <div className="h-full overflow-y-auto p-4">
              <Card className="p-6 max-w-4xl mx-auto bg-white dark:bg-white shadow-lg">
                <div 
                  className="prose prose-sm max-w-none text-gray-900"
                  style={{ fontSize: `${Math.max(zoomLevel * 0.8, 70)}%` }}
                  data-testid="document-text-content"
                >
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                    {documentContent}
                  </pre>
                </div>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="pdf-viewer-container">
      {/* Header with controls */}
      <div className="border-b p-3 bg-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-foreground truncate" data-testid="text-document-name">
            {documentName || (file ? file.name : "Document")}
          </h3>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2 min-w-[60px] text-center" data-testid="text-zoom-level">
              {zoomLevel}%
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              data-testid="button-previous-page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2" data-testid="text-page-info">
              Page {currentPage} of {pageCount}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNextPage}
              disabled={currentPage >= pageCount}
              data-testid="button-next-page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground" data-testid="text-file-size">
            {file && typeof file.size === 'number' ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : 'Document loaded'}
          </div>
        </div>
      </div>
      
      {/* PDF Content Area */}
      <div className="flex-1 bg-muted/30 p-4 overflow-auto" data-testid="pdf-content-area">
        <Card className="w-full max-w-[600px] mx-auto aspect-[8.5/11] bg-white dark:bg-white flex items-center justify-center shadow-lg">
          <div className="text-center p-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm mb-2">
              PDF Preview
            </p>
            <p className="text-gray-500 text-xs">
              Page {currentPage} content would be rendered here
            </p>
            {/* TODO: Integrate PDF.js for actual PDF rendering */}
          </div>
        </Card>
      </div>
    </div>
  );
}