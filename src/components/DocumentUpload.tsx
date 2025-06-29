import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  onFileUpload: (file: File) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFileUpload }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const file = files[0];
      
      if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = ""; // Reset input so same file can be uploaded again
    }
  };

  return (
    <div
      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        Upload Document for Analysis
      </h3>
      <p className="text-slate-600 mb-4">
        Drag and drop your invoice or receipt here, or click to browse
      </p>
      <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
        <div className="flex items-center space-x-1">
          <FileText className="h-4 w-4" />
          <span>PDF</span>
        </div>
        <div className="flex items-center space-x-1">
          <FileText className="h-4 w-4" />
          <span>Images</span>
        </div>
      </div>
      <div className="mt-4 p-3 bg-amber-50 rounded-md">
        <div className="flex items-center space-x-2 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            Only invoices and receipts are supported for forensic analysis
          </span>
        </div>
      </div>
      
      <input
        id="file-input"
        type="file"
        accept=".pdf,image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default DocumentUpload;
