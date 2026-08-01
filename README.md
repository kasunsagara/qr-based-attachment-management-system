# QR-Based Attachment Management System

A complete MERN stack application for managing machine attachments in a garment factory using unique QR codes.

## Features

*   **Admin Dashboard:** View statistics, active/inactive records, and recent scans.
*   **Module Management:** Add, edit, and delete factory production modules (e.g., Module 5, 12, 13).
*   **Attachment Type Management:** Manage machine attachments (e.g., Table, Triangle Attachment).
*   **Attachment Linking:** Link a Module and an Attachment Type to automatically generate a unique QR ID (e.g., QR0001).
*   **QR Generator:** 
    *   Bulk generate missing QR images for records.
    *   Auto-create missing combinations and generate QRs instantly.
    *   Download printable A4 PDF labels for physical tagging.
*   **Worker Scan Interface (Mobile Responsive):** Workers scan a QR code with their mobile device. It automatically opens the details page and logs the scan history in the database.
*   **Scan History:** Track every scan event, time, and device information.

## Technology Stack

*   **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, React Hot Toast
*   **Backend:** Node.js, Express.js, Mongoose, JWT (Authentication), PDFKit (Label generation), QRCode (QR image generation)
*   **Database:** MongoDB

---

## Installation & Setup

### Prerequisites

*   Node.js (v18+)
*   MongoDB (Local instance or Atlas URL)

### 1. Database Setup

1.  Make sure MongoDB is running locally on default port `27017` or have a MongoDB Atlas connection string ready.

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (you can copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qr_attachment_system
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

**Seed the Database:**
To quickly test the system, seed the initial data (5 Modules, 10 Types, 50 Combinations, and an Admin user):
```bash
npm run seed
```
*Note: Admin Credentials are `admin` / `admin123`*

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (you can copy from `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

## API Endpoints Overview

**Authentication**
*   `POST /api/auth/login`
*   `GET /api/auth/me`

**Modules (Admin Only)**
*   `GET /api/modules` (Search & Pagination)
*   `POST /api/modules`
*   `PUT /api/modules/:id`
*   `DELETE /api/modules/:id`

**Attachment Types (Admin Only)**
*   `GET /api/attachment-types`
*   `POST /api/attachment-types`
*   `PUT /api/attachment-types/:id`
*   `DELETE /api/attachment-types/:id`

**Attachments (Admin Only)**
*   `GET /api/attachments`
*   `POST /api/attachments`
*   `PUT /api/attachments/:id`
*   `DELETE /api/attachments/:id`

**QR Code Management (Admin Only)**
*   `POST /api/qr/generate/:id`
*   `POST /api/qr/bulk-generate`
*   `POST /api/qr/bulk-create`
*   `GET /api/qr/download/:id`
*   `POST /api/qr/pdf`

**Public Route (Workers)**
*   `GET /api/qr/scan/:qrId` (Retrieves info and logs scan history)
