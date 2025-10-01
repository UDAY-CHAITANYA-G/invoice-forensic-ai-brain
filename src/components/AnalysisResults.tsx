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

    // Header with color background
    pdf.setFillColor(34, 58, 120); // Deep blue
    pdf.rect(0, 0, 210, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Forensic Document Analysis Report', 105, 17, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Report ID: ${reportId}`, 10, 32);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 40);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    let yPosition = 48;

    // Section: Risk Assessment
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Assessment', 10, yPosition);
    yPosition += 8;
    pdf.setDrawColor(34, 58, 120);
    pdf.setLineWidth(0.8);
    pdf.line(10, yPosition, 200, yPosition);
    yPosition += 6;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Risk Level: ${data.risk_assessment.risk_level}`, 10, yPosition);
    yPosition += 7;
    pdf.text(`Fraud Score: ${data.risk_assessment.fraud_score}/100`, 10, yPosition);
    yPosition += 7;
    pdf.text(`Decision: ${data.risk_assessment.final_decision}`, 10, yPosition);
    yPosition += 10;

    // Section: Analysis Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Analysis Summary', 10, yPosition);
    yPosition += 7;
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.5);
    pdf.line(10, yPosition, 200, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const summaryLines = pdf.splitTextToSize(data.summary, 190);
    pdf.text(summaryLines, 10, yPosition);
    yPosition += summaryLines.length * 5 + 8;

    // Section: Logo Verification
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Logo Verification', 10, yPosition);
    yPosition += 7;
    pdf.setDrawColor(180, 180, 180);
    pdf.line(10, yPosition, 200, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Company: ${data.logo_verification.company_name}`, 10, yPosition);
    yPosition += 5;
    pdf.text(`Status: ${data.logo_verification.status}`, 10, yPosition);
    yPosition += 5;
    pdf.text(`Confidence: ${(data.logo_verification.confidence_score * 100).toFixed(1)}%`, 10, yPosition);
    yPosition += 10;

    // Section: Company Verification
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Company Verification', 10, yPosition);
    yPosition += 7;
    pdf.setDrawColor(180, 180, 180);
    pdf.line(10, yPosition, 200, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Status: ${data.company_verification.status}`, 10, yPosition);
    yPosition += 5;
    pdf.text(`Match Found: ${data.company_verification.matched ? 'Yes' : 'No'}`, 10, yPosition);
    yPosition += 10;

    // Section: Price Analysis
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Price Analysis', 10, yPosition);
    yPosition += 7;
    pdf.setDrawColor(180, 180, 180);
    pdf.line(10, yPosition, 200, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Overall Status: ${data.price_check.overall_status}`, 10, yPosition);
    yPosition += 5;
    if (data.price_check.total_overpricing > 0) {
      pdf.text(`Total Overpricing: ${formatIndianCurrency(data.price_check.total_overpricing)}`, 10, yPosition);
      yPosition += 7;
    }
    pdf.text('Items Reviewed:', 10, yPosition);
    yPosition += 6;
    data.price_check.items_reviewed.forEach((item, index) => {
      if (yPosition > 260) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${item.item_name}`, 15, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition += 5;
      pdf.text(`   Quantity: ${item.quantity}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`   Invoice Price: ${formatIndianCurrency(item.invoice_price)}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`   Market Price: ${formatIndianCurrency(item.estimated_market_price)}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`   Margin: ${typeof item.margin_percentage === 'number' && item.margin_percentage > 50 ? 'forensic-suspicious' : 'forensic-verified'}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`   Status: ${item.status}`, 15, yPosition);
      yPosition += 7;
    });
    yPosition += 3;

    // Section: Template Structure
    if (yPosition > 230) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Template Structure', 10, yPosition);
    yPosition += 7;
    pdf.setDrawColor(180, 180, 180);
    pdf.line(10, yPosition, 200, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Format: ${data.template_check.standard_format ? 'Standard' : 'Non-standard'}`, 10, yPosition);
    yPosition += 5;
    pdf.text(`Confidence: ${(data.template_check.confidence_score * 100).toFixed(1)}%`, 10, yPosition);
    yPosition += 10;

    // Section: Anomaly Detection
    if (yPosition > 230) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Anomaly Detection', 10, yPosition);
    yPosition += 7;
    pdf.setDrawColor(180, 180, 180);
    pdf.line(10, yPosition, 200, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Tampering Detected: ${data.anomaly_detection.tampering_detected ? 'Yes' : 'No'}`, 10, yPosition);
    yPosition += 5;
    pdf.text(`Confidence: ${(data.anomaly_detection.confidence_score * 100).toFixed(1)}%`, 10, yPosition);
    yPosition += 10;

    // Footer with page number and branding
    const pageCount = pdf.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Page ${i} of ${pageCount}`, 200, 292, { align: 'right' });
      pdf.text('Generated by Forensic Document Analyzer', 10, 292);
    }

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
                      <td className={`text-right py-2 ${typeof item.margin_percentage === 'number' && item.margin_percentage > 50 ? 'forensic-suspicious' : 'forensic-verified'}`}>
                        {Number.isFinite(item.margin_percentage)
                          ? item.margin_percentage.toFixed(1) + '%'
                          : String(item.margin_percentage)}
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
