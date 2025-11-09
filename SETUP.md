# DevTask AI Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Gemini API key from Google AI Studio
- AWS account with S3 access (optional for file uploads)

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devtask

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d

# Gemini AI (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key-here

# AWS S3 (optional - for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=devtask-attachments

# Rate Limiting
AI_DAILY_QUOTA=3

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Sentry (optional - for error tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `.env` as `GEMINI_API_KEY`

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 6. Test the API

Health check:
```bash
curl http://localhost:5000/health
```

API info:
```bash
curl http://localhost:5000/api/v1
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Projects
- `GET /api/v1/projects` - Get all projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project by ID
- `PUT /api/v1/projects/:id` - Update project

### Tasks
- `GET /api/v1/projects/:projectId/tasks` - Get project tasks
- `POST /api/v1/projects/:projectId/tasks` - Create task
- `PUT /api/v1/tasks/:taskId` - Update task
- `DELETE /api/v1/tasks/:taskId` - Delete task

### Bugs
- `GET /api/v1/projects/:projectId/bugs` - Get project bugs
- `POST /api/v1/projects/:projectId/bugs` - Create bug
- `GET /api/v1/bugs/:bugId` - Get bug by ID
- `PUT /api/v1/bugs/:bugId` - Update bug

### Snippets
- `GET /api/v1/snippets` - Get user snippets
- `POST /api/v1/snippets` - Create snippet
- `GET /api/v1/snippets/:id` - Get snippet by ID
- `DELETE /api/v1/snippets/:id` - Delete snippet

### AI
- `POST /api/v1/ai/suggest-fix` - Get AI bug fix suggestion
- `POST /api/v1/ai/generate-snippet` - Generate code snippet

### Uploads
- `GET /api/v1/uploads/presign` - Get presigned S3 URL

### Tools
- `POST /api/v1/tools/json-format` - Format JSON
- `POST /api/v1/tools/api-test` - Test API endpoint

## Testing

Register a user:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Use the returned token for authenticated requests:
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Production Deployment

See the main README and deployment tasks in the spec for AWS EC2 deployment instructions.

## Troubleshooting

**MongoDB connection fails:**
- Check your connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**Gemini API errors:**
- Verify API key is correct
- Check API quota limits
- Ensure you have billing enabled (if required)

**Port already in use:**
- Change PORT in .env file
- Or kill the process using port 5000

## Next Steps

Once the backend is running, proceed to build the frontend React application.
