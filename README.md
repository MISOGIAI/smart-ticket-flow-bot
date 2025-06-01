# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/643ed48a-baa5-4c3d-90a9-63866ed81eb0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/643ed48a-baa5-4c3d-90a9-63866ed81eb0) and start prompting.

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

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase for authentication and database
- OpenAI API for AI-powered pattern detection

## Environment Variables

For the application to work correctly, you need to set up the following environment variables in a `.env` file:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI API Key for Pattern Detection
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## Pattern Detection Feature

The application includes an AI-powered pattern detection system that helps support agents identify:

1. **Repetitive Work Patterns** - Identifies common issues that could benefit from automation or knowledge base articles
2. **Misuse Patterns** - Detects potential security concerns or policy violations specific to each department

This feature is accessible only to users with the 'support_agent' or 'manager' role, and analyzes tickets within their specific department.

To use this feature:
- Log in as a support agent
- Click on "Open Pattern Detection" from the dashboard
- Select the desired timeframe (7, 30, or 90 days)
- Click "Run Analysis" to generate insights

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/643ed48a-baa5-4c3d-90a9-63866ed81eb0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
