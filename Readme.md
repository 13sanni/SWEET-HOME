# Tourix - A Hotel Booking Platform 🏨

**Tourix** is a modern, full-stack hotel booking platform that allows hotel owners to add their hotel, manage room listings, and revenue, while offering customers a seamless experience to search, filter, book, and pay for rooms — all with real-time availability, cloud-based media, secure payments, and instant email confirmations.

## 🔗 Live Demo Link : https://tourix-eosin.vercel.app

---

## ✨ Features

### 🏢 For Hotel Owners:
- 📝 Add new hotels and upload room details with images
- 🔄 Toggle room availability in real-time
- 📈 View all bookings, customers, and total revenue in the owner dashboard
- 🧾 See booking details with customer contact information

### 🧑‍💼 For Customers:
- 🔍 Search hotels by city, checkIn date and checkOut date
- 🛏️ Filter rooms by price and room type
- ↕️ Sort rooms by price (low to high / high to low)
- 📅 Book rooms with custom check-in and check-out dates
- ❌ Cancel bookings anytime
- ✉️ Receive booking confirmation and cancellation emails via **Brevo**
- 💳 Make secure payments using **Stripe**

---

## ☁️ Media Handling

All hotel and room images are uploaded and stored securely using **Cloudinary**, a cloud-based media management service.

---

🌍 Deployment
Both the frontend and backend are deployed on **Vercel**.

---


## ⚙️ Tech Stack

**Frontend:**
- React
- Vite

**Backend:**
- Node.js
- Express

**Database:**
- MongoDB
- Mongoose

**Authentication:**
- Clerk

**Payments:**
- Stripe

**Email Notifications:**
- - ✉️ Emails (confirmation and cancellation) are sent using **Nodemailer**, configured with **Brevo SMTP** credentials.

**Media Upload:**
- Cloudinary

---

## 🔐 Environment Variables

Rename the `.env.example` files to `.env` and provide actual values to get started.

---

## 📬 Contact
Created by Ekansh Gupta
For suggestions or contributions, feel free to open an issue or PR.


