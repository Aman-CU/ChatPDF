import PDFViewer from '../PDFViewer';
import { useState } from 'react';

export default function PDFViewerExample() {
  const [hasDocument, setHasDocument] = useState(true);
  
  // Create a mock file for demo
  const mockFile = hasDocument ? new File(['sample pdf content'], 'sample-document.pdf', {
    type: 'application/pdf',
    lastModified: Date.now(),
  }) : null;
  
  return (
    <div className="h-[600px] w-full">
      <div className="mb-4 flex gap-2">
        <button 
          onClick={() => setHasDocument(true)}
          className={`px-4 py-2 rounded text-sm ${
            hasDocument 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          With Document
        </button>
        <button 
          onClick={() => setHasDocument(false)}
          className={`px-4 py-2 rounded text-sm ${
            !hasDocument 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          No Document
        </button>
      </div>
      
      <PDFViewer 
        file={mockFile}
        documentName="AI in Healthcare Research Paper"
        pageCount={24}
      />
    </div>
  );
}