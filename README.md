# StudySync AI - Virtual Study Group Platform

StudySync AI is a highly modern, professional, and interactive platform for students to collaborate, share resources, and leverage AI for smarter studying.

## Features
- **Real-time Chat**: Connect with group members instantly using Socket.io.
- **Resource Sharing**: Upload and manage project documents and study materials.
- **AI Summaries**: Get concise, bulleted summaries of chat history or shared text files powered by Claude 3.5 Sonnet.
- **Modern Dashboard**: A sleek, responsive SaaS-style interface built with React and Tailwind CSS.
- **Auth System**: Secure JWT-based login and signup.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Lucide icons, Framer Motion
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB
- **AI Integration**: Claude API (Anthropic)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/virtual-study-group
   JWT_SECRET=your_jwt_secret
   CLAUDE_API_KEY=your_claude_api_key
   ```
   *Note: A mock summary is returned if the API key is not configured.*
4. Start the server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
- **Signup/Login**: Create an account and log in.
- **Create Groups**: Use the dashboard to create a new study group.
- **Join Groups**: Browse and enter rooms to join them automatically.
- **Chat & Share**: Message your peers and upload files in the 'Resources' tab.
- **AI Summary**: Click 'Generate Summary' in the 'AI Insights' tab to see key takeaways from your discussions.

## Demo Screenshots
*(Add your own screenshots here after running the app)*

---
Developed as a professional Full-Stack Assessment project.
