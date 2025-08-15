# 🚀 API Connection Testing Guide

This guide will help you test and verify that the frontend is properly connected to the backend via axios.

## 📋 Prerequisites

Before testing, ensure you have:

1. **MongoDB running** (local or Atlas)
2. **Backend server running** on port 8000
3. **Frontend server running** on port 5173
4. **Environment variables configured** in backend `.env` file

## 🔧 Setup Instructions

### Step 1: Create Backend Environment File

Create a `.env` file in `ai_SDR-master/backend/` with:

```bash
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
DB_NAME=ai_sdr_db

# Server Configuration
PORT=8000
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secret_jwt_key_here_change_in_production
ACCESS_TOKEN_EXPIRY=7d

# Google GenAI API (Optional)
GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here

# Frontend Domain
FRONT_END_DOMAIN=http://localhost:5173

# SMTP Configuration (Optional)
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### Step 2: Install Dependencies

```bash
# Backend
cd ai_SDR-master/backend
npm install

# Frontend
cd ../frontend_ai_sdr
npm install
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas**
- Use your Atlas connection string in the `.env` file

### Step 4: Start Backend Server

```bash
cd ai_SDR-master/backend
npm run dev
```

**Expected Output:**
```
🚀 Server is running on port 8000
✅ MongoDB connected: localhost
```

### Step 5: Start Frontend Server

```bash
cd ai_SDR-master/frontend_ai_sdr
npm run dev
```

**Expected Output:**
```
🚀 Vite dev server running at http://localhost:5173
```

## 🧪 Testing the Connection

### Method 1: Frontend API Test Component

1. **Visit**: `http://localhost:5173`
2. **Scroll down** to the "Test API Connection" section
3. **Watch the tests run automatically**
4. **Check results** for each endpoint

**Expected Results:**
- ✅ Health Check: Success (200 OK)
- ✅ CORS Test: Success (200 OK)
- ✅ Response Time: Success (200 OK) with < 100ms response time

### Method 2: Backend Test Script

```bash
cd ai_SDR-master/backend
npm run test:connection
```

**Expected Output:**
```
🚀 Starting Backend Connection Tests...

🧪 Testing: Health Check
📍 URL: http://localhost:8000/api/health
🔧 Method: GET
✅ SUCCESS: 200 OK
⏱️  Response Time: 45ms
📊 Response Data: { status: 'OK', date: '2025-01-15T...' }

📋 TEST SUMMARY
✅ PASS Health Check
✅ PASS Admin Routes Available
✅ PASS Leads Routes Available

📊 Results: 3/3 tests passed
🎉 All tests passed! Backend is working correctly.
```

### Method 3: Manual API Testing

#### Test Health Endpoint
```bash
curl http://localhost:8000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "date": "2025-01-15T14:30:00.000Z"
}
```

#### Test CORS (from browser console)
```javascript
fetch('http://localhost:8000/api/health')
  .then(response => response.json())
  .then(data => console.log('✅ Success:', data))
  .catch(error => console.error('❌ Error:', error));
```

## 🔍 Troubleshooting

### Issue 1: MongoDB Connection Failed

**Error:**
```
Caught DB Error MongoParseError: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

**Solution:**
1. Check MongoDB is running: `mongod` or `docker ps`
2. Verify `.env` file has correct `MONGO_URI`
3. For local: `mongodb://localhost:27017`
4. For Atlas: `mongodb+srv://username:password@cluster.mongodb.net`

### Issue 2: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::8000
```

**Solution:**
1. Change PORT in `.env` file to 8001
2. Update frontend axios baseURL to match
3. Or kill existing process: `lsof -ti:8000 | xargs kill -9`

### Issue 3: CORS Error

**Error:**
```
Access to fetch at 'http://localhost:8000/api/health' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
1. Verify `CORS_ORIGIN=http://localhost:5173` in `.env`
2. Restart backend server
3. Check browser console for detailed error

### Issue 4: Frontend Can't Connect

**Error:**
```
❌ NETWORK ERROR: No response received
```

**Solution:**
1. Verify backend is running on correct port
2. Check axios baseURL in `frontend_ai_sdr/src/api/axiosInstance.js`
3. Ensure no firewall blocking localhost connections

## 📊 Expected Test Results

### ✅ Successful Connection

| Test | Status | Response Time | Details |
|------|--------|---------------|---------|
| Health Check | ✅ PASS | < 100ms | Status: OK, Date: current |
| CORS Test | ✅ PASS | < 100ms | No CORS errors |
| Response Time | ✅ PASS | < 200ms | Fast API responses |

### ❌ Failed Connection

| Test | Status | Error | Solution |
|------|--------|-------|----------|
| Health Check | ❌ FAIL | Network Error | Start backend server |
| CORS Test | ❌ FAIL | CORS Error | Check CORS_ORIGIN |
| Response Time | ❌ FAIL | Timeout | Check MongoDB connection |

## 🎯 Advanced Testing

### Test Admin Authentication

```bash
# Test admin login endpoint
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Test Lead Management

```bash
# Test leads endpoint
curl http://localhost:8000/api/leads/get/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Email Service

```bash
# Test email endpoint
curl http://localhost:8000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Test email"}'
```

## 🔧 Monitoring & Debugging

### Backend Logs
```bash
# Watch backend logs
cd ai_SDR-master/backend
npm run dev
```

### Frontend Console
1. Open browser DevTools (F12)
2. Check Console tab for API request logs
3. Look for 🚀 API Request and ✅ API Response messages

### Network Tab
1. Open browser DevTools (F12)
2. Check Network tab
3. Monitor API calls to `localhost:8000`

## 🎉 Success Indicators

When everything is working correctly, you should see:

### Backend Console
```
🚀 Server is running on port 8000
✅ MongoDB connected: localhost
📝 API Request: GET /api/health
✅ API Response: 200 /api/health
```

### Frontend Console
```
🚀 API Request: GET /health
✅ API Response: 200 /health
🧪 Running test: Health Check
```

### Browser Network Tab
- Successful requests to `localhost:8000/api/*`
- Response status 200 OK
- Fast response times (< 200ms)

## 🚀 Next Steps

After confirming the connection works:

1. **Test Admin Login**: Visit `/admin/login`
2. **Test Dashboard**: Navigate to `/admin/dashboard`
3. **Test Lead Management**: Try adding/editing leads
4. **Test Email Features**: Send test emails

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Verify all environment variables
3. Ensure MongoDB is running
4. Check browser console for errors
5. Verify backend server logs

---

**Happy Testing! 🎯** Your enhanced frontend should now be perfectly connected to the backend with smooth animations and excellent user experience.

