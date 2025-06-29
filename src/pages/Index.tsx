import React, { useState } from 'react';
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
  const [analysisStep, setAnalysisStep] = useState(0);
  const { toast } = useToast();

  const analysisSteps = [
    'Document Type Detection',
    'Logo Authenticity Check',
    'Template Structure Analysis',
    'Image Anomaly Detection',
    'Company Detail Verification',
    'Price Analysis'
  ];

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAnalysisData(null);
    startAnalysis(file);
  };

  const startAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

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
        setAnalysisStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Call Gemini service for real analysis
      const geminiResult: GeminiAnalysisResult = await geminiService.analyzeDocument(file);
      
      // Convert Gemini result to our AnalysisData format
      const analysisResult: AnalysisData = {
        document_type: (geminiResult.document_type as 'invoice' | 'receipt' | 'unknown') || 'unknown',
        logo_verification: {
          status: geminiResult.logo_verification.status === 'suspicious' ? 'unverified' : 
                  geminiResult.logo_verification.status === 'unknown' ? 'not_found' : 
                  'verified',
          company_name: geminiResult.logo_verification.company_name || '',
          logo_url_checked: null,
          confidence_score: geminiResult.logo_verification.confidence_score,
          notes: geminiResult.logo_verification.notes
        },
        template_check: {
          standard_format: geminiResult.template_check.standard_format,
          missing_fields: geminiResult.template_check.missing_fields,
          confidence_score: geminiResult.template_check.confidence_score
        },
        anomaly_detection: {
          tampering_detected: geminiResult.anomaly_detection.tampering_detected,
          suspicious_regions: geminiResult.anomaly_detection.suspicious_regions,
          confidence_score: geminiResult.anomaly_detection.confidence_score
        },
        company_verification: {
          status: geminiResult.company_verification.status === 'suspicious' ? 'inconclusive' : 
                  geminiResult.company_verification.status === 'unknown' ? 'inconclusive' : 
                  'verified',
          matched: geminiResult.company_verification.matched,
          website_checked: geminiResult.company_verification.website_checked || ''
        },
        price_check: {
          items_reviewed: geminiResult.price_check.items_reviewed.map(item => ({
            ...item,
            status: item.status === 'suspicious' ? 'inflated' : item.status as 'valid' | 'inflated'
          })),
          total_overpricing: geminiResult.price_check.total_overpricing,
          overall_status: geminiResult.price_check.overall_status === 'fraudulent' ? 'suspicious' : 
                         geminiResult.price_check.overall_status as 'valid' | 'suspicious'
        },
        risk_assessment: {
          fraud_score: geminiResult.risk_assessment.fraud_score,
          risk_level: geminiResult.risk_assessment.risk_level,
          final_decision: geminiResult.risk_assessment.fraud_score > 70 ? 'Reject' : 
                         geminiResult.risk_assessment.fraud_score > 30 ? 'Review Manually' : 'Accept'
        },
        summary: geminiResult.summary
      };

      setAnalysisData(analysisResult);
      
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
                    <div className="text-sm text-slate-600">
                      Current Step: {analysisSteps[analysisStep]}
                    </div>
                    <Progress value={(analysisStep / (analysisSteps.length - 1)) * 100} className="w-full" />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {analysisSteps.map((step, index) => (
                        <div
                          key={step}
                          className={`flex items-center space-x-2 ${
                            index < analysisStep
                              ? 'text-green-600'
                              : index === analysisStep
                              ? 'text-blue-600 font-medium'
                              : 'text-slate-400'
                          }`}
                        >
                          {index < analysisStep ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : index === analysisStep ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
