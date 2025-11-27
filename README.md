# 🚗 Smart Car Parking System

---

## 📖 Overview

A full-stack Smart Car Parking System designed to simplify the process of booking and managing parking spots in real-time. Built with React, Spring Boot, and Razorpay, it offers a seamless experience with mapping, payments, and role-based access.

---

## 🌐 Live Deployment

- **Frontend (Netlify)**: [https://parkeasein.netlify.app](https://parkeasein.netlify.app)
- **Backend API (Render)**: [https://smart-car-parking-wa4f.onrender.com](https://smart-car-parking-wa4f.onrender.com)
- **Database**: PostgreSQL (Neon)

---

## 🛠️ Tech Stack

### 🖥️ Frontend

- **React.js**
- **Tailwind CSS**
- **React Router**
- **Axios**
- **OpenStreetMap (Leaflet)**

### 🧠 Backend

- **Spring Boot (Java)**
- **MySQL**
- **JWT Authentication + Google OAuth**
- **Razorpay Payment Integration**

---

## 📦 Features

### 🚙 User Features

- Secure login via JWT and Google OAuth
- Search & book parking via interactive map
- Real-time slot availability
- Navigation directions
- Booking history & invoices

### 🅿️ Parking Owner Features

- Add/Edit parking spaces and slots
- Floor-wise management
- Set dynamic pricing and availability
- Bank account integration

### 🛡️ Admin Features

- View and manage users, owners, and bookings
- Monthly reports
- Role-based dashboard

### 💳 Payment System

- Razorpay integration
- Time-based pricing
- Invoice generation

---

## 🗂️ Project Structure

```
smart-car-parking-system/
├── backend/
│   └── src/
│       ├── main/java/com/parking/...
│       └── resources/application.properties
├── smart-parking/
│   └── src/
│       ├── components/
│       └── pages/
└── README.md
```

---

## 🚀 Getting Started

### ▶️ Backend Setup

```bash
cd smart-parking-backend
mvn spring-boot:run
```

### 💻 Frontend Setup

```bash
cd smart-parking
npm install
npm run dev
```

---

## 🤝 Team Members

| Name               | Role                 |
| ------------------ | -------------------- |
| **Ganesh Pansare** | Full Stack Developer |
| **Atharv Raut**    | Frontend Specialist  |

---

## 📞 Support

For support, email grpansare2002@gmail.com or create an issue in this repository.
