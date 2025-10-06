
# 🌍 CauseConnect

**CauseConnect** is a web platform designed to bridge the gap between **NGOs, donors, and volunteers**.
It enables users to explore NGOs, participate in events, donate, and manage causes seamlessly — powered by **React, Hasura GraphQL, Supabase, and Firebase Authentication**.


## 🚀 Project Overview

CauseConnect connects people with social causes through a transparent and interactive platform.
It provides role-based functionalities for users, organizers, and admins, allowing NGOs to host events, collect donations, and manage engagement efficiently.


## 🧩 Tech Stack

| Layer                       | Technology Used                                   |
| --------------------------- | ------------------------------------------------- |
| **Frontend**                | React (Vite) + Apollo Client                      |
| **Backend**                 | Hasura GraphQL Engine (connected to Postgres DB)  |
| **Database**                | PostgreSQL (via Supabase)                         |
| **Authentication**          | Firebase Authentication                           |
| **Storage**                 | Supabase Storage (for profile pictures and media) |
| **Testing**                 | React Testing Library + Jest                      |
| **Version Control / CI**    | Git & GitHub                                      |
| **Migrations / Management** | Hasura CLI                                        |


## 🗂️ Database Schema

### **Users**

* `id`, `email`, `full_name`, `role (user/organizer/admin)`, `profile_picture`, `created_at`

### **NGOs**

* `id`, `name`, `cause`, `description`, `location`, `contact_info`, `donation_link`, `profile_picture`, `created_by`, `created_at`

### **Events**

* `id`, `ngo_id`, `title`, `description`, `event_date`, `location`, `volunteers_needed`, `created_at`

### **Donations**

* `id`, `user_id`, `ngo_id`, `amount`, `created_at`

### **Favorites**

* `id`, `user_id`, `ngo_id`, `created_at`, `UNIQUE(user_id, ngo_id)`


## 🔑 Roles and Permissions (via Hasura)

* **Admin:** Full access to all tables (manage users, NGOs, and events).
* **Organizer:** Can manage NGOs and events they created.
* **User:** Can view NGOs/events, make donations, and favorite NGOs.


## 🧠 Features Implemented

✅ Database schema for users, NGOs, events, donations, and favorites.
✅ Profile picture support for both users and NGOs via Supabase Storage.
✅ Apollo Client setup with secure Hasura Cloud integration.
✅ Firebase Authentication (initial setup) for user.
✅ Role-based access control configured through Hasura Console.
✅ Hasura CLI integrated for schema and migration management.
✅ Sample data added to all tables for frontend testing.


## ⚙️ Setup Instructions

### **1. Clone the repository**

```bash
git clone https://github.com/yourusername/causeconnect.git
cd causeconnect
```

### **2. Install dependencies**

```bash
npm install
```

### **3. Configure environment variables**

Create a `.env` file in the root and add:

```bash
VITE_HASURA_GRAPHQL_URL=https://your-hasura-instance.hasura.app/v1/graphql
VITE_HASURA_ADMIN_SECRET=your-admin-secret
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
```

### **4. Run the development server**

```bash
npm run dev
```

## 🧪 Testing

Run component and integration tests using React Testing Library:

```bash
npm test
```

## Project Structure
```
CauseConnect/
├── client/                # Frontend React app (Vite)
│   ├── src/
│   │   ├── apolloClient.js
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── TestComponent.jsx
│   │   │   └── … (other pages)
│   │   ├── components/
│   │   └── tests/
│   ├── package.json
│   └── vite.config.js
│
├── hasura/                # Hasura metadata & migrations (via CLI)
│   ├── migrations/
│   └── metadata/
│
├── .env                   # Environment variables for frontend and backend
├── README.md
└── … other config files

```

## 📈 Progress Summary

* Implemented full **database schema** and linked it to Hasura Cloud.
* Configured **Apollo Client** for GraphQL communication.
* Set up **Hasura role-based permissions** for all tables.
* Integrated **Hasura CLI** for local schema and migration management.
* Initialized **Firebase Authentication** for secure user login/signup.
* Added **sample data** for testing and UI rendering.
* Implemented **React Testing Library** for validating components.
  

## 💡 Further Enhancements

* Full Firebase Auth integration with Hasura JWT roles.
* Event registration and volunteer tracking.
* NGO dashboard for analytics and donation management.
* Real-time updates for donations and events using GraphQL.
* Enhanced UI with Tailwind.
