# Gemini MCP Integration Setup

This project now integrates with Google's Gemini AI for real-time document forensic analysis.

## Setup Instructions

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Create a `.env` file in the project root with:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Features

The Gemini integration provides:

- **Real Document Analysis**: Analyzes uploaded PDFs and images using AI
- **Comprehensive Forensics**: Checks logo authenticity, template structure, anomalies
- **Price Analysis**: Compares invoice prices with market estimates
- **Risk Assessment**: Provides fraud scores and recommendations
- **JSON Output**: Structured analysis results for easy processing

### 4. Supported File Types

- PDF documents
- Image files (JPEG, PNG, etc.)

### 5. Analysis Components

1. **Document Type Detection**: Identifies if it's an invoice, receipt, or other
2. **Logo Authenticity Check**: Verifies company logos and branding
3. **Template Structure Analysis**: Checks for standard invoice fields
4. **Image Anomaly Detection**: Finds potential tampering or manipulation
5. **Company Detail Verification**: Validates company information
6. **Price Analysis**: Compares prices with market standards

### 6. Error Handling

The system includes comprehensive error handling for:
- Missing API key configuration
- Network connectivity issues
- Invalid file formats
- Gemini API errors

### 7. Security

- API keys are stored in environment variables (not in code)
- File processing is done client-side
- No documents are stored permanently

## Usage

1. Start the development server: `npm run dev`
2. Upload a document through the web interface
3. The system will automatically analyze the document using Gemini AI
4. View comprehensive forensic analysis results

## Troubleshooting

- **"Configuration Error"**: Make sure your `.env` file has the correct API key
- **"Analysis Failed"**: Check your internet connection and API key validity
- **"Invalid response format"**: The document might not be readable or supported 