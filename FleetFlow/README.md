# FleetFlow 🚛

> Full-stack fleet management platform — React.js · Node.js · Express.js · MySQL

---

## 📁 Project Structure

```
FleetFlow/
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # MySQL connection pool (mysql2)
│   │   ├── middleware/
│   │   │   ├── errorHandler.js # Centralised error handling
│   │   │   └── requestLogger.js# Morgan HTTP logger
│   │   ├── routes/
│   │   │   ├── index.js        # Central API router
│   │   │   └── health.routes.js# Health-check endpoints
│   │   └── server.js           # Express app + server bootstrap
│   ├── .env                    # Environment variables (git-ignored)
│   ├── .gitignore
│   └── package.json
│
├── frontend/                   # React 18 + Vite app
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js    # Axios instance with interceptors
│   │   │   └── health.api.js   # Health endpoint wrappers
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    # Dashboard / landing page
│   │   │   └── NotFoundPage.jsx# 404 page
│   │   ├── router/
│   │   │   └── AppRouter.jsx   # React Router v6 route map
│   │   ├── App.jsx             # Root component (BrowserRouter)
│   │   ├── index.css           # Global design system (CSS vars)
│   │   └── main.jsx            # React DOM entry point
│   ├── .env                    # VITE_ env vars
│   ├── .gitignore
│   ├── index.html              # HTML shell with SEO meta
│   ├── package.json
│   └── vite.config.js          # Vite config (proxy, path alias)
│
├── database/
│   └── init.sql                # DB creation + table stubs
│
└── README.md
```

---

## ⚡ Quick Start

### 1. Database Setup

```sql
-- In MySQL client or Workbench:
SOURCE /path/to/FleetFlow/database/init.sql;
```

### 2. Backend

```bash
cd backend

# Copy and fill in your credentials
copy .env .env.local    # Windows
# or: cp .env .env.local  # Linux / macOS

# Edit .env — set DB_PASSWORD, DB_USER, etc.

npm install       # already done if you cloned fresh
npm run dev       # nodemon watches src/ and auto-restarts
```

The API will be available at **http://localhost:5000**

| Endpoint         | Method | Description          |
|------------------|--------|----------------------|
| `/api/health`    | GET    | API liveness check   |
| `/api/health/db` | GET    | Database ping check  |

### 3. Frontend

```bash
cd frontend

npm install       # already done if you cloned fresh
npm run dev       # Vite dev server with HMR
```

The app will open at **http://localhost:5173**

> Vite automatically proxies `/api/*` → `http://localhost:5000` so no CORS issues during development.

---

## 🛠️ Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 18, React Router v6, Vite 5         |
| HTTP Client| Axios (with request/response interceptors)|
| Backend    | Node.js, Express 5                        |
| Database   | MySQL 8 via mysql2 (connection pool)      |
| Security   | Helmet, CORS, express-rate-limit          |
| Logging    | Morgan                                    |
| Dev Tools  | Nodemon                                   |

---

## 🗺️ Adding a New Module

1. **Backend** — create `src/routes/vehicles.routes.js` → register in `src/routes/index.js`
2. **Frontend** — create `src/api/vehicles.api.js` + `src/pages/VehiclesPage.jsx` → add a `<Route>` in `AppRouter.jsx`
3. **Database** — uncomment / add the table definition in `database/init.sql`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable               | Default          | Description              |
|------------------------|------------------|--------------------------|
| `PORT`                 | `5000`           | Express server port      |
| `DB_HOST`              | `localhost`      | MySQL host               |
| `DB_PORT`              | `3306`           | MySQL port               |
| `DB_USER`              | `root`           | MySQL user               |
| `DB_PASSWORD`          | —                | MySQL password           |
| `DB_NAME`              | `fleetflow_db`   | Database name            |
| `DB_POOL_MAX`          | `10`             | Max pool connections     |
| `CORS_ORIGIN`          | `http://localhost:5173` | Allowed origins   |
| `RATE_LIMIT_MAX`       | `100`            | Requests per 15 min      |

### Frontend (`frontend/.env`)

| Variable            | Default | Description              |
|---------------------|---------|--------------------------|
| `VITE_API_BASE_URL` | `/api`  | API base URL             |
| `VITE_APP_NAME`     | `FleetFlow` | App display name    |

---

## 📄 License

ISC
