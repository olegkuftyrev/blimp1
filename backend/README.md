# Backend - Express.js + TypeScript

This is a Node.js backend API server built with Express.js and TypeScript.

## Features

- 🚀 Express.js web framework
- 📝 TypeScript for type safety
- 🔄 CORS enabled for frontend integration
- 🌍 Environment variable support
- 📊 Health check endpoints
- 🛠️ Development mode with hot reload

## Prerequisites

- Node.js 20.x or higher
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
PORT=5000
NODE_ENV=development
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm test` - Run tests (not configured yet)

## Development

Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Base Routes
- `GET /` - Welcome message
- `GET /health` - Health check

### API Routes
- `GET /api/hello` - Hello message with request info
- `POST /api/data` - Accept data (requires name and message in body)

## Project Structure

```
src/
└── server.ts          # Main server file with all routes
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

## Building for Production

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Learn More

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Node.js Documentation](https://nodejs.org/)
