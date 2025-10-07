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
