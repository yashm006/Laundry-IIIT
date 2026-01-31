# College Laundry Management System - Deployment Guide

## Two Separate Portals

This system has been designed with **two completely separate portals** to maintain institutional separation:

### 1. Student Portal
**URL:** `your-domain.com/student`

**Purpose:** Students can track their laundry status and mark items as picked up.

**Features:**
- Student registration with Student ID
- View laundry history (In Progress / Picked Up)
- See "Ready for Pickup" notifications
- Mark completed laundry as picked up
- Mobile-responsive design

**Storage:** Uses `student_token` and `student_user` in localStorage

---

### 2. Worker Portal
**URL:** `your-domain.com/worker`

**Purpose:** Laundry staff can manage all laundry operations.

**Features:**
- Worker registration and login
- Create new laundry entries with multiple items
- View all entries with filters (All/Received/Completed/Picked Up)
- Mark laundry as completed (triggers email receipt)
- Real-time statistics dashboard
- Professional data table interface

**Storage:** Uses `worker_token` and `worker_user` in localStorage

---

## Access Instructions

### For Students:
1. Share this URL with students: `your-domain.com/student`
2. Students register with:
   - Name
   - Student ID
   - Email
   - Password

### For Workers:
1. Share this URL with laundry staff: `your-domain.com/worker`
2. Workers register with:
   - Name
   - Email
   - Password

---

## Key Benefits of Separation

1. **No Confusion:** Students and workers cannot accidentally access the wrong portal
2. **Separate Authentication:** Each portal has its own login system
3. **Role Validation:** Backend ensures users can only access their designated portal
4. **Institutional Compliance:** Meets requirement for separate systems
5. **Independent Deployments:** Can be deployed on different domains if needed

---

## Backend Configuration

### Email Receipts (Optional)
To enable email receipts when laundry is completed, add to `/app/backend/.env`:
```
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=laundry@yourcollege.edu
```

Get your Resend API key at: https://resend.com

---

## Default Route
- Accessing root URL (`/`) automatically redirects to `/student`
- Workers should bookmark `/worker` for direct access

---

## Security Features
- JWT-based authentication
- Role-based access control
- Separate token storage
- Password hashing with bcrypt
- Protected API endpoints

---

## Database
- MongoDB with separate collections for users and laundry entries
- Shared database between both portals
- Workers update entries, students view their own data only
