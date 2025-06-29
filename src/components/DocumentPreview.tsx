
import React from 'react';
import { FileText, Image } from 'lucide-react';

interface DocumentPreviewProps {
  file: File;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file }) => {
  const fileUrl = URL.createObjectURL(file);
  const isPdf = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-slate-600">
        {isPdf ? <FileText className="h-4 w-4" /> : <Image className="h-4 w-4" />}
        <span>{file.name}</span>
        <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        {isImage ? (
          <img
            src={fileUrl}
            alt="Document preview"
            className="w-full max-h-96 object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={fileUrl}
            className="w-full h-96 border-none"
            title="PDF preview"
          />
        ) : (
          <div className="p-8 text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <p>File type not supported for preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;
