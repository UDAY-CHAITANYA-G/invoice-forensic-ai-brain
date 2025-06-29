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
      case 'Low': return 'bg-forensic-success border-2 border-forensic-success/30';
      case 'Medium': return 'bg-forensic-warning border-2 border-forensic-warning/30';
      case 'High': return 'bg-forensic-suspicious border-2 border-forensic-suspicious/30';
      case 'Critical': return 'bg-forensic-critical border-2 border-forensic-critical/30';
      default: return 'bg-forensic-neutral border-2 border-forensic-neutral/30';
    }
  };

  const getRiskTextColor = (level: string) => {
    switch (level) {
      case 'Low': return 'forensic-success';
      case 'Medium': return 'forensic-warning';
      case 'High': return 'forensic-suspicious';
      case 'Critical': return 'forensic-critical';
      default: return 'forensic-neutral';
    }
  };

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'verified') {
      return <CheckCircle className="h-5 w-5 forensic-verified" />;
    } else if (status === false || status === 'unverified') {
      return <XCircle className="h-5 w-5 forensic-danger" />;
    } else {
      return <AlertTriangle className="h-5 w-5 forensic-warning" />;
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
      <Card className={getRiskColor(data.risk_assessment.risk_level)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className={`h-6 w-6 ${getRiskTextColor(data.risk_assessment.risk_level)}`} />
            <span>Risk Assessment</span>
            <Badge variant="outline" className={`${getRiskTextColor(data.risk_assessment.risk_level)} border-current`}>
              {data.risk_assessment.risk_level} Risk
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Fraud Score</span>
                <span className={`text-2xl font-bold ${getRiskTextColor(data.risk_assessment.risk_level)}`}>
                  {data.risk_assessment.fraud_score}/100
                </span>
              </div>
              <Progress value={data.risk_assessment.fraud_score} className="h-3" />
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="font-medium mb-2 forensic-info">Analysis Summary</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">{data.summary}</p>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Recommended Action: </span>
                <span className={`font-medium ${getRiskTextColor(data.risk_assessment.risk_level)}`}>
                  {data.risk_assessment.final_decision}
                </span>
              </div>
              <div className="flex space-x-2">
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
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(data.logo_verification.status === 'verified')}
              <span>Logo Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Company: </span>
                <span className="font-medium forensic-info">{data.logo_verification.company_name}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Confidence: </span>
                <span className="font-medium">{(data.logo_verification.confidence_score * 100).toFixed(1)}%</span>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                {data.logo_verification.notes}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Check */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(data.template_check.standard_format)}
              <span>Template Structure</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Format: </span>
                <span className={`font-medium ${data.template_check.standard_format ? 'forensic-verified' : 'forensic-warning'}`}>
                  {data.template_check.standard_format ? 'Standard' : 'Non-standard'}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Confidence: </span>
                <span className="font-medium">{(data.template_check.confidence_score * 100).toFixed(1)}%</span>
              </div>
              {data.template_check.missing_fields.length > 0 && (
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Missing Fields: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.template_check.missing_fields.map((field) => (
                      <Badge key={field} variant="destructive" className="text-xs bg-forensic-danger">
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
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(!data.anomaly_detection.tampering_detected)}
              <span>Anomaly Detection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Tampering: </span>
                <span className={`font-medium ${data.anomaly_detection.tampering_detected ? 'forensic-danger' : 'forensic-verified'}`}>
                  {data.anomaly_detection.tampering_detected ? 'Detected' : 'None Detected'}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Confidence: </span>
                <span className="font-medium">{(data.anomaly_detection.confidence_score * 100).toFixed(1)}%</span>
              </div>
              {data.anomaly_detection.suspicious_regions.length > 0 && (
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Suspicious Regions: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.anomaly_detection.suspicious_regions.map((region) => (
                      <Badge key={region} variant="destructive" className="text-xs bg-forensic-suspicious">
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
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(data.company_verification.status === 'verified')}
              <span>Company Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status: </span>
                <span className={`font-medium capitalize ${data.company_verification.status === 'verified' ? 'forensic-verified' : 'forensic-warning'}`}>
                  {data.company_verification.status}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Match Found: </span>
                <span className={`font-medium ${data.company_verification.matched ? 'forensic-verified' : 'forensic-danger'}`}>
                  {data.company_verification.matched ? 'Yes' : 'No'}
                </span>
              </div>
              {data.company_verification.website_checked && (
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Website: </span>
                  <a 
                    href={data.company_verification.website_checked} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="forensic-info hover:underline text-sm"
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
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(data.price_check.overall_status === 'valid')}
            <IndianRupee className="h-5 w-5 forensic-info" />
            <span>Price Analysis</span>
            <Badge 
              variant={data.price_check.overall_status === 'valid' ? 'default' : 'destructive'}
              className={data.price_check.overall_status === 'valid' ? 'bg-forensic-verified' : 'bg-forensic-danger'}
            >
              {data.price_check.overall_status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.price_check.total_overpricing > 0 && (
              <div className="bg-forensic-danger p-3 rounded-lg border border-forensic-danger/30">
                <span className="text-sm forensic-danger">
                  Total Overpricing Detected: <span className="font-bold">{formatIndianCurrency(data.price_check.total_overpricing)}</span>
                </span>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 forensic-info">Item</th>
                    <th className="text-center py-2 forensic-info">Qty</th>
                    <th className="text-right py-2 forensic-info">Invoice Price</th>
                    <th className="text-right py-2 forensic-info">Market Price</th>
                    <th className="text-right py-2 forensic-info">Margin</th>
                    <th className="text-center py-2 forensic-info">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.price_check.items_reviewed.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 font-medium">{item.item_name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatIndianCurrency(item.invoice_price)}</td>
                      <td className="text-right py-2">{formatIndianCurrency(item.estimated_market_price)}</td>
                      <td className={`text-right py-2 ${item.margin_percentage > 50 ? 'forensic-suspicious' : 'forensic-verified'}`}>
                        {item.margin_percentage.toFixed(1)}%
                      </td>
                      <td className="text-center py-2">
                        <Badge 
                          variant={item.status === 'valid' ? 'default' : 'destructive'}
                          className={`text-xs ${item.status === 'valid' ? 'bg-forensic-verified' : 'bg-forensic-danger'}`}
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
