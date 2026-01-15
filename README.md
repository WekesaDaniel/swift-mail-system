# FastMail Pro

A secure, scalable web-based email system for personal and SMB use, featuring a modern React frontend with a serverless backend.

## 🚀 Live Demos

- **Production**: [https://fastmailpro.lovable.app](https://fastmailpro.lovable.app)
- **Vercel**: [https://swift-mail-system.vercel.app/](https://swift-mail-system.vercel.app/)))

## ✨ Features

- 📧 Full email management (compose, send, receive, organize)
- 📁 Folder organization (Inbox, Sent, Drafts, Trash, Starred)
- 🔍 Email search functionality
- 👥 Contact management
- 🔐 Secure authentication (email/password)
- 📱 Responsive design for desktop and mobile
- 🌙 Modern, clean UI with dark mode support

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: TanStack Query
- **Routing**: React Router

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or bun

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd fastmail-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔧 Environment Variables

For local development or Vercel deployment, configure these environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

> **Note**: For Vercel deployments, add these as GitHub secrets and configure them in your Vercel project settings.

## 📁 Project Structure

```
src/
├── components/
│   ├── mail/           # Email-specific components
│   │   ├── ComposeModal.tsx
│   │   ├── EmailDetail.tsx
│   │   ├── EmailList.tsx
│   │   ├── MailLayout.tsx
│   │   ├── SearchBar.tsx
│   │   └── Sidebar.tsx
│   └── ui/             # Reusable UI components (shadcn)
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx
│   └── useEmails.tsx
├── integrations/       # External service integrations
│   └── supabase/
├── pages/              # Route pages
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## 👥 Team

### Presentation Layer (Frontend)
- **Daniel**
- **Lameck**

### Application Layer (Backend/APIs)
- **Josiah**
- **Richard**

### Data Layer (Backend)
- **Arnold**
- **Geoffrey**

## 🌿 Branch Strategy

| Branch | Deployment | Purpose |
|--------|------------|---------|
| `dev` | [Lovable](https://fastmailpro.lovable.app) | Development and testing |
| `main` | [Vercel](https://your-vercel-deployment.vercel.app) | Production deployment |

- **dev branch**: Used for Lovable deployment with automatic syncing
- **main branch**: Used for Vercel production deployment with GitHub secrets for environment variables

## 🗄️ Database Schema

- **emails**: Store all email messages with metadata
- **folders**: User email folders (Inbox, Sent, Drafts, etc.)
- **contacts**: User contact list
- **profiles**: User profile information
- **audit_logs**: Security and activity logging

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Email validation with Zod
- Secure authentication flow
- User data isolation

## 📄 License

MIT License
