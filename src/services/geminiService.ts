import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiAnalysisResult {
  document_type: string;
  logo_verification: {
    status: 'verified' | 'suspicious' | 'unknown';
    company_name?: string;
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
    status: 'verified' | 'suspicious' | 'unknown';
    matched: boolean;
    website_checked?: string;
  };
  price_check: {
    items_reviewed: Array<{
      item_name: string;
      quantity: number;
      invoice_price: number;
      estimated_market_price: number;
      margin_percentage: number;
      status: 'valid' | 'inflated' | 'suspicious';
    }>;
    total_overpricing: number;
    overall_status: 'valid' | 'suspicious' | 'fraudulent';
  };
  risk_assessment: {
    fraud_score: number;
    risk_level: 'Low' | 'Medium' | 'High';
    final_decision: string;
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
    return `You are a forensic document analysis expert specializing in invoice and receipt fraud detection. 

Analyze the uploaded document and provide a comprehensive forensic analysis in the following JSON format:

{
  "document_type": "invoice|receipt|other",
  "logo_verification": {
    "status": "verified|suspicious|unknown",
    "company_name": "extracted company name",
    "confidence_score": 0.0-1.0,
    "notes": "detailed analysis of logo authenticity"
  },
  "template_check": {
    "standard_format": true/false,
    "missing_fields": ["list of missing standard fields"],
    "confidence_score": 0.0-1.0
  },
  "anomaly_detection": {
    "tampering_detected": true/false,
    "suspicious_regions": ["list of suspicious areas"],
    "confidence_score": 0.0-1.0
  },
  "company_verification": {
    "status": "verified|suspicious|unknown",
    "matched": true/false,
    "website_checked": "company website if found"
  },
  "price_check": {
    "items_reviewed": [
      {
        "item_name": "item name",
        "quantity": number,
        "invoice_price": number,
        "estimated_market_price": number,
        "margin_percentage": number,
        "status": "valid|inflated|suspicious"
      }
    ],
    "total_overpricing": number,
    "overall_status": "valid|suspicious|fraudulent"
  },
  "risk_assessment": {
    "fraud_score": 0-100,
    "risk_level": "Low|Medium|High",
    "final_decision": "recommendation"
  },
  "summary": "comprehensive analysis summary"
}

Focus on:
1. Logo authenticity and company verification
2. Template structure and missing fields
3. Visual anomalies and potential tampering
4. Price analysis and market comparison
5. Overall fraud risk assessment

Provide accurate, detailed analysis with confidence scores.`;
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
      
      // Parse the JSON response
      try {
        const cleaned = text.replace(/^```json|^```|```$/gm, '').trim();
        const analysisResult = JSON.parse(cleaned);        
        const cleanedItems = analysisResult.price_check.items_reviewed.map(item => ({
          ...item,
          margin_percentage: typeof item.margin_percentage === 'number' && item.margin_percentage !== null
            ? item.margin_percentage.toFixed(2)
            : String(item.margin_percentage),
          estimated_market_price: typeof item.estimated_market_price === 'number'
            ? item.estimated_market_price
            : null,
        }));
        analysisResult.price_check.items_reviewed = cleanedItems;
        return analysisResult as GeminiAnalysisResult;
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        throw new Error('Invalid response format from Gemini');
      }
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      throw new Error('Document analysis failed');
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