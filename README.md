# Berita Malaysia

> Portal Berita Terkini Malaysia | Malaysian News Aggregation Platform

A modern news aggregation platform built with React, TypeScript, and Lovable Cloud. Aggregates news from multiple Malaysian news sources into a unified, responsive interface.

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff)

## ✨ Features

- 📰 **Breaking News Ticker** - Real-time urgent news display
- 🔥 **Trending Articles** - Top 5 most-viewed articles
- 🏷️ **Category Navigation** - 10+ news categories
- 🔍 **Full-Text Search** - Search articles by title/content
- 🌙 **Dark Mode** - Theme toggle support
- 📱 **Mobile-First** - Responsive design with bottom navigation
- 🔐 **Admin Dashboard** - Analytics, moderation, source management

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
├── src/
│   ├── components/       # React components
│   │   ├── admin/        # Admin panel components
│   │   ├── article/      # Article display components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   ├── news/         # News feed components
│   │   ├── seo/          # SEO components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Route pages
│   │   └── admin/        # Admin pages
│   ├── constants/        # Configuration constants
│   ├── types/            # TypeScript types
│   └── integrations/     # Backend client
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── SITE.md               # Detailed site documentation
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack React Query v5 |
| Routing | React Router v7 |
| Backend | Lovable Cloud |
| Testing | Vitest + React Testing Library |
| Icons | Lucide React |
| Charts | Recharts |

## 🔧 Configuration

### Environment Variables

The project uses Lovable Cloud which automatically configures environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

> ⚠️ The `.env` file is auto-generated. Do not edit manually.

### Adding Secrets

For API keys and sensitive data, use the Lovable Cloud secrets manager in Settings → Cloud → Secrets.

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |

## 🔐 Admin Access

The admin panel requires authentication via Google OAuth:

1. Navigate to `/admin/login`
2. Sign in with Google
3. User must have `admin` role in `user_roles` table

## 🖥️ How to Edit

### Use Lovable

Simply visit [Lovable](https://lovable.dev) and start prompting. Changes made via Lovable will be committed automatically.

### Use Your Preferred IDE

Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

### Edit in GitHub

Navigate to the desired file(s), click the "Edit" button (pencil icon), make your changes and commit.

### Use GitHub Codespaces

Click "Code" → "Codespaces" → "New codespace" to launch a cloud development environment.

## 🚀 Deployment

Open [Lovable](https://lovable.dev) and click on **Share → Publish**.

### Custom Domain

To connect a domain, navigate to **Project → Settings → Domains** and click **Connect Domain**.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📚 Documentation

- [SITE.md](./SITE.md) - Detailed site documentation
- [Lovable Docs](https://docs.lovable.dev/) - Platform documentation

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ using [Lovable](https://lovable.dev)
