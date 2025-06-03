# Smart Ticket Flow Bot

A modern help desk ticket management system with AI-powered features for efficient ticket handling and pattern detection.

## Live Demo

The application is deployed and available at: [https://smart-ticket-flow-bot.onrender.com](https://smart-ticket-flow-bot.onrender.com)

## Features

- **AI-Powered Ticket Management**
  - Smart ticket routing using AI
  - Automated response generation
  - Pattern detection for recurring issues
  - Department-specific AI agents

- **Role-Based Access Control**
  - Employee: Create and track personal tickets
  - Support Agent: Handle department tickets
  - Manager: Department oversight and analytics
  - Super Admin: Full system control

- **Department Management**
  - IT Support
  - HR
  - Facilities
  - Admin

- **Smart Features**
  - AI-powered ticket responses
  - Pattern detection for process improvement
  - Knowledge base integration
  - Real-time analytics
  - Automated ticket routing

## Tech Stack

- **Frontend**
  - React + TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - shadcn/ui for components
  - React Router for navigation

- **Backend**
  - Supabase for authentication and database
  - OpenAI API for AI features
  - Real-time updates

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-ticket-flow-bot.git
cd smart-ticket-flow-bot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

The application is deployed on Render. To deploy your own instance:

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your repository
4. Set the following environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`
5. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
