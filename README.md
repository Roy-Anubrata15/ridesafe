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
- ✅ **Beautiful Login Page** with three tabs:
  - **User Login**: Email/password authentication
  - **Admin Login**: Email/password authentication
  - **Driver Login**: Phone number OTP authentication
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **Modern UI** with smooth animations
- ✅ **TypeScript** for type safety

### Coming Soon
- 🔄 Firebase Authentication
- 🔄 User Dashboard
- 🔄 Admin Panel
- 🔄 Driver Panel
- 🔄 Real-time Bus Tracking
- 🔄 Payment System (PayPal)
- 🔄 Student Management

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
# Firebase Configuration (coming soon)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id

# Google Maps API (coming soon)
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key

# PayPal Configuration (coming soon)
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

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