# Unified Checkout Frontend

Standalone frontend application for CyberSource Unified Checkout.

## Overview

This frontend is completely separated from the backend and communicates via REST API.

## Requirements

- Node.js >= 16
- Backend API running on `https://localhost:3000`

## Quick Start

1. Make sure the backend is running:
   ```bash
   # From the root directory
   npm run start:dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Open http://localhost:5500 in your browser

## API Endpoints

The frontend uses the following API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/config` | Get default capture context config |
| POST | `/api/capture-context` | Generate capture context JWT |
| POST | `/api/checkout` | Prepare checkout data |
| POST | `/api/complete-payment` | Process payment completion |

## File Structure

```
frontend/
├── index.html      # Main HTML page (SPA)
├── css/
│   └── style.css   # Custom styles
├── js/
│   ├── api.js      # API client module
│   └── app.js      # Main application logic
└── package.json    # Frontend package config
```

## Running Both Frontend and Backend

From the root directory:

```bash
# Option 1: Run separately in different terminals
npm run start:backend    # Terminal 1
npm run start:frontend   # Terminal 2

# Option 2: Run both together
npm run start:all
```

## Configuration

The API base URL is configured in `js/api.js`:

```javascript
const API_BASE_URL = 'https://localhost:3000/api';
```

Update this if your backend runs on a different port.
