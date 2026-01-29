# CleanStreet - Community Issue Reporting Platform

A comprehensive web application for reporting and managing civic issues in communities. This platform enables citizens to report local issues, track their resolution status, and engage with community initiatives through an intuitive interface.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### User Portal
- 🔐 User authentication (Register/Login with JWT)
- 📝 Report civic issues with photos and location
- 📍 Interactive map with issue locations
- 👍👎 Vote on reported issues
- 💬 Comment and discuss issues
- 📊 Personal dashboard with statistics
- 🔔 Track issue status in real-time

### Admin Portal
- 👥 Manage users and volunteers
- 📋 View and manage all complaints
- ✅ Approve/reject volunteer applications
- 🎯 Assign complaints to volunteers
- 📈 Comprehensive dashboard with statistics
- 🗑️ Delete inappropriate content

### Volunteer Portal
- 📋 View assigned tasks
- 🔄 Update complaint status
- 👤 Manage profile
- 📊 Track resolved issues

## 🛠️ Tech Stack

**Frontend:**
- React 18+
- React Router v6
- Axios for API calls
- Leaflet for maps
- React Toastify for notifications

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for emails
- AWS S3 for file storage (optional)
- Multer for file uploads

## 📁 Project Structure

```
CleanStreet_Team2/
├── backend/              # Backend server
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── utils/           # Helper functions
│   ├── server.js        # Main server (Port 5000)
│   ├── adminServer.js   # Admin server (Port 5001)
│   └── .env            # Environment variables
├── frontend/            # User frontend (Port 3000)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── App.js       # Main app
│   └── public/
├── admin-frontend/      # Admin/Volunteer frontend (Port 3001)
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── Admin/   # Admin components
│   │   │   └── Volunteer/ # Volunteer components
│   │   ├── services/    # API services
│   │   └── App.js       # Main app
│   └── public/
└── README.md           # This file
```

## 📦 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **AWS S3 Account** (optional, for cloud storage)
- **Gmail Account** (for email notifications)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/springboardmentor211/CleanStreet_Team2.git
cd CleanStreet_Team2
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Install Admin Frontend Dependencies

```bash
cd ../admin-frontend
npm install
```

## 🔑 Environment Variables

### Backend Configuration

Create a `.env` file in the `backend/` directory with the following content:

```env
# Server Configuration
PORT=5000
ADMIN_PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cleanstreet

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=CleanStreet <noreply@cleanstreet.com>

# AWS S3 Configuration (Optional - uses local storage if not configured)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

### ⚙️ Configuration Notes:

**📧 Email Setup (Gmail):**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to: Google Account → Security → 2-Step Verification → App Passwords
3. Generate an App Password for "Mail"
4. Use this App Password (not your regular password) in `EMAIL_PASSWORD`

**🗄️ MongoDB:**
- Ensure MongoDB is running on `localhost:27017`
- Or update `MONGODB_URI` with your MongoDB connection string (e.g., MongoDB Atlas)

**🔐 JWT Secret:**
- Generate a secure secret key:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- Replace `your_jwt_secret_key_change_this_in_production` with the generated key

**☁️ AWS S3 (Optional):**
- If not configured, images are stored locally in `backend/uploads/complaints/`
- For cloud storage, create an S3 bucket and add your credentials

## 🏃 Running the Application

### Step 1: Start MongoDB

Make sure MongoDB is running:

**Windows:**
```bash
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### Step 2: Start Backend Servers

Open a terminal and run:

```bash
cd backend
npm run both
```

This starts:
- **Main Server** on `http://localhost:5000`
- **Admin Server** on `http://localhost:5001`

### Step 3: Start User Frontend

Open a new terminal and run:

```bash
cd frontend
npm start
```

Opens at: **http://localhost:3000**

### Step 4: Start Admin Frontend

Open another terminal and run:

```bash
cd admin-frontend
npm start
```

Opens at: **http://localhost:3001**

## 👥 User Roles

### 1. Regular User
- **Access:** http://localhost:3000
- Register a new account or login
- Report issues with photos and location
- View issues on map, vote and comment

### 2. Admin
- **Access:** http://localhost:3001/admin/login
- **Create Super Admin Account:**
  ```bash
  cd backend
  node createSuperAdmin.js
  ```
  Follow the prompts to create your admin account
- Manage all users, volunteers, and complaints
- Assign tasks to volunteers

### 3. Volunteer
- **Access:** http://localhost:3001/volunteer/login
- Register as a volunteer at http://localhost:3001/volunteer/register
- Wait for admin approval
- View and update assigned complaint statuses

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Start MongoDB service
- Check if MongoDB is running: `mongosh` or `mongo`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** 
- Kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### JWT Secret Error
```
Error: secretOrPrivateKey must have a value
```
**Solution:** 
- Ensure `.env` file exists in `backend/` directory
- Check that `JWT_SECRET` is defined in `.env`
- Make sure `require('dotenv').config()` is at the top of server files

### Email Not Sending
**Solution:** 
1. Enable 2-Factor Authentication on Gmail
2. Generate an App Password (not your regular password)
3. Use the App Password in `EMAIL_PASSWORD` in `.env`

### Images Not Uploading
**Solution:** 
- Check `backend/uploads/complaints/` directory exists
- Verify write permissions for the uploads folder
- If using S3, verify AWS credentials in `.env`

### Frontend Not Connecting to Backend
**Solution:**
- Ensure backend servers are running on ports 5000 and 5001
- Check that API URLs in frontend match:
  - `frontend/src/services/api.js` → `http://localhost:5000/api`
  - `admin-frontend/src/services/adminApi.js` → `http://localhost:5001/api`

## 📝 Default Ports

- **User Frontend:** 3000
- **Admin Frontend:** 3001
- **Main Backend:** 5000
- **Admin Backend:** 5001
- **MongoDB:** 27017

## 📜 License

This project is licensed under the MIT License.

## 👨‍💻 Contributors

Team CleanStreet - Infosys SpringBoard Internship Project

## 🆘 Support

For issues and questions, please create an issue in the [GitHub repository](https://github.com/springboardmentor211/CleanStreet_Team2/issues).

---

**Made with ❤️ for cleaner cities**
