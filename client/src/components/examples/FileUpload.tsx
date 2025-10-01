import FileUpload from '../FileUpload';
import { useState } from 'react';

export default function FileUploadExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      // Simulate upload process
      setIsUploading(true);
      setTimeout(() => setIsUploading(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <FileUpload 
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        isUploading={isUploading}
      />
    </div>
  );
}