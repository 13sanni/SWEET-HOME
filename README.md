# Sweet Home — Hotel Booking Platform

A full-stack hotel booking platform built with **React**, **Node.js/Express**, **MongoDB**, **Clerk** (auth), **Cloudinary** (image uploads), **Stripe** (payments), and **Nodemailer** (email notifications).

---
#live demo
Frontend :https://sweet-home-theta.vercel.app/
Backend :https://sweet-home-z6pr.onrender.com
## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, React Router, Axios     |
| Auth      | Clerk (webhooks for user sync)          |
| Backend   | Node.js, Express                        |
| Database  | MongoDB (Mongoose)                      |
| Payments  | Stripe Checkout                         |
| Storage   | Cloudinary                              |
| Email     | Nodemailer (Mailgun SMTP)               |

---

## Project Structure

```
SWEET-HOME/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── context/   # AppContext (axios base URL, global state)
│   │   └── pages/
│   └── .env           # Frontend environment variables
└── server/          # Express backend
    ├── configs/       # DB, Cloudinary, Nodemailer, env validation
    ├── controllers/   # Route handlers
    ├── middleware/
    ├── models/
    ├── routes/
    └── .env           # Backend environment variables
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster
- Clerk account
- Stripe account
- Cloudinary account

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Variables

**`server/.env`**
```env
PORT=3000
MONGODB_URI=<your-mongodb-uri>
CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
CLERK_WEBHOOK_SECRET=<your-clerk-webhook-secret>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>
SENDER_EMAIL=<your-sender-email>
CURRENCY=$
FRONTEND_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
VITE_CURRENCY=$
```

### Running Locally

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

---

## Deployment

### Backend (e.g. Render)
1. Deploy the `server/` directory.
2. Set all environment variables from `server/.env` in your hosting dashboard.
3. Update `FRONTEND_URL` to your deployed frontend URL.

### Frontend (e.g. Vercel)
1. Deploy the `client/` directory.
2. Set all environment variables from `client/.env` in your hosting dashboard.
3. Update `VITE_BACKEND_URL` to your deployed backend URL.

> **Clerk Webhooks**: After deploying the backend, update your Clerk webhook endpoint to `https://<your-backend-url>/api/clerk`.  
> **Stripe Webhooks**: Update your Stripe webhook endpoint to `https://<your-backend-url>/api/stripe`.

---

## API Overview

| Method | Endpoint                        | Description                      |
|--------|---------------------------------|----------------------------------|
| GET    | `/api/rooms/all`                | Fetch all active rooms           |
| GET    | `/api/rooms/:id`                | Fetch room by ID                 |
| POST   | `/api/rooms`                    | Create a room (owner only)       |
| POST   | `/api/bookings`                 | Create a booking                 |
| GET    | `/api/bookings/user`            | Get user's bookings              |
| POST   | `/api/bookings/stripe-payment`  | Initiate Stripe checkout         |
| GET    | `/api/hotels/owner`             | Get owner's hotels               |
| POST   | `/api/clerk`                    | Clerk webhook (user sync)        |
| POST   | `/api/stripe`                   | Stripe webhook (payment update)  |

---


