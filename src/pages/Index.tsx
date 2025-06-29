import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentPreview from '@/components/DocumentPreview';
import AnalysisResults from '@/components/AnalysisResults';
import { AnalysisData } from '@/types/forensic';
import { geminiService, GeminiAnalysisResult } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const analysisSteps = [
    'Document Type Detection',
    'Logo Authenticity Check',
    'Template Structure Analysis',
    'Image Anomaly Detection',
    'Company Detail Verification',
    'Price Analysis'
  ];

  // Gradually increase progress while analyzing
  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0);
      if (progressRef.current) clearInterval(progressRef.current);
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev < 95) {
            const next = prev + Math.random() * 2 + 0.5;
            return next > 95 ? 95 : next;
          } else {
            return 95;
          }
        });
      }, 50);
    } else {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);
    }
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isAnalyzing]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAnalysisData(null);
    setProgress(0);
    startAnalysis(file);
  };

  const startAnalysis = async (file: File) => {
    setIsAnalyzing(true);

    try {
      // Check if Gemini API key is configured
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        toast({
          title: "Configuration Error",
          description: "Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Simulate analysis steps for UI feedback
      for (let i = 0; i < analysisSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Call Gemini service for real analysis
      const geminiResult: GeminiAnalysisResult = await geminiService.analyzeDocument(file);
      
      // Convert Gemini result to our AnalysisData format - now they have the same structure
      const analysisResult: AnalysisData = {
        document_type: geminiResult.document_type as 'invoice' | 'receipt' | 'unknown',
        logo_verification: {
          status: geminiResult.logo_verification.status,
          company_name: geminiResult.logo_verification.company_name,
          logo_url_checked: geminiResult.logo_verification.logo_url_checked,
          confidence_score: geminiResult.logo_verification.confidence_score,
          detail_summary: geminiResult.logo_verification.detail_summary
        },
        template_check: {
          standard_format: geminiResult.template_check.standard_format,
          missing_fields: geminiResult.template_check.missing_fields,
          confidence_score: geminiResult.template_check.confidence_score,
          detail_summary: geminiResult.template_check.detail_summary
        },
        anomaly_detection: {
          tampering_detected: geminiResult.anomaly_detection.tampering_detected,
          suspicious_regions: geminiResult.anomaly_detection.suspicious_regions,
          confidence_score: geminiResult.anomaly_detection.confidence_score,
          detail_summary: geminiResult.anomaly_detection.detail_summary
        },
        company_verification: {
          status: geminiResult.company_verification.status,
          matched: geminiResult.company_verification.matched,
          website_checked: geminiResult.company_verification.website_checked,
          detail_summary: geminiResult.company_verification.detail_summary
        },
        price_check: {
          items_reviewed: geminiResult.price_check.items_reviewed,
          total_overpricing: geminiResult.price_check.total_overpricing,
          overall_status: geminiResult.price_check.overall_status,
          detail_summary: geminiResult.price_check.detail_summary
        },
        risk_assessment: {
          fraud_score: geminiResult.risk_assessment.fraud_score,
          risk_level: geminiResult.risk_assessment.risk_level,
          final_decision: geminiResult.risk_assessment.final_decision,
          detail_summary: geminiResult.risk_assessment.detail_summary
        },
        summary: geminiResult.summary
      };

      setAnalysisData(analysisResult);
      setProgress(100); // Complete progress
      
      toast({
        title: "Analysis Complete",
        description: "Document forensic analysis has been completed successfully.",
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze document. Please try again.",
        variant: "destructive",
      });
      setProgress(100);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Forensic Document Analyzer</h1>
              <p className="text-slate-600">Professional fraud detection and verification system</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Preview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Document Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUpload onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>

            {uploadedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Document Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentPreview file={uploadedFile} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Analysis */}
          <div className="lg:col-span-2">
            {isAnalyzing && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>Forensic Analysis in Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Gradually increasing progress bar */}
                    <div className="w-full h-2 rounded bg-blue-100 overflow-hidden relative">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded transition-all duration-100"
                        style={{ width: `${Math.min(progress, 100)}%`, minWidth: progress > 0 ? '8px' : 0 }}
                      ></div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-medium mb-2 forensic-info text-blue-700">This analysis will check:</h4>
                      <ul className="list-disc pl-6 text-sm text-slate-700 dark:text-slate-300">
                        <li>Logo Authenticity: Verifies if the logo matches official brand sources.</li>
                        <li>Template Structure: Checks for standard invoice fields and layout consistency.</li>
                        <li>Image Anomaly Detection: Detects digital tampering or suspicious artifacts.</li>
                        <li>Company Detail Verification: Confirms business details using public sources.</li>
                        <li>Price Analysis: Flags overpriced items and compares to market rates.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show results when analysis is done (no progress bar, no complete card) */}
            {analysisData && !isAnalyzing && (
              <AnalysisResults data={analysisData} />
            )}

            {!uploadedFile && !isAnalyzing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Ready for Forensic Analysis
                    </h3>
                    <p className="text-slate-600">
                      Upload a document to begin comprehensive fraud detection and verification
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
