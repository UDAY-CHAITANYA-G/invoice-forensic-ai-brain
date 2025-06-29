import React, { useState, useRef, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  RotateCw, 
  Move, 
  MessageSquare,
  Highlighter,
  X,
  FileText
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

interface Annotation {
  id: string;
  type: 'highlight' | 'comment';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

interface DocumentViewerProps {
  file: File;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ file, isOpen, onClose }) => {
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState<'move' | 'highlight' | 'comment'>('move');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [commentText, setCommentText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const fileUrl = URL.createObjectURL(file);
  const isPdf = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  const handleZoomIn = () => {
    setZoom([Math.min(zoom[0] + 25, 300)]);
  };

  const handleZoomOut = () => {
    setZoom([Math.max(zoom[0] - 25, 25)]);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (selectedTool === 'move') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    } else if (selectedTool === 'highlight' || selectedTool === 'comment') {
      setIsSelecting(true);
      const rect = contentRef.current?.getBoundingClientRect();
      if (rect) {
        setSelectionStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  }, [selectedTool, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && selectedTool === 'move') {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isSelecting) {
      const rect = contentRef.current?.getBoundingClientRect();
      if (rect) {
        setSelectionEnd({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  }, [isDragging, isSelecting, dragStart, selectedTool]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    } else if (isSelecting) {
      setIsSelecting(false);
      
      const width = Math.abs(selectionEnd.x - selectionStart.x);
      const height = Math.abs(selectionEnd.y - selectionStart.y);
      
      if (width > 5 && height > 5) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: selectedTool as 'highlight' | 'comment',
          x: Math.min(selectionStart.x, selectionEnd.x),
          y: Math.min(selectionStart.y, selectionEnd.y),
          width,
          height,
          color: selectedTool === 'highlight' ? '#ffff0080' : '#ff000080',
          text: selectedTool === 'comment' ? commentText : undefined
        };
        
        setAnnotations([...annotations, newAnnotation]);
      }
    }
  }, [isDragging, isSelecting, selectionStart, selectionEnd, selectedTool, annotations, commentText]);

  const handleExportAnnotated = () => {
    // Create a canvas to combine document and annotations
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // This is a simplified export - in a real implementation, you'd need to:
    // 1. Render the document to canvas
    // 2. Draw annotations on top
    // 3. Export as image or PDF
    
    const link = document.createElement('a');
    link.download = `annotated-${file.name}`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-1">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{file.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div 
          ref={containerRef}
          className="flex-1 bg-slate-100 relative"
          style={{ height: 'calc(90vh - 120px)' }}
        >
          <div
            ref={contentRef}
            className="relative w-full h-full"
            style={{ cursor: 'default', padding: '0.25rem' }}
          >
            <div
              className="relative bg-white shadow-lg"
              style={{
                width: '100%',
                height: '100%',
                margin: '0rem !important',
                boxSizing: 'border-box',
                padding: '0.25rem',
                transform: undefined,
                transformOrigin: undefined
              }}
            >
              {isImage ? (
                <img
                  src={fileUrl}
                  alt="Document"
                  className="max-w-none"
                  draggable={false}
                />
              ) : isPdf ? (
                <div style={{ width: '100%', height: '80vh', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.25rem' }}>
                  <iframe
                    src={fileUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Document"
                  />
                </div>
              ) : (
                <div className="w-[800px] h-[600px] flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4" />
                    <p>File type not supported for detailed viewing</p>
                  </div>
                </div>
              )}
              
              {/* Annotations */}
              {annotations.map((annotation) => (
                <div key={annotation.id}>
                  <div
                    className="absolute border-2 border-dashed"
                    style={{
                      left: annotation.x,
                      top: annotation.y,
                      width: annotation.width,
                      height: annotation.height,
                      backgroundColor: annotation.color,
                      borderColor: annotation.color.replace('80', 'ff')
                    }}
                  />
                  {annotation.type === 'comment' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          className="absolute w-6 h-6 p-0"
                          style={{
                            left: annotation.x + (annotation.width || 0),
                            top: annotation.y
                          }}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Add your comment..."
                            value={annotation.text || ''}
                            onChange={(e) => {
                              const updatedAnnotations = annotations.map(ann =>
                                ann.id === annotation.id 
                                  ? { ...ann, text: e.target.value }
                                  : ann
                              );
                              setAnnotations(updatedAnnotations);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeAnnotation(annotation.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  {annotation.type === 'highlight' && (
                    <></>
                  )}
                </div>
              ))}
              
              {/* Selection Rectangle */}
              {isSelecting && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30"
                  style={{
                    left: Math.min(selectionStart.x, selectionEnd.x),
                    top: Math.min(selectionStart.y, selectionEnd.y),
                    width: Math.abs(selectionEnd.x - selectionStart.x),
                    height: Math.abs(selectionEnd.y - selectionStart.y),
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Comment Input for Comment Tool */}
        {selectedTool === 'comment' && (
          <div className="px-6 py-3 border-t bg-slate-50">
            <Textarea
              placeholder="Enter comment text (will be added to next annotation)..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
