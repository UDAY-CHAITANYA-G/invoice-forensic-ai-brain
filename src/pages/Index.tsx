
import React, { useState } from 'react';
import { Upload, FileText, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentPreview from '@/components/DocumentPreview';
import AnalysisResults from '@/components/AnalysisResults';
import { AnalysisData } from '@/types/forensic';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

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

    // Simulate forensic analysis process
    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Mock analysis results
    const mockResults: AnalysisData = {
      document_type: 'invoice',
      logo_verification: {
        status: 'verified',
        company_name: 'TechCorp Solutions',
        logo_url_checked: null,
        confidence_score: 0.92,
        notes: 'Logo matches known database entries'
      },
      template_check: {
        standard_format: true,
        missing_fields: [],
        confidence_score: 0.95
      },
      anomaly_detection: {
        tampering_detected: false,
        suspicious_regions: [],
        confidence_score: 0.88
      },
      company_verification: {
        status: 'verified',
        matched: true,
        website_checked: 'https://techcorp-solutions.com'
      },
      price_check: {
        items_reviewed: [
          {
            item_name: 'Software License',
            quantity: 5,
            invoice_price: 299.99,
            estimated_market_price: 279.99,
            margin_percentage: 7.1,
            status: 'valid'
          },
          {
            item_name: 'Support Package',
            quantity: 1,
            invoice_price: 1299.99,
            estimated_market_price: 899.99,
            margin_percentage: 44.4,
            status: 'inflated'
          }
        ],
        total_overpricing: 400.00,
        overall_status: 'suspicious'
      },
      risk_assessment: {
        fraud_score: 35,
        risk_level: 'Medium',
        final_decision: 'Review Manually'
      },
      summary: 'This invoice shows mixed authenticity indicators. While the company verification and template structure appear legitimate, significant price inflation was detected in the support package item, suggesting potential fraudulent activity. Manual review is recommended.'
    };

    setAnalysisData(mockResults);
    setIsAnalyzing(false);
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
