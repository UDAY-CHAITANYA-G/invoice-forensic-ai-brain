# Forensic Document Analyzer

A professional fraud detection and verification system that uses AI-powered forensic analysis to detect fraudulent invoices and receipts.

## Features

- **AI-Powered Analysis**: Integrated with Google Gemini AI for real-time document analysis
- **Comprehensive Forensics**: Logo authenticity, template structure, anomaly detection
- **Price Analysis**: Market comparison and fraud detection
- **Risk Assessment**: Automated fraud scoring and recommendations
- **Modern UI**: Built with React, TypeScript, and shadcn/ui

## AI Integration

This project integrates with **Google Gemini AI** for advanced document analysis:

- Real-time document processing
- Intelligent fraud detection
- Comprehensive forensic analysis
- Structured JSON output

**Setup Required**: See [GEMINI_SETUP.md](./GEMINI_SETUP.md) for detailed setup instructions.

## Quick Start

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd invoice-forensic-ai-brain

# Install dependencies
npm install

# Set up Gemini API key (see GEMINI_SETUP.md)
# Create .env file with: VITE_GEMINI_API_KEY=your_api_key

# Start development server
npm run dev
```

## Technologies

- **Frontend**: React, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS
- **AI**: Google Gemini AI
- **State Management**: React Query

## Project Structure

```
src/
├── components/          # UI components
├── services/           # API services (Gemini integration)
├── pages/              # Page components
├── types/              # TypeScript definitions
└── hooks/              # Custom React hooks
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/62b82d0a-ee5d-438c-a9eb-cd4ebba5ba2a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/62b82d0a-ee5d-438c-a9eb-cd4ebba5ba2a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
