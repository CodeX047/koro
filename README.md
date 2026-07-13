# Kōro

> AI-powered Product Delivery Platform that transforms feature requests into production-ready software.

From Feature Request -> PRD -> Engineering Tasks -> GitHub -> AI Review -> Release

## Demo

Live Demo: https://koro-tau.vercel.app

## Screenshots

![Dashboard Mockup](docs/images/landing.png)

## About the Project

Modern software development requires managing multiple disconnected platforms: task managers, requirement documentation, GitHub repositories, billing portals, and AI systems. Moving between these interfaces slows down development, creates communication gaps, and leads to outdated tasks and specifications.

Koro solves this problem by serving as a single, multi-tenant workspace. It links directly to GitHub to synchronize repositories and issue trackers. It uses integrated AI workflows to clarify feature requests, write complete Product Requirement Documents (PRDs), structure development tasks, and perform code reviews. With built-in organization controls and a subscription billing module, Koro acts as the control center for teams executing complex software development tasks.

## Product Workflow

The platform automates the lifecycle of feature implementation:

1. Submit Feature Request: Input a raw feature idea or client feedback into the dashboard.
2. AI-Driven Clarification: An AI agent asks context-aware follow-up questions to fill in missing details.
3. PRD Generation: Once clarified, a comprehensive Product Requirement Document is generated.
4. Task Decomposition: The system breaks the PRD down into structured engineering tasks.
5. Plan Approval: A human manager reviews and approves the generated PRD and tasks.
6. Issue Sync: The approved tasks are automatically synchronized to GitHub as issues.
7. Development: Developers implement the changes locally and push branches to GitHub.
8. AI Code Review: When a Pull Request is opened, an AI agent reviews the diff using repository context.
9. Revision: Developers address feedback and push updates.
10. Release Readiness: The platform evaluates if the feature meets all PRD criteria for release.

## Architecture

The system uses a sequential multi-agent architecture where agents communicate by producing intermediate assets stored in the shared database and synchronized with external APIs.

```mermaid
graph TD
    Request[Customer Request] --> ClarificationAgent[Clarification Agent]
    ClarificationAgent --> PRDAgent[PRD Agent]
    PRDAgent --> TaskAgent[Task Agent]
    TaskAgent --> Kanban[Kanban Board]
    Kanban --> GitHubIssues[GitHub Issues]
    GitHubIssues --> PullRequest[Pull Request]
    PullRequest --> ReviewAgent[Review Agent]
    ReviewAgent --> ReleaseAgent[Release Agent]
```

### Inngest Event Pipeline

Background processes are coordinated via Inngest events:

```text
feature/requested
        │
        ▼
clarification/requested
        ▼
clarification/completed
        ▼
prd/generated
        ▼
tasks/generated
        ▼
github/issues.created
        ▼
review/requested
        ▼
review/completed
```

## Features

- **Automated PRD and Task Generation**: Clarify feature ideas with interactive AI forms and automatically generate robust PRDs and development tasks.
- **GitHub Integration**: Connect repositories via a custom GitHub App to synchronize branches, issues, and pull requests in real time.
- **AI-Powered Code Reviews**: Receive automated code reviews on pull requests using Pinecone-based context and OpenAI/OpenRouter models.
- **Granular Organization Scoping**: Manage member roles (owner, admin, member, viewer) and invite collaborators through a dedicated workspace settings dashboard.
- **Robust Background Processing**: Rely on Inngest workflows for task scheduling, cleanup routines, and event-driven automation.
- **Integrated Subscriptions**: Handle payments and membership tiers with an integrated Dodo Payments billing system.

## AI Agents

Koro utilizes specialized AI agents built on top of OpenRouter and Pinecone vector embeddings to handle specific project tasks:

- **Clarification Agent**: Analyzes user-submitted feature requests and identifies ambiguities. It asks targeted follow-up questions to refine the project requirements.
- **PRD Agent**: Consolidates original requests and clarification answers to produce structured, professional Product Requirement Documents (PRDs).
- **Task Agent**: Deconstructs approved PRDs into technical tasks, assigning priorities and generating initial specifications for each task.
- **Review Agent**: Monitors GitHub Pull Requests, analyzes the code diff against the PRD requirements and codebase context from Pinecone, and publishes inline code reviews.
- **Release Agent**: Analyzes codebase changes and task completion status to determine if a feature is fully implemented and ready for production deployment.

## Tech Stack & Dependencies

- **Frontend & Routing**: Next.js (App Router), React, tRPC client, TailwindCSS 4.
- **Backend & APIs**: Next.js Route Handlers, tRPC API server, Inngest event handlers.
- **Database & State**: PostgreSQL (via Neon), Drizzle ORM, Pinecone Vector Database.
- **Authentication**: Better Auth (with session cookie caching and organization plugins).
- **Billing**: Dodo Payments (subscription tiers, checkout, and webhook integrations).
- **Workflows & AI**: Inngest (event orchestration), OpenRouter API (LLM integration).

## Folder Structure

```text
koro/
├── apps/
│   └── web/           Next.js app serving pages, tRPC endpoints, and Inngest background jobs.
├── packages/
│   ├── ai/            AI utilities, agent prompts, and Pinecone vector database integration.
│   ├── auth/          Better Auth server and client configurations.
│   ├── billing/       Dodo Payments client and webhook signature verification.
│   ├── database/      Drizzle ORM schema, client setup, and migrations.
│   ├── logger/        Shared Winston/Pino logger setup.
│   ├── services/      Core business logic, including security check authorization and review vectors.
│   ├── trpc/          Shared tRPC router, context, and custom workspace procedures.
│   └── workflows/     Inngest event-driven workflow definitions (syncing, PRD generation, etc.).
└── docs/              Project documentation and media assets.
```

## Setup

### Prerequisites

- Node.js version 20 or higher.
- pnpm package manager. Ensure Corepack is enabled so the workspace automatically provisions the correct version:

```bash
corepack enable
corepack install
```

### Installation Steps

1. Clone the repository and navigate into the root directory:

```bash
git clone https://github.com/username/koro.git
cd koro
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up your environment variables. Copy the example template and fill in the necessary keys:

```bash
cp .env.example .env
```

Ensure you provide the `DATABASE_URL` for Postgres, `BETTER_AUTH_SECRET` for authentication, and your GitHub/billing credentials.

4. Create and run migrations to initialize your database:

```bash
pnpm db:generate
pnpm db:migrate
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# Database connection
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Better Auth configuration
BETTER_AUTH_SECRET=your_better_auth_secret_here
BETTER_AUTH_URL=http://localhost:3000

# GitHub App Integration
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
GITHUB_APP_NAME=koro-pr

# AI & Embeddings
OPENROUTER_API_KEY=your_openrouter_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name

# Dodo Payments Billing
DODO_PAYMENTS_API_KEY=your_dodo_api_key
DODO_PAYMENTS_WEBHOOK_SECRET=your_dodo_webhook_secret
DODO_PAYMENTS_ENVIRONMENT=test

# Application Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development

To start the local development environment:

```bash
pnpm dev
```

This command runs the Next.js development server on port 3000.

### Local Development Endpoints

- **Web Application**: http://localhost:3000
- **tRPC API Endpoint**: http://localhost:3000/api/trpc
- **Inngest Workflow Endpoint**: http://localhost:3000/api/inngest
- **Dodo Webhook Listener**: http://localhost:3000/api/webhooks/dodo
- **GitHub Webhook Listener**: http://localhost:3000/api/github/webhook

### Testing Inngest Workflows

To trigger and inspect background workflows locally, run the Inngest Dev Server:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

### Common Workspace Commands

- **Build the project**: `pnpm build`
- **Format codebase**: `pnpm format`
- **Lint files**: `pnpm lint`
- **Check types**: `pnpm check-types`

## Deployment

Follow these steps to deploy Koro to a production environment:

1. **Deploy to Vercel**:
   - Import the repository into Vercel.
   - Set the framework preset to Next.js.
   - Configure the root directory to build the monorepo root.

2. **Set Environment Variables**:
   - Add all environment variables listed in the Environment Variables section to your Vercel project settings.

3. **Run Drizzle Migrations**:
   - Ensure Drizzle migrations run as part of your deployment build script or run them manually before deployment using:
     ```bash
     pnpm db:migrate
     ```

4. **Configure GitHub App**:
   - Update your GitHub App settings with your production domain webhooks (`https://yourdomain.com/api/github/webhook`) and redirect URLs.

5. **Configure Inngest**:
   - Link your production Next.js application to Inngest Cloud using your Inngest signing keys.

6. **Configure Dodo Webhooks**:
   - Set up webhooks in your Dodo Payments developer dashboard pointing to `https://yourdomain.com/api/webhooks/dodo` to capture subscription and payment events.

## Performance

- **Better Auth Session Cache**: Reduces database lookups by caching session data in memory.
- **Parallel Database Queries**: Utilizes Drizzle's query optimization to fetch database records asynchronously.
- **Query Optimization**: Database queries are tuned and select only the required fields to reduce network payload.
- **GitHub Repository Cache**: Caches fetched repository structures to speed up synchronization and workspace loading.
- **Indexed Database Queries**: Frequently searched fields like organization ID, user ID, and resource keys are indexed in the schema to ensure low latency.

## Security

- **Multi-Tenant Isolation**: Keeps data partitioned so organizations cannot access resources belonging to other workspaces.
- **Role-Based Access Control (RBAC)**: Restricts workspace actions using Better Auth organization member roles (owner, admin, member, viewer).
- **Resource Authorization Middleware**: Implements custom tRPC middlewares to automatically verify resource ownership and context.
- **GitHub Webhook Signature Verification**: Uses secure HMAC SHA-256 signatures to verify that incoming requests originate from GitHub.
- **Dodo Webhook Verification**: Verifies incoming payload signatures to secure billing and subscription callbacks.
- **Pinecone Namespace Isolation**: Isolates vector data per organization using Pinecone namespaces to prevent data leakage.
