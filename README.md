
# 🌍∞ **CauseConnect**

**CauseConnect** is a full-stack web platform built to bridge the gap between **NGOs, donors, and volunteers**.
It enables users to explore NGOs, participate in events, make donations, and manage causes seamlessly — powered by **React, Express, GraphQL, Prisma, PostgreSQL, and JWT Auth**.

Explore **CauseConnect**: https://causeconnect-zeta.vercel.app/

<img width="1898" height="876" alt="1" src="https://github.com/user-attachments/assets/619a51b7-2389-4d2e-8098-8d26fe4d6bea" />


## 🚀 **Overview**

CauseConnect provides a **transparent and interactive platform** that connects people with social causes.
It offers role-based functionalities for **donors**, **organizers**, and **admins**, allowing NGOs to host events, track donations, and manage engagement efficiently.

The platform’s architecture is designed to be **scalable**, **modular**, and **easy to maintain**, integrating modern technologies across the stack.



## ✨ **Core Features**

### 👤 **User Authentication & Role Management**

* Secure signup/login using **email-password** or **Google OAuth**.
* Role selection during signup: `Donor` or `Organizer`.
* Extended registration form for collecting user details like profile, interests, and skills.
* Role-based dashboards for personalized access and actions.

### 🏢 **NGO and Project Listings**

* Browse NGOs or projects by **name**, **location**, or **category**.
* View detailed NGO pages with mission statements, images, contact info, and donation links.
* Add NGOs to **Favorites** for quick access.

### 💝 **Donations & Favorites**

* Donate securely to verified NGOs via integrated donation links.
* Manage and view donation history.
* Maintain a personalized **Favorites List** of NGOs or causes.

### 🧰 **Organizer Dashboard**

* Register and manage your NGO profile.
* Create, edit, and delete projects/events.
* View donations and engagement analytics in real time.

### 📊 **User Dashboard **

* Visualize user contributions and volunteering impact.



## 🧩 **Tech Stack**

### 🖥️ **Frontend**

* ⚛️ **ReactJS** — modular UI and SPA architecture.
* 🎨 **Material UI (MUI)** — responsive and accessible design components.
* 🔄 **Apollo Client** — efficient data fetching and caching for GraphQL queries.
* 🧭 **React Router** — SPA routing and protected routes.

### ⚙️ **Backend**

* 🧱 **Express.js** — Node.js framework for REST and GraphQL endpoints.
* 🧩 **Apollo Server** — GraphQL API for real-time queries, mutations, and subscriptions.
* 🧠 **Prisma ORM** — connects Express with PostgreSQL for schema management and migrations.

### 🗄️ **Database**

* 🐘 **PostgreSQL** (via **Neon Cloud**) — relational database for storing NGOs, donations, and users.

### 🔐 **Authentication**

* 🔒 **JWT-based session management** for role-based access control.

### ☁️ **Deployment**

* 🚀 **Frontend:** Deployed on **Vercel** (automatic builds, CDN, HTTPS).
* ⚙️ **Backend:** Hosted on **Render** (Node.js + GraphQL server).
* 🗃️ **Database:** Managed **PostgreSQL** on **Neon** cloud.

### 🧪 **Testing & Monitoring**

* ✅ **Cypress** — end-to-end tests for validating major user journeys (login, favorites, donations, NGO creation).
* 🛡️ **Sentry** — integrated for frontend and backend error monitoring.



## ⚒️ **Project Setup**

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/Saiesha10/CauseConnect.git
cd causeconnect
```

### **2️⃣ Install Dependencies**

**Frontend:**

```bash
cd client
npm install
```

**Backend:**

```bash
cd server
npm install
```

### **3️⃣ Environment Setup**

Create `.env` files in both `client` and `server` directories:

**Client (.env):**

```
REACT_APP_GRAPHQL_URI=https://your-backend-url/graphql
VITE_CLOUDINARY_CLOUD_NAME="cloud_name"
VITE_CLOUDINARY_UPLOAD_PRESET="preset"
```

**Server (.env):**

```
DATABASE_URL=postgresql://user:password@host:port/dbname
PORT="your_port"
JWT_SECRET=your_jwt_secret
```

### **4️⃣ Run the App**

**Frontend:**

```bash
npm run dev
```

**Backend:**

```bash
node src/index.js
```

### **5️⃣ Run Tests**

```bash
npx cypress open
```

Runs Cypress tests for all major user flows (FavoritesList, Dashboard, Events,Donation, NGO_Listings, NGO_Details, Signup, Login).




