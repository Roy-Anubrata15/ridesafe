# Test Scenarios Guide for RideSafe Admission System

## Overview

This guide explains how to test different admission scenarios in the RideSafe application. The test scenarios allow you to quickly switch between different user states to see how the interface changes.

## How to Access Test Scenarios

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to test scenarios:**
   - Go to `http://localhost:5173/test-scenarios`
   - Or use the floating navigation menu (bottom-right corner)

## Available Test Scenarios

### 1. **Approved Admission Scenario** ✅
**What it shows:** How the user dashboard looks when an admin has approved their admission form.

**Features available:**
- ✅ Full access to all features
- ✅ Payments management
- ✅ Live tracking
- ✅ Service details
- ✅ Reviews and ratings
- ✅ Student information display
- ✅ Monthly fee information

**Sample Data:**
- Student: Rahul Sharma
- Class: Class 8B
- School: Delhi Public School
- Monthly Fee: ₹3,500
- Status: Active & Approved

### 2. **Original Form Scenario** 📝
**What it shows:** How the user dashboard looks when no admission form has been submitted yet.

**Features available:**
- ❌ No access to payments
- ❌ No access to tracking
- ❌ No access to services
- ✅ Admission form submission
- ✅ Basic account information

**Sample Data:**
- Student: John Doe
- Class: Class 5A
- School: St. Mary's School
- Status: No admission submitted

## How to Switch Between Scenarios

1. **Go to Test Scenarios page** (`/test-scenarios`)
2. **Click the scenario buttons:**
   - **"Set Approved Admission"** - Shows approved user experience
   - **"Set Original Form"** - Shows form submission experience

## Testing Different User States

### Testing Admission Form Submission

1. Set to "Original Form" scenario
2. Navigate to Dashboard (`/dashboard`)
3. Go to "Admission" tab
4. Fill out the admission form
5. Submit the form
6. See how the status changes to "pending"

### Testing Admin Approval Process

1. Set to "Original Form" scenario
2. Submit an admission form
3. Switch to Admin Panel (`/admin`)
4. Go to "Admissions" tab
5. Review the submitted form
6. Approve or reject with comments
7. Switch back to user dashboard to see the result

### Testing User Experience After Approval

1. Set to "Approved Admission" scenario
2. Navigate through different tabs:
   - **Overview:** See approved status and quick actions
   - **Payments:** View payment history and make payments
   - **Tracking:** Access live tracking features
   - **Services:** View service details
   - **Reviews:** Rate and review services

## Key Differences Between Scenarios

| Feature | Original Form | Approved Admission |
|---------|---------------|-------------------|
| **Dashboard Access** | Limited | Full |
| **Payments** | ❌ Blocked | ✅ Available |
| **Live Tracking** | ❌ Blocked | ✅ Available |
| **Services** | ❌ Blocked | ✅ Available |
| **Admission Form** | ✅ Required | ✅ Completed |
| **Status Display** | "Admission Required" | "Approved" |
| **Quick Actions** | Only admission | All features |

## Navigation Menu

The floating navigation menu (bottom-right) provides quick access to:
- **Test Scenarios** - Switch between user states
- **Dashboard** - Main user dashboard
- **Admin Panel** - Admin interface
- **Account Settings** - User account management

## Real-World Testing Workflow

### For Development Testing:

1. **Start with Original Form:**
   - Test form validation
   - Test form submission
   - Verify pending status

2. **Switch to Admin Panel:**
   - Review submitted forms
   - Test approval/rejection
   - Set monthly amounts

3. **Switch to Approved Admission:**
   - Test all user features
   - Verify payment integration
   - Test tracking functionality

### For User Experience Testing:

1. **Test Complete User Journey:**
   - Registration → Form Submission → Approval → Full Access

2. **Test Edge Cases:**
   - Form rejection and reapplication
   - Payment failures
   - Service interruptions

## Troubleshooting

### Common Issues:

1. **Scenarios not switching:**
   - Refresh the page
   - Check browser console for errors
   - Verify UserDataContext is working

2. **Admin panel not accessible:**
   - Check if you're logged in as admin
   - Verify admin codes are initialized
   - Check Firebase permissions

3. **Forms not submitting:**
   - Check Firebase configuration
   - Verify environment variables
   - Check network connectivity

## Next Steps for Production

1. **Remove test components** before production deployment
2. **Set up real Firebase project** with proper security rules
3. **Configure email notifications** for admission status changes
4. **Set up payment gateway** integration
5. **Implement real-time tracking** features

## Support

If you encounter issues with the test scenarios:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure Firebase is properly configured
4. Check the main README.md for setup instructions 