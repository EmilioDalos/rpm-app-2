# RPM App

This repository contains both the frontend and backend for the RPM (Rapid Planning Method) Application.

## Folder Structure

```
rpm-app-2/
├── frontend/                 # Next.js frontend application
│   ├── components/           # React components
│   ├── pages/                # Next.js pages
│   ├── public/               # Static assets
│   ├── styles/               # CSS styles
│   └── ...
├── backend/                  # Express.js backend application
│   ├── src/                  # Source code
│   │   ├── controllers/      # API controllers
│   │   ├── routes/           # API routes
│   │   ├── data/             # JSON data files
│   │   └── ...
│   └── ...
└── start-dev.sh              # Script to start both frontend and backend
```

## Getting Started

To start both the frontend and backend servers together:

```bash
./start-dev.sh
```

### Frontend

The frontend is a Next.js application that runs on port 3000 by default.

```bash
cd frontend
npm install
npm run dev
```

### Backend

The backend is an Express.js application that runs on port 3001 by default.

```bash
cd backend
npm install
npm run dev
```

## Development

- The frontend connects to the backend API at http://localhost:3001/api
- The backend serves API endpoints for categories, RPM blocks, and calendar events

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/EmilioDalos/rpm-app-2)