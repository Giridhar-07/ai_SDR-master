# Backend Setup Guide

## 1. Create Environment File

Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=8000
CORS_ORIGIN=http://localhost:5173

# Database Configuration
MONGO_URI=mongodb://localhost:27017
DB_NAME=ai_sdr_db

# JWT Configuration
ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-change-this-in-production
ACCESS_TOKEN_EXPIRY=7d

# Google GenAI Configuration
GOOGLE_GENAI_API_KEY=your-google-genai-api-key

# Frontend Domain
FRONT_END_DOMAIN=http://localhost:5173

# Email Configuration (SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
```

## 2. Install MongoDB

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a service automatically

### macOS:
```bash
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu):
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## 3. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

## 4. Start the Backend Server

```bash
npm start
```

You should see: `Server is running on port 8000`

## 5. Test Backend Connection

The backend will be available at: `http://localhost:8000/api`

Test the health endpoint: `http://localhost:8000/api/health`

## 6. Start Frontend

In a new terminal, navigate to the frontend directory:

```bash
cd frontend_ai_sdr
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Troubleshooting

### If MongoDB connection fails:
1. Make sure MongoDB is running
2. Check if the MONGO_URI is correct
3. Try using: `mongodb://127.0.0.1:27017` instead of `mongodb://localhost:27017`

### If CORS errors occur:
1. Make sure CORS_ORIGIN matches your frontend URL
2. Check if both frontend and backend are running on the correct ports

### If JWT errors occur:
1. Make sure ACCESS_TOKEN_SECRET is set
2. The secret should be a long, random string

## API Endpoints

- Health Check: `GET /api/health`
- Admin Login: `POST /api/admin/login`
- Admin Register: `POST /api/admin/register`
- Leads: `GET /api/leads`
- Email: `POST /api/email/send`
