export interface AnalysisData {
  document_type: 'invoice' | 'receipt' | 'unknown';
  logo_verification: {
    status: 'verified' | 'unverified' | 'not_found' | 'inconclusive';
    company_name: string;
    logo_url_checked: string | null;
    confidence_score: number;
    detail_summary: {
      logo_present: boolean;
      logo_verified_online: boolean;
      logo_consistent: boolean;
      requires_user_input: boolean;
      reason: string;
    };
  };
  template_check: {
    standard_format: boolean;
    missing_fields: string[];
    confidence_score: number;
    detail_summary: {
      all_required_fields_present: boolean;
      fields_with_issues: string[];
      has_layout_irregularities: boolean;
      concerns: string[];
    };
  };
  anomaly_detection: {
    tampering_detected: boolean;
    suspicious_regions: string[];
    confidence_score: number;
    detail_summary: {
      digital_artifacts_found: boolean;
      asymmetric_layout: boolean;
      metadata_flags: boolean;
      requires_deep_image_analysis: boolean;
      reason: string;
    };
  };
  company_verification: {
    status: 'verified' | 'unverified' | 'inconclusive';
    matched: boolean | null;
    website_checked: string | null;
    detail_summary: {
      name_match_found: boolean;
      address_verified: boolean;
      gstin_verified: boolean;
      lookup_source: string;
      reason: string;
    };
  };
  price_check: {
    items_reviewed: Array<{
      item_name: string;
      quantity: number;
      invoice_price: number;
      estimated_market_price: number | null;
      margin_percentage: number | null;
      status: 'valid' | 'inflated' | 'inconclusive';
    }>;
    total_overpricing: number;
    overall_status: 'valid' | 'suspicious' | 'inconclusive';
    detail_summary: {
      overpriced_items_count: number;
      price_check_possible: boolean;
      benchmark_source: string | null;
      requires_manual_validation: boolean;
    };
  };
  risk_assessment: {
    fraud_score: number;
    risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
    final_decision: 'Accept' | 'Review Manually' | 'Reject';
    detail_summary: {
      overall_verification_pending: boolean;
      key_failures: string[];
      confidence_limitations: boolean;
      action_recommended: string;
    };
  };
  summary: string;
}
