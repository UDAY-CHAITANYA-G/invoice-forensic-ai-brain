
import React from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Download, Eye, IndianRupee, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnalysisData } from '@/types/forensic';
import jsPDF from 'jspdf';

interface AnalysisResultsProps {
  data: AnalysisData;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'verified') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === false || status === 'unverified') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleExportReport = () => {
    const reportData = {
      analysis: data,
      generated_at: new Date().toISOString(),
      report_id: `FR-${Date.now()}`
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF();
    const reportId = `FR-${Date.now()}`;
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Forensic Document Analysis Report', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Report ID: ${reportId}`, 20, 35);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
    
    // Risk Assessment
    pdf.setFontSize(16);
    pdf.text('Risk Assessment', 20, 65);
    pdf.setFontSize(12);
    pdf.text(`Risk Level: ${data.risk_assessment.risk_level}`, 20, 80);
    pdf.text(`Fraud Score: ${data.risk_assessment.fraud_score}/100`, 20, 90);
    pdf.text(`Decision: ${data.risk_assessment.final_decision}`, 20, 100);
    
    // Summary
    pdf.setFontSize(14);
    pdf.text('Analysis Summary', 20, 120);
    pdf.setFontSize(10);
    const summaryLines = pdf.splitTextToSize(data.summary, 170);
    pdf.text(summaryLines, 20, 135);
    
    let yPosition = 135 + (summaryLines.length * 5) + 15;
    
    // Logo Verification
    pdf.setFontSize(14);
    pdf.text('Logo Verification', 20, yPosition);
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.text(`Company: ${data.logo_verification.company_name}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Status: ${data.logo_verification.status}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Confidence: ${(data.logo_verification.confidence_score * 100).toFixed(1)}%`, 20, yPosition);
    yPosition += 20;
    
    // Company Verification
    pdf.setFontSize(14);
    pdf.text('Company Verification', 20, yPosition);
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.text(`Status: ${data.company_verification.status}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Match Found: ${data.company_verification.matched ? 'Yes' : 'No'}`, 20, yPosition);
    yPosition += 20;
    
    // Price Analysis
    pdf.setFontSize(14);
    pdf.text('Price Analysis', 20, yPosition);
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.text(`Overall Status: ${data.price_check.overall_status}`, 20, yPosition);
    yPosition += 10;
    
    if (data.price_check.total_overpricing > 0) {
      pdf.text(`Total Overpricing: ${formatIndianCurrency(data.price_check.total_overpricing)}`, 20, yPosition);
      yPosition += 15;
    }
    
    // Items table
    pdf.text('Items Reviewed:', 20, yPosition);
    yPosition += 10;
    
    data.price_check.items_reviewed.forEach((item, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`${index + 1}. ${item.item_name}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`   Quantity: ${item.quantity}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`   Invoice Price: ${formatIndianCurrency(item.invoice_price)}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`   Market Price: ${formatIndianCurrency(item.estimated_market_price)}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`   Margin: ${item.margin_percentage.toFixed(1)}%`, 25, yPosition);
      yPosition += 8;
      pdf.text(`   Status: ${item.status}`, 25, yPosition);
      yPosition += 15;
    });
    
    // Template Check
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(14);
    pdf.text('Template Structure', 20, yPosition);
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.text(`Format: ${data.template_check.standard_format ? 'Standard' : 'Non-standard'}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Confidence: ${(data.template_check.confidence_score * 100).toFixed(1)}%`, 20, yPosition);
    yPosition += 20;
    
    // Anomaly Detection
    pdf.setFontSize(14);
    pdf.text('Anomaly Detection', 20, yPosition);
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.text(`Tampering Detected: ${data.anomaly_detection.tampering_detected ? 'Yes' : 'No'}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Confidence: ${(data.anomaly_detection.confidence_score * 100).toFixed(1)}%`, 20, yPosition);
    
    // Save the PDF
    pdf.save(`forensic-report-${reportId}.pdf`);
  };

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment Overview */}
      <Card className={`border-2 ${getRiskColor(data.risk_assessment.risk_level)}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Risk Assessment</span>
            <Badge variant="outline" className={getRiskColor(data.risk_assessment.risk_level)}>
              {data.risk_assessment.risk_level} Risk
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Fraud Score</span>
                <span className="text-2xl font-bold">{data.risk_assessment.fraud_score}/100</span>
              </div>
              <Progress value={data.risk_assessment.fraud_score} className="h-3" />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Summary</h4>
              <p className="text-sm text-slate-700">{data.summary}</p>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <span className="text-sm text-slate-600">Recommended Action: </span>
                <span className="font-medium">{data.risk_assessment.final_decision}</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={handleExportReport} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(data.logo_verification.status === 'verified')}
              <span>Logo Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600">Company: </span>
                <span className="font-medium">{data.logo_verification.company_name}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600">Confidence: </span>
                <span className="font-medium">{(data.logo_verification.confidence_score * 100).toFixed(1)}%</span>
              </div>
              <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                {data.logo_verification.notes}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(data.template_check.standard_format)}
              <span>Template Structure</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600">Format: </span>
                <span className="font-medium">
                  {data.template_check.standard_format ? 'Standard' : 'Non-standard'}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-600">Confidence: </span>
                <span className="font-medium">{(data.template_check.confidence_score * 100).toFixed(1)}%</span>
              </div>
              {data.template_check.missing_fields.length > 0 && (
                <div>
                  <span className="text-sm text-slate-600">Missing Fields: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.template_check.missing_fields.map((field) => (
                      <Badge key={field} variant="destructive" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(!data.anomaly_detection.tampering_detected)}
              <span>Anomaly Detection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600">Tampering: </span>
                <span className="font-medium">
                  {data.anomaly_detection.tampering_detected ? 'Detected' : 'None Detected'}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-600">Confidence: </span>
                <span className="font-medium">{(data.anomaly_detection.confidence_score * 100).toFixed(1)}%</span>
              </div>
              {data.anomaly_detection.suspicious_regions.length > 0 && (
                <div>
                  <span className="text-sm text-slate-600">Suspicious Regions: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.anomaly_detection.suspicious_regions.map((region) => (
                      <Badge key={region} variant="destructive" className="text-xs">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(data.company_verification.status === 'verified')}
              <span>Company Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600">Status: </span>
                <span className="font-medium capitalize">{data.company_verification.status}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600">Match Found: </span>
                <span className="font-medium">{data.company_verification.matched ? 'Yes' : 'No'}</span>
              </div>
              {data.company_verification.website_checked && (
                <div>
                  <span className="text-sm text-slate-600">Website: </span>
                  <a 
                    href={data.company_verification.website_checked} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {data.company_verification.website_checked}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(data.price_check.overall_status === 'valid')}
            <IndianRupee className="h-5 w-5" />
            <span>Price Analysis</span>
            <Badge 
              variant={data.price_check.overall_status === 'valid' ? 'default' : 'destructive'}
            >
              {data.price_check.overall_status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.price_check.total_overpricing > 0 && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <span className="text-sm text-red-800">
                  Total Overpricing Detected: <span className="font-bold">{formatIndianCurrency(data.price_check.total_overpricing)}</span>
                </span>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Invoice Price</th>
                    <th className="text-right py-2">Market Price</th>
                    <th className="text-right py-2">Margin</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.price_check.items_reviewed.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{item.item_name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatIndianCurrency(item.invoice_price)}</td>
                      <td className="text-right py-2">{formatIndianCurrency(item.estimated_market_price)}</td>
                      <td className="text-right py-2">{item.margin_percentage.toFixed(1)}%</td>
                      <td className="text-center py-2">
                        <Badge 
                          variant={item.status === 'valid' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
