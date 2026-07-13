<div align="center">

# ✈️ TripNest

### Travel Planning & Trip Management Platform

*Plan smarter. Travel better. Nest your adventures.*

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.1-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**TripNest** is a full-stack travel planning and trip management platform that empowers travelers to plan, organize, and track every aspect of their journeys — all in one place. From crafting detailed itineraries and managing budgets to exploring destinations and collaborating with travel groups, TripNest provides a seamless end-to-end travel experience.

The platform is built with a modern **Spring Boot** REST API backend and a responsive **React** frontend, containerized with **Docker** for easy deployment.

---

## ✨ Features

### 🗺️ Trip Management
- Create, edit, and delete trips with rich metadata (destination, dates, status, cover images)
- Track trip status: **Planning → Active → Completed**
- View all upcoming and past trips from a unified dashboard

### 📅 Itinerary Planning
- Build day-by-day itineraries with individual activities
- Set activity times, locations, and notes
- AI-assisted suggestions powered by the **Gemini API**

### 🏙️ Destination Explorer
- Browse and search destinations with rich photo galleries via **Unsplash API**
- View live weather forecasts at any destination via **OpenWeather API**
- Save favorite destinations for future trips

### 💰 Budget & Expense Tracking
- Set and monitor trip budgets by category
- Log and categorize expenses with currency support
- Visual budget breakdowns and spending summaries

### 👥 Group Travel
- Create travel groups and invite collaborators
- Share trip plans and itineraries with group members
- Role-based access within groups

### 📊 Reports & Analytics
- Visual spending analytics with interactive charts (Chart.js)
- Trip activity summaries and historical reports
- Export-ready data views

### 📄 Document Management
- Attach travel documents (visas, tickets, reservations) to trips
- Organized document storage per trip

### 🔐 Authentication & Security
- JWT-based stateless authentication
- User registration, login, OTP verification, and password reset
- Spring Security with route-level access control

---

## 🏗️ Architecture

```
TripNest/
├── Backend/                        # Spring Boot REST API (Java 21)
│   ├── src/main/java/com/tripnest/
│   │   ├── activity/               # Activity module
│   │   ├── analytics/              # Analytics & reporting
│   │   ├── auth/                   # Authentication (JWT, OTP)
│   │   ├── budget/                 # Budget management
│   │   ├── common/                 # Shared DTOs, utilities
│   │   ├── config/                 # Spring config (CORS, OpenAPI, Seeder)
│   │   ├── exception/              # Global exception handling
│   │   ├── expense/                # Expense tracking
│   │   ├── group/                  # Group travel
│   │   ├── itinerary/              # Itinerary planning
│   │   ├── media/                  # Document/media management
│   │   ├── notification/           # User notifications
│   │   ├── security/               # JWT filter, Spring Security
│   │   ├── trip/                   # Core trip management
│   │   ├── user/                   # User profiles & settings
│   │   └── util/                   # Helpers & utilities
│   ├── src/main/resources/
│   │   └── application.yml         # Spring config (env-variable driven)
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                       # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── auth/               # Auth form components
│   │   │   ├── dashboard/          # Dashboard layout & sidebar
│   │   │   ├── destinations/       # Destination cards & details
│   │   │   ├── itinerary/          # Itinerary builder components
│   │   │   ├── trips/              # Trip cards & forms
│   │   │   └── ui/                 # Generic UI (Toast, Spinner, etc.)
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── auth/               # Login, Register, OTP, Reset
│   │   │   ├── budget/             # Budget dashboard
│   │   │   ├── dashboard/          # Main dashboard home
│   │   │   ├── destinations/       # Destination explorer
│   │   │   ├── documents/          # Document management
│   │   │   ├── expenses/           # Expense dashboard
│   │   │   ├── groups/             # Groups dashboard
│   │   │   ├── itinerary/          # Itinerary dashboard
│   │   │   ├── reports/            # Analytics & reports
│   │   │   └── trips/              # My trips, create, details
│   │   ├── services/               # Axios API service layer
│   │   └── utils/                  # Utility functions
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml              # Orchestrates DB + Backend + Frontend
└── .env.example                    # Environment variable template
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend Language** | Java 21 |
| **Backend Framework** | Spring Boot 3.3.1 |
| **Security** | Spring Security + JWT (JJWT 0.12.5) |
| **ORM** | Spring Data JPA + Hibernate |
| **Database (prod)** | PostgreSQL 15 |
| **Database (dev)** | MySQL 8 |
| **Build Tool** | Maven 3.9 |
| **Code Generation** | Lombok + MapStruct |
| **API Docs** | SpringDoc OpenAPI (Swagger UI) |
| **Frontend Language** | JavaScript (ES2022) |
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router DOM 7 |
| **HTTP Client** | Axios |
| **Charts** | Chart.js + react-chartjs-2 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Forms** | React Hook Form |
| **Containerization** | Docker + Docker Compose |
| **Web Server** | Nginx (frontend prod) |
| **AI Integration** | Google Gemini API |
| **Images** | Unsplash API |
| **Weather** | OpenWeather API |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java | 21+ |
| Maven | 3.9+ |
| Node.js | 20+ |
| npm | 10+ |
| Docker & Docker Compose | Latest |
| MySQL | 8+ *(for local dev without Docker)* |

### 1. Clone the Repository

```bash
git clone https://github.com/Karthikjk143/TripNest.git
cd TripNest
```

### 2. Configure Environment Variables

```bash
# Copy the example file and fill in your values
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Database
POSTGRES_PASSWORD=your_secure_db_password

# JWT — generate with: openssl rand -hex 32
APP_JWT_SECRET=your_256_bit_hex_secret

# API Keys
GEMINI_API_KEY=your_gemini_api_key
UNSPLASH_API_KEY=your_unsplash_access_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

---

## 🐳 Running with Docker (Recommended)

The easiest way to run TripNest. This starts PostgreSQL, the Spring Boot backend, and the React frontend:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Database | localhost:5432 |

To stop all services:
```bash
docker-compose down
```

To stop and remove all data volumes:
```bash
docker-compose down -v
```

---

## 💻 Running Locally (Development)

### Backend

```bash
cd Backend

# Option 1: Set env vars inline and run with Maven
APP_JWT_SECRET=your_secret \
GEMINI_API_KEY=your_key \
UNSPLASH_API_KEY=your_key \
OPENWEATHER_API_KEY=your_key \
mvn spring-boot:run

# Option 2: Package and run the JAR
mvn clean package -DskipTests
java -jar target/tripnest-0.0.1-SNAPSHOT.jar
```

> **Note:** For local MySQL development, ensure MySQL 8 is running and update `SPRING_DATASOURCE_URL` in your `.env` or `application.yml` defaults accordingly.

The backend starts at **http://localhost:8080**

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend starts at **http://localhost:5173**

> **Tip:** Create a `frontend/.env.local` with `VITE_API_URL=http://localhost:8080/api/v1` for local API connections.

---

## 📚 API Documentation

Once the backend is running, interactive API documentation is available via **Swagger UI**:

```
http://localhost:8080/swagger-ui.html
```

All endpoints follow the convention:
```
/api/v1/{resource}
```

Key API modules:
- `/api/v1/auth` — Registration, login, OTP, password reset
- `/api/v1/trips` — CRUD for trips
- `/api/v1/itinerary` — Itinerary management
- `/api/v1/destinations` — Destination search & details
- `/api/v1/expenses` — Expense tracking
- `/api/v1/budget` — Budget management
- `/api/v1/groups` — Group travel
- `/api/v1/analytics` — Reports & analytics

---

## 🔑 Third-Party API Setup

| API | Purpose | Get Key |
|---|---|---|
| **Google Gemini** | AI trip suggestions | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **Unsplash** | Destination photography | [Unsplash Developers](https://unsplash.com/developers) |
| **OpenWeather** | Live weather forecasts | [OpenWeatherMap](https://openweathermap.org/api) |

---

## 🔒 Security Notes

- All secrets are managed via **environment variables** — never hardcoded.
- The `.env` file is listed in `.gitignore` and **must never be committed**.
- JWT tokens expire after **24 hours** by default (configurable via `APP_JWT_SECRET` and `expiration-ms`).
- CORS is configured to restrict origins in production — update `CorsConfig.java` with your domain.
- Always generate a strong, unique `APP_JWT_SECRET` for production (minimum 256 bits).

```bash
# Generate a secure JWT secret
openssl rand -hex 32
```

---

## 🧪 Running Tests

```bash
# Backend unit & integration tests
cd Backend
mvn test

# Frontend linting
cd frontend
npm run lint
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add some feature'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Karthikjk143](https://github.com/Karthikjk143)

⭐ Star this repo if you find it useful!

</div>
