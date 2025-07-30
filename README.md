# 🚌 RideSafe - School Transportation Management System

A modern React-based web application for managing school transportation services with real-time tracking, payment management, and administrative controls.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ride-safe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Authentication**: Firebase (coming soon)
- **Database**: Firebase Firestore (coming soon)

## 📁 Project Structure

```
/ride-safe
├── public/
├── src/
│   ├── pages/
│   │   └── LoginPage.tsx      # Login page with User/Admin/Driver tabs
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Features

### Current Implementation
- ✅ **Complete Authentication System** with Firebase:
  - **User Login**: Email/password authentication with email verification
  - **Admin Login**: Email/password authentication with admin codes
  - **Driver Login**: Email/password authentication
- ✅ **User Dashboard** with comprehensive features:
  - **Overview Tab**: Welcome screen, admission status, monthly fees
  - **Admission Tab**: Application form submission and status tracking
  - **Services Tab**: Transportation service details
  - **Schools Tab**: School information
  - **Tracking Tab**: Real-time bus tracking (placeholder)
  - **Payments Tab**: Payment management (placeholder)
  - **Reviews Tab**: Service reviews and ratings (placeholder)
- ✅ **Admin Dashboard** with full management:
  - **Overview**: Admin statistics and quick actions
  - **Admissions**: Review and approve/reject admission forms with monthly amounts
  - **Change Requests**: Handle user change requests
  - **Admin Codes**: Generate and manage admin access codes
- ✅ **Real-time Data Sync**: Firebase Firestore integration
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **Modern UI** with smooth animations
- ✅ **TypeScript** for type safety

### Coming Soon
- 🔄 Driver Dashboard
- 🔄 Real-time Bus Tracking with GPS
- 🔄 Payment System (PayPal integration)
- 🔄 Email Notifications
- 🔄 Mobile App

## 🎯 Login Page Features

- **Three Authentication Types**:
  - **User**: Email/password for parents/students
  - **Admin**: Email/password for administrators
  - **Driver**: Phone number for bus drivers

- **Modern Design**:
  - Clean, professional interface
  - Smooth tab transitions
  - Responsive layout
  - Password visibility toggle
  - Form validation

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API (for future tracking features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# PayPal Configuration (for future payment features)
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

**To get Firebase configuration:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click "Add app" > Web app
6. Copy the configuration values to your `.env` file

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for safe school transportation** 