# Workflow Insight

Workflow Insight is a full-stack operational analytics dashboard for recurring business workflows.

The application helps small teams track sales, marketing, operations, customer success and automation routines, detect workflow risks, visualize activity patterns and generate AI-powered business analysis.

## Problem

Small teams often use CRM systems to store contacts, deals and tasks, but they do not always have a clear operational layer that answers questions like:

- Which recurring workflows are slowing down?
- Which routines were abandoned?
- Where is workload pressure increasing?
- Which processes need management attention this week?
- How can CRM activity be translated into actionable business signals?

As a result, important follow-ups, stalled deals, automation checks and customer success routines can be missed.

## Solution

Workflow Insight turns recurring workflow activity into a business-oriented analytics dashboard.

The app allows users to:

- create, edit and delete business workflows
- log workflow activity with workload scores
- track completion history
- detect abandoned or declining workflows
- visualize activity and risk data with charts
- generate weekly, monthly and quarterly AI analysis
- import CRM-style workflow templates through a secure CRM connection flow

The demo account contains prepared business data with 15 workflows and 90 days of activity history.

## Main Features

- User registration and login
- Demo account with prepared business data
- Full workflow CRUD
- Activity logging
- Dashboard metrics
- Visual analytics with charts
- Risk detection:
  - at-risk workflows
  - abandoned workflows
  - workload pressure
- OpenAI-powered workflow analysis:
  - weekly analysis
  - monthly analysis
  - quarterly analysis
- CRM connection modal with access token input
- CRM workflow import route
- Secure httpOnly cookie authentication

## Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- React
- Ant Design
- Recharts

### Backend

- Next.js API Routes
- MongoDB Atlas
- Mongoose
- JWT authentication
- bcrypt password hashing
- httpOnly cookies

### AI

- OpenAI API
- Model: `gpt-4.1-mini`
- AI analysis based on workflow metrics, activity history, risk signals and workload scores

### Deployment

- Vercel
- MongoDB Atlas

## Technical Decisions

### Full-stack Next.js architecture

The project uses Next.js App Router with API routes, so frontend and backend logic are kept in one application. This makes the project easier to deploy on Vercel and keeps the MVP compact.

### MongoDB + Mongoose

MongoDB is used because workflow and progress data are document-oriented and easy to model with flexible schemas.

Main models:

- `User`
- `Workflow`
- `Progress`

### Authentication

Authentication is implemented with JWT stored in an httpOnly cookie.

This avoids storing tokens in localStorage and keeps the frontend authentication flow more secure.

### Workflow risk logic

The app calculates operational risk signals from activity history:

- abandoned workflows: no recent activity
- at-risk workflows: activity declined compared to the previous period
- workload risk: high activity combined with low workload scores

### OpenAI integration

The AI analysis receives structured dashboard data and returns a business-oriented JSON response.

The UI shows:

- overall risk level
- confidence score
- AI summary
- key findings
- risk signals
- recommended actions
- next period priorities

### CRM import flow

The CRM connection flow asks for a provider and access token.

The token is processed only during the current request and is not stored in MongoDB, cookies or localStorage.

For the MVP, the route imports CRM-style workflow templates. In a production version, this flow can be extended to real HubSpot, Zoho or Pipedrive API integrations.
