# SWEET-HOME

A full-stack hotel booking platform with separate guest/user and hotel-owner flows.

## Features (Brief)

- Search rooms by destination, check-in/check-out dates, and number of rooms.
- Live room availability checks for selected dates and requested quantity.
- Browse all rooms with filters (room type, price range) and sorting.
- Room details with image gallery, amenities, and booking flow.
- User bookings page with payment status, Stripe checkout, and cancellation.
- Recent searched cities persisted for signed-in users.
- Clerk authentication and webhook-based user sync.
- Hotel owner dashboard with:
  - booking/revenue summary,
  - hotel CRUD (create, edit, delete),
  - room CRUD,
  - room inventory and active/inactive toggle.
- Stripe webhook handling to mark bookings paid.
- Booking confirmation emails via SMTP/Nodemailer.
- Cloudinary image upload for room images.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Clerk, Axios
- Backend: Node.js, Express, MongoDB/Mongoose
- Integrations: Stripe, Clerk, Cloudinary, Nodemailer

## Project Structure

- `client/` React frontend
- `server/` Express API

## Setup

1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

2. Configure environment variables

- Frontend (`client/.env`):
  - `VITE_BACKEND_URL`
  - `VITE_CLERK_PUBLISHABLE_KEY`
  - `VITE_CURRENCY` (optional)

- Backend (`server/.env`):
  - `MONGODB_URI`
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SENDER_EMAIL`
  - `PORT` (optional)

3. Run apps

```bash
# Terminal 1
cd server
npm run server

# Terminal 2
cd client
npm run dev
```

## Environment File Safety

Environment files are ignored by Git so secrets are not pushed to GitHub.
Current ignore patterns include:

- `.env`
- `.env.*`
- `client/.env*`
- `server/.env*`
