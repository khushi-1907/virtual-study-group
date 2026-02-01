# Vercel + Render Deployment Guide

## Architecture
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express + Socket.IO)
- **Database**: MongoDB Atlas (recommended)

## Step 1: Deploy Backend on Render

### 1.1 Prepare Repository
Ensure your code is pushed to GitHub/GitLab.

### 1.2 Create Render Service
1. Go to [render.com](https://render.com)
2. Connect your repository
3. Create a new **Web Service**
4. Configure:
   - **Name**: `virtual-study-group-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

### 1.3 Set Environment Variables on Render
Add these in your Render service settings:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-study-group
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=https://your-vercel-app.vercel.app
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 1.4 Deploy
Render will automatically deploy. Note your service URL: `https://your-service-name.onrender.com`

## Step 2: Deploy Frontend on Vercel

### 2.1 Prepare Client Environment
Create `.env.local` in the client directory:
```
VITE_API_URL=https://your-service-name.onrender.com/api
VITE_SOCKET_URL=https://your-service-name.onrender.com
```

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Set Environment Variables on Vercel
Add these in your Vercel project settings:
```
VITE_API_URL=https://your-service-name.onrender.com/api
VITE_SOCKET_URL=https://your-service-name.onrender.com
```

## Step 3: Update CORS Settings

### 3.1 Update Server CORS
In `server/server.js`, ensure CORS allows your Vercel domain:
```javascript
app.use(cors({
    origin: ["https://your-vercel-app.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"]
}));
```

### 3.2 Update Socket.IO CORS
```javascript
const io = new Server(server, {
    cors: {
        origin: ["https://your-vercel-app.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});
```

## Step 4: Database Setup

### 4.1 MongoDB Atlas (Recommended)
1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` on Render

## Step 5: Test Deployment

1. **Backend**: Visit `https://your-service-name.onrender.com/api` - should return JSON
2. **Frontend**: Visit your Vercel URL - should load the app
3. **Socket.IO**: Check browser console for successful connection
4. **Features**: Test user registration, group creation, messaging

## Troubleshooting

### Common Issues:
- **CORS errors**: Double-check CLIENT_URL matches your Vercel domain
- **Socket connection fails**: Ensure SOCKET_URL is correct (no `/api` suffix)
- **Database connection**: Verify MONGODB_URI is valid and accessible
- **Environment variables**: Ensure they're set correctly on both platforms

### Debug Commands:
```bash
# Check Render logs
# In Render dashboard: Logs tab

# Check Vercel logs
# In Vercel dashboard: Functions tab

# Local testing with production backend
# Update .env.local to use Render URLs
```

## Production Checklist:
- [ ] Backend deployed on Render with all env vars
- [ ] Frontend deployed on Vercel with correct backend URLs
- [ ] CORS configured for production domains
- [ ] MongoDB Atlas connected
- [ ] Socket.IO working across domains
- [ ] All features tested in production
- [ ] SSL certificates (auto-provided by Vercel/Render)
