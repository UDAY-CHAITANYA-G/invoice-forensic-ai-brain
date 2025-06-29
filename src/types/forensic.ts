
export interface AnalysisData {
  document_type: 'invoice' | 'receipt' | 'unknown';
  logo_verification: {
    status: 'verified' | 'unverified' | 'not_found';
    company_name: string;
    logo_url_checked: string | null;
    confidence_score: number;
    notes: string;
  };
  template_check: {
    standard_format: boolean;
    missing_fields: string[];
    confidence_score: number;
  };
  anomaly_detection: {
    tampering_detected: boolean;
    suspicious_regions: string[];
    confidence_score: number;
  };
  company_verification: {
    status: 'verified' | 'unverified' | 'inconclusive';
    matched: boolean;
    website_checked: string | null;
  };
  price_check: {
    items_reviewed: Array<{
      item_name: string;
      quantity: number;
      invoice_price: number;
      estimated_market_price: number;
      margin_percentage: number;
      status: 'valid' | 'inflated';
    }>;
    total_overpricing: number;
    overall_status: 'valid' | 'suspicious';
  };
  risk_assessment: {
    fraud_score: number;
    risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
    final_decision: 'Accept' | 'Review Manually' | 'Reject';
  };
  summary: string;
}
