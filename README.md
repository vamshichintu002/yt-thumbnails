# YouTube Thumbnail Generator

This project is split into two main parts:
- Frontend: A React application built with Vite, TypeScript, and Tailwind CSS
- Backend: A Node.js server using Express

## Project Structure

```
yt-thumbnails/
├── frontend/           # Frontend React application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
└── backend/           # Backend Node.js server
    ├── server.js      # Main server file
    └── package.json   # Backend dependencies
```

## Getting Started

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your environment variables
4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on http://localhost:3001

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:5173

## Development

- Frontend development server (Vite) runs on port 5173
- Backend API server runs on port 3001
- The backend serves generated images from the `/public/generated-images` directory

## Features

- Generate thumbnails from video titles using AI
- Support for multiple aspect ratios
- Download thumbnails in various formats
- Modern, responsive UI with dark mode
