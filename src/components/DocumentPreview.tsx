import React, { useState } from 'react';
import { FileText, Image } from 'lucide-react';
import DocumentViewer from './DocumentViewer';

interface DocumentPreviewProps {
  file: File;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const isPdf = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  return (
    <>
      <div className="space-y-4">
        <button
          className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm w-full hover:bg-blue-50 transition-colors focus:outline-none"
          onClick={() => setIsViewerOpen(true)}
          title="Click to preview document"
        >
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            {isPdf ? <FileText className="h-4 w-4" /> : <Image className="h-4 w-4" />}
            <span className="underline hover:text-blue-700">{file.name}</span>
            <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        </button>
      </div>

      <DocumentViewer
        file={file}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
};

export default DocumentPreview;
