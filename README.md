# Next.js CRM with shadcn/ui

Next.js project with shadcn/ui components, TypeScript, ESLint and Turbopack for modern CRM development.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check

# Run tests
npm run test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import Project in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Configure Environment Variables**:
   In Vercel Dashboard → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `OPENAI_API_KEY`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Access your app at: `https://your-project.vercel.app`

### Environment Variables

Required environment variables (see `.env.example`):

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://app.supabase.com) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | [Supabase Dashboard](https://app.supabase.com) → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key for OCR | [OpenAI Platform](https://platform.openai.com/api-keys) |

**Security Note**: Never commit `.env.local` to Git. Use Vercel's environment variable settings for production.

### Vercel-Specific Notes

- **Build Command**: `npm run build` (automatically detected)
- **Output Directory**: `.next` (automatically detected)
- **Node.js Version**: 20.x (automatically detected from package.json)
- **Edge Runtime**: Middleware runs on Vercel Edge Network
- **Serverless Functions**: API routes run as Node.js serverless functions

## Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Turbopack (recommended)
- **Linting**: ESLint with Next.js config

## Conventions

Rules and standards are defined at the repository root:
- `/CLAUDE.md` - Project instructions and feature pipeline
- Follow TDD practices as enforced by project constitution
- Use small, composable changes and reuse existing components

## Features Pipeline

Use the standard feature pipeline commands:
- `create_feature` → `create_prp` → `execute_prp`
- All feature artifacts are stored in `features/` directory
