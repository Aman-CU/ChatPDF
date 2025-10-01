import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  isUploading?: boolean;
}

export default function FileUpload({ onFileSelect, selectedFile, isUploading = false }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        onFileSelect(file);
        console.log("File selected via drag:", file.name);
      } else {
        console.log("Only PDF files are supported");
        alert("Only PDF files are supported");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
      console.log("File selected via input:", file.name);
    } else if (file) {
      console.log("Only PDF files are supported");
      alert("Only PDF files are supported");
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    onFileSelect(null as any); // Clear the file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    console.log("File cleared");
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <Card 
          className={`p-8 border-2 border-dashed transition-all duration-200 cursor-pointer hover-elevate ${
            isDragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          data-testid="card-file-upload"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                Drop your PDF here or click to browse
              </h3>
              <p className="text-sm text-muted-foreground">
                Supports PDF files up to 50MB
              </p>
            </div>
            
            <Button variant="outline" data-testid="button-browse-files">
              Browse Files
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4" data-testid="card-selected-file">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-medium text-foreground" data-testid="text-filename">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-muted-foreground" data-testid="text-filesize">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearFile}
              disabled={isUploading}
              data-testid="button-clear-file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="hidden"
        data-testid="input-file-hidden"
      />
    </div>
  );
}