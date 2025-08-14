# TaskDrop Server (GraphQL API)

> **"Got 30 minutes? Help someone get something done."**

**TaskDrop** is a platform where everyday people in Mongolia offer their free time to help others with quick, small tasks. It's built for busy individuals who need a hand with minor chores or errands, and for helpful folks who have a few moments to spare. TaskDrop focuses on *small wins for busy lives* – it’s not about full-time freelancing, but about simple tasks that can be completed in minutes or hours.

## Features

- **Quick Task Posting**: Post small tasks like walking a dog, picking up documents, or translating short texts.
- **“Available Now” Matching**: Instantly match with urgent tasks when helpers are available.
- **Location & Remote Filters**: Filter tasks by geo-location or remote availability.
- **Time Tracking & Secure Payments**: Track task duration and process one-time payments securely.
- **Lightweight Reputation System**: Build trust through simple ratings after task completion.

## About This Repository

This repository contains the **backend GraphQL API server** for TaskDrop. It provides the core business logic and data management for the platform.

> For the frontend, see the **[TaskDrop Web App](https://github.com/glpzghoo/task-drop)**.

## Tech Stack

- Node.js & Express
- Apollo GraphQL Server
- PostgreSQL + Drizzle ORM
- TypeScript
- JWT Authentication
- Supabase Storage (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- (Optional) Supabase account for file storage

### Installation

```bash
git clone https://github.com/glpzghoo/server-taskdrop.git
cd server-taskdrop
npm install
```

### Environment Variables

Create a `.env` file:

```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Run Development Server

```bash
npm run nodemon
```

GraphQL endpoint will be available at: `http://localhost:4000/graphql`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss your ideas.
