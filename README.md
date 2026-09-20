# ScanBite - QR Code Restaurant Ordering System 🍽️📱

Welcome to **ScanBite** (Restaurant QR Ordering System)! This is a full-stack, real-time web application designed to streamline the dining experience. Customers can scan a QR code at their table to view the menu, place orders, and track their status in real-time. Meanwhile, restaurant staff (waiters, kitchen staff, and admins) have dedicated role-based dashboards to manage the flow of orders effortlessly.

---

## 🌟 Key Features

- **Customer Flow**: Scan a table-specific QR code, browse a beautifully categorized menu, customize items, and place orders directly from a smartphone.
- **Real-Time Updates**: Built with WebSockets (STOMP/SockJS), meaning as soon as an order is placed or updated by the kitchen, the customer's screen reflects it instantly.
- **Role-Based Staff Portals**: 
  - **Waiters**: Accept incoming orders and mark prepared food as delivered. Can also settle bills and free up tables.
  - **Kitchen**: View accepted orders and update their status (Preparing -> Ready).
  - **Admin**: Access a powerful analytics dashboard with visual charts (Income tracking, Top selling items) and manage the menu/categories.
- **Secure Authentication**: Uses modern, secure `HttpOnly` cookies and JWTs for staff authentication.

---

## 🛠️ Technology Stack

- **Backend**: Java 17, Spring Boot 3, Spring Data JPA, PostgreSQL, Spring Security (JWT via Cookies), WebSocket.
- **Frontend**: React 18, Vite, TypeScript, React Router, Recharts (for analytics), Axios, STOMP.js.

---

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:
1. **Java 17+**
2. **Maven**
3. **Node.js 18+**
4. **PostgreSQL** (Running locally or via Docker)

### 1. Database Setup

Create a PostgreSQL database named `restaurant_db`. You can do this via your SQL client or terminal:
```sql
CREATE DATABASE restaurant_db;
```

**Alternative (Docker)**: If you prefer Docker, you can run the included `docker-compose` to spin up a PostgreSQL container (this maps to port `5433` to avoid conflicts):
```powershell
docker compose up -d postgres
```

### 2. Start the Backend (Spring Boot)

Navigate to the `backend` directory and start the server using Maven.

```powershell
cd backend
mvn spring-boot:run
```
*Note: If you are using the Docker setup (port 5433), you must override the database URL before running:*
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5433/restaurant_db"
mvn spring-boot:run
```

**What happens on first startup?**
The backend will automatically create all necessary database tables and populate them with sample data (5 tables, 5 categories, 15 menu items). It also creates three default staff accounts:
- **Admin**: `admin@restaurant.com` / `admin123`
- **Waiter**: `waiter@restaurant.com` / `waiter123`
- **Kitchen**: `kitchen@restaurant.com` / `kitchen123`

### 3. Start the Frontend (React)

Open a new terminal window, navigate to the `frontend` directory, install dependencies, and start the Vite development server.

```powershell
cd frontend
npm install
npm run dev
```

### 4. Explore the App!

The application is now running. Open your browser and explore:

- **The Customer Experience**: Go to `http://localhost:5173/menu?table=1` to simulate a customer scanning the QR code at Table 1.
- **The Staff Portal**: Go to `http://localhost:5173/admin/login` and log in using the credentials listed in Step 2 to explore the dashboards.

---

## 🔄 Understanding the Order Workflow

1. **Order Placed**: Customer adds items to their cart at `http://localhost:5173/menu?table=1` and checks out. The order enters the `NEW` state.
2. **Waiter Accepts**: Waiter logs in, goes to the "New Orders" tab, and clicks "Accept". The order moves to `ACCEPTED`.
3. **Kitchen Prepares**: Kitchen staff logs in, sees the accepted order, and marks it as `PREPARING`, then `READY` when the food is cooked.
4. **Waiter Delivers**: Waiter sees the order in "Ready Orders" and delivers the food to the table, marking it as `DELIVERED`.
5. **Payment Settled**: The Waiter or Admin clicks "Bill/Settle" for the table. The active session is closed, the order becomes `PAID`, and the table is freed for the next customer.
6. **Live Tracking**: Throughout this entire process, the customer's phone updates automatically without them needing to refresh the page!