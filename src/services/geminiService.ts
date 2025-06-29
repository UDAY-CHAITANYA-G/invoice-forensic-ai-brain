import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_FORENSIC_PROMPT } from './geminiPrompt';

export interface GeminiAnalysisResult {
  document_type: string;
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

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  private initializeGemini() {
    if (!this.genAI) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY not configured');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  private getForensicAnalysisPrompt(): string {
    return GEMINI_FORENSIC_PROMPT;
  }

  private createDefaultAnalysisResult(): GeminiAnalysisResult {
    return {
      document_type: 'unknown',
      logo_verification: {
        status: 'inconclusive',
        company_name: '',
        logo_url_checked: null,
        confidence_score: 0,
        detail_summary: {
          logo_present: false,
          logo_verified_online: false,
          logo_consistent: false,
          requires_user_input: true,
          reason: 'Analysis incomplete - requires manual review'
        }
      },
      template_check: {
        standard_format: false,
        missing_fields: [],
        confidence_score: 0,
        detail_summary: {
          all_required_fields_present: false,
          fields_with_issues: [],
          has_layout_irregularities: false,
          concerns: ['Analysis incomplete']
        }
      },
      anomaly_detection: {
        tampering_detected: false,
        suspicious_regions: [],
        confidence_score: 0,
        detail_summary: {
          digital_artifacts_found: false,
          asymmetric_layout: false,
          metadata_flags: false,
          requires_deep_image_analysis: true,
          reason: 'Analysis incomplete - requires manual review'
        }
      },
      company_verification: {
        status: 'inconclusive',
        matched: null,
        website_checked: null,
        detail_summary: {
          name_match_found: false,
          address_verified: false,
          gstin_verified: false,
          lookup_source: 'none',
          reason: 'Analysis incomplete'
        }
      },
      price_check: {
        items_reviewed: [],
        total_overpricing: 0,
        overall_status: 'inconclusive',
        detail_summary: {
          overpriced_items_count: 0,
          price_check_possible: false,
          benchmark_source: null,
          requires_manual_validation: true
        }
      },
      risk_assessment: {
        fraud_score: 50, // Default to medium risk when analysis is incomplete
        risk_level: 'Medium',
        final_decision: 'Review Manually',
        detail_summary: {
          overall_verification_pending: true,
          key_failures: ['incomplete_analysis'],
          confidence_limitations: true,
          action_recommended: 'Manual review required due to incomplete analysis'
        }
      },
      summary: 'Analysis incomplete - manual review required'
    };
  }

  private parsePartialResponse(text: string): Partial<GeminiAnalysisResult> {
    try {
      // Clean the response text
      const cleaned = text.replace(/^```json|^```|```$/gm, '').trim();
      const parsed = JSON.parse(cleaned);
      
      // Handle different response formats
      if (parsed.items_reviewed) {
        // If we only get price_check data
        return {
          price_check: {
            items_reviewed: parsed.items_reviewed.map((item: any) => ({
              item_name: item.item_name || 'Unknown Item',
              quantity: item.quantity || 1,
              invoice_price: item.invoice_price || 0,
              estimated_market_price: item.estimated_market_price,
              margin_percentage: item.margin_percentage,
              status: item.status || 'inconclusive'
            })),
            total_overpricing: parsed.total_overpricing || 0,
            overall_status: parsed.overall_status || 'inconclusive',
            detail_summary: {
              overpriced_items_count: parsed.items_reviewed?.filter((item: any) => item.status === 'inflated').length || 0,
              price_check_possible: parsed.items_reviewed?.some((item: any) => item.estimated_market_price !== null) || false,
              benchmark_source: null,
              requires_manual_validation: true
            }
          }
        };
      }
      
      // If we get a complete response, return it as is
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return {};
    }
  }

  async analyzeDocument(file: File): Promise<GeminiAnalysisResult> {
    try {
      this.initializeGemini();
      
      // Convert file to base64 for Gemini
      const base64Data = await this.fileToBase64(file);
      
      // Create the prompt with the document
      const prompt = this.getForensicAnalysisPrompt();
      
      // Generate content with the image
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text().trim();
      
      // Parse the response and merge with defaults
      const partialResult = this.parsePartialResponse(text);
      const defaultResult = this.createDefaultAnalysisResult();
      
      // Merge partial results with defaults
      const finalResult: GeminiAnalysisResult = {
        ...defaultResult,
        ...partialResult,
        // Ensure nested objects are properly merged
        logo_verification: {
          ...defaultResult.logo_verification,
          ...partialResult.logo_verification
        },
        template_check: {
          ...defaultResult.template_check,
          ...partialResult.template_check
        },
        anomaly_detection: {
          ...defaultResult.anomaly_detection,
          ...partialResult.anomaly_detection
        },
        company_verification: {
          ...defaultResult.company_verification,
          ...partialResult.company_verification
        },
        price_check: {
          ...defaultResult.price_check,
          ...partialResult.price_check
        },
        risk_assessment: {
          ...defaultResult.risk_assessment,
          ...partialResult.risk_assessment
        }
      };

      return finalResult;
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      // Return default result on error
      return this.createDefaultAnalysisResult();
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

export const geminiService = new GeminiService(); 