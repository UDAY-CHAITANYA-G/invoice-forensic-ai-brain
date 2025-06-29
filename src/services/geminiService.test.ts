// Simple test file to verify Gemini service setup
import { geminiService } from './geminiService';

// Test function to verify service initialization
export const testGeminiService = () => {
  console.log('Gemini Service Test:');
  console.log('- Service initialized:', !!geminiService);
  console.log('- API Key configured:', !!process.env.VITE_GEMINI_API_KEY);
  
  if (!process.env.VITE_GEMINI_API_KEY) {
    console.warn('⚠️  VITE_GEMINI_API_KEY not found in environment variables');
    console.log('Please create a .env file with: VITE_GEMINI_API_KEY=your_api_key');
  } else {
    console.log('✅ API Key is configured');
  }
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testGeminiService = testGeminiService;
} 