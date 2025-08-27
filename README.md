# Chatbot Platform UI

A comprehensive chatbot management platform built with **Next.js 14 + TypeScript + Tailwind CSS**.

## Features

### 🤖 Bot Management
- Multiple chatbots per client (Liza, Remco, Vinny, Max, HappyBot, Joy)
- Individual bot analytics and performance metrics
- Chat interface with WhatsApp-style messaging
- Bot configuration and settings management
- Knowledge base and Q&A training

### 📊 Analytics & Insights
- Real-time conversation metrics
- Performance dashboards with interactive charts
- Bot-specific analytics (response time, satisfaction, usage)
- Conversation history and filtering

### 👥 Team Collaboration
- Team member management with role-based access
- User profiles and account settings
- Multi-client support with brand customization

### 🔗 Integrations
- WhatsApp, Telegram, Facebook Messenger
- Zapier, Slack, and custom webhooks
- API documentation and testing tools

### 🎨 Modern UI/UX
- Black sidebar navigation (Chatbot.com style)
- Mobile-responsive design with collapsible menu
- Bot avatar cards with individual branding
- Professional dashboard layouts

## Demo Accounts

| Client | Email | Password | Bots |
|--------|-------|----------|------|
| Jumbo | `jumbo@demo.app` | `jumbo123` | Liza, Remco |
| HiTapes | `hitapes@demo.app` | `hitapes123` | Vinny, Max |
| Happinessbureau | `happiness@demo.app` | `happy123` | HappyBot, Joy |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` and login with any demo account above.

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (app)/             # Main application pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── BotCard.tsx       # Bot avatar cards
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── modals/           # Modal components
├── lib/
│   ├── auth.ts           # Mock authentication
│   └── data.ts           # Mock data & API simulation
└── types/                # TypeScript type definitions
```

## Pages & Features

### Authentication
- `/login` - User authentication with demo accounts

### Dashboard
- `/app/[clientId]` - Client overview with bot cards
- `/app/[clientId]/analytics` - Client-wide analytics

### Bot Management
- `/app/[clientId]/bot/[botId]/chat` - Chat interface
- `/app/[clientId]/bot/[botId]/analytics` - Bot analytics
- `/app/[clientId]/bot/[botId]/settings` - Bot configuration
- `/app/[clientId]/bot/[botId]/knowledge` - Q&A management

### Additional Features
- `/app/[clientId]/conversations` - Conversation history
- `/app/[clientId]/team` - Team management
- `/app/[clientId]/integrations` - Integration hub
- `/profile` - User profile settings

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: React Hooks + localStorage

## Development Notes

- Mock authentication using localStorage
- Fake data simulation in `src/lib/data.ts`
- Responsive design with mobile hamburger menu
- Error boundaries and loading states
- Brand-specific color schemes per client

## Next Steps

- [ ] Replace mock auth with real authentication (Clerk/Auth0)
- [ ] Implement backend API with database (Prisma + PostgreSQL)
- [ ] Add real-time chat functionality (WebSocket/Socket.io)
- [ ] Connect integration webhooks
- [ ] Add file upload for knowledge base
- [ ] Implement user roles and permissions
- [ ] Add email notifications
- [ ] Deploy to production (Vercel/Railway)

## License

Private project - All rights reserved