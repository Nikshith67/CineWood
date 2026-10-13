# CineWood 🎬 — Premium Indian & International Streaming Platform

![CineWood Banner](https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80)

> **CineWood** is an enterprise-grade, full-stack OTT video streaming web application modeled after Netflix and built specifically for the vibrant Indian cinematic landscape. It delivers high-octane blockbusters and series across **Telugu, Tamil, Kannada, Hindi, Malayalam, and English** with a luxury "Cinematic Dark" aesthetic, adaptive HLS video streaming, automated watch-progress tracking, post-completion feedback, live Razorpay payment processing, and a robust administrative console.

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Technology Stack](#-technology-stack)
3. [Key Features](#-key-features)
4. [System Architecture & Data Flow](#-system-architecture--data-flow)
5. [Database Schema & Entities](#-database-schema--entities)
6. [API Reference](#-api-reference)
7. [Default Seeded Accounts & Content](#-default-seeded-accounts--content)
8. [Getting Started & Local Setup](#-getting-started--local-setup)
9. [Configuration & Environment Variables](#-configuration--environment-variables)
10. [Folder Structure](#-folder-structure)
11. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🏛 Architectural Overview

CineWood follows a modern decoupled client-server architecture:
- **Client Tier**: Single Page Application (SPA) powered by **React 19**, **Vite 8**, and a bespoke **Cinematic Dark Design System** (Tailwind CSS v4 + Vanilla CSS tokens).
- **Application Tier**: High-throughput REST API powered by **Spring Boot 3.4.5** on **Java 25**, featuring Spring Security 6 with stateless JWT authentication, in-memory rate limiting, and Hibernate batching.
- **Data Tier**: **MySQL 8.0** relational database with connection pooling handled by HikariCP.
- **Media Delivery**: Adaptive bitrate streaming via **HLS (HTTP Live Streaming)** (`.m3u8` playlists) powered by `hls.js`.
- **Payment Processing**: Integrated with **Razorpay SDK** with server-side HMAC-SHA256 signature verification and simulated test-sandbox fallbacks.

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 19 (`19.3.0`)
- **Build Tool**: Vite 8 (`8.3.0`) with `@vitejs/plugin-react`
- **Routing**: React Router DOM v7 (`7.18.3`)
- **Styling**: Tailwind CSS v4 (`4.3.3`) + Custom CSS Design System (`index.css`)
- **Streaming Engine**: HLS.js (`1.7.2`)
- **HTTP Client**: Axios (`1.20.0`) with JWT bearer request interceptors & automatic 401 session recovery
- **Typography & Icons**: Google Fonts (*Space Grotesk*, *Plus Jakarta Sans*) + Google Material Symbols Outlined + Lucide React (`1.44.0`)
- **Payment Gateway**: Razorpay Checkout (`checkout.js`)

### Backend
- **Framework**: Spring Boot 3.4.5
- **Language**: Java 25 (OpenJDK / Oracle JDK)
- **Security**: Spring Security 6 (Stateless JWT token auth, BCrypt rounds: 12)
- **Persistence**: Spring Data JPA / Hibernate 6 with MySQL Dialect & Batch Fetching
- **Database**: MySQL Server 8.0
- **Connection Pool**: HikariCP (Max: 20, Min-Idle: 5)
- **JSON Processing**: Jackson (ISO-8601 timestamps)
- **Validation**: Jakarta Bean Validation API
- **Build & Dependency Management**: Apache Maven 3.9 (via Maven Wrapper `mvnw`)
- **Developer Experience**: Spring Boot DevTools & Project Lombok

---

## ✨ Key Features

### 1. User Experience & Streaming
- **Direct-to-Browse Authentication**: Streamlined login/signup flow that bypasses manual profile selection, immediately navigating to the home catalog while seamlessly selecting the user's primary profile in the background.
- **Cinematic Hero Banner**: Automatic 8-second rotating carousel of top featured blockbusters (e.g., *Devara: Part 1*, *RRR*, *Oppenheimer*) with backdrop scrims, quick play, and more-details triggers.
- **Multi-Lingual Catalog Filters**: Instant pill-based language switching across **Telugu, Tamil, Kannada, Hindi, Malayalam, and English** with dynamic catalog querying.
- **Top 10 Ranked Showcase**: Custom Netflix-style numerical rank typography (`#1` through `#10`) with large drop-shadowed index numerals.
- **Custom HLS Video Player**:
  - Auto-detection of `.m3u8` playlists with native fallback.
  - Custom video controls (Scrubber progress, 10s skip forward/backward, volume slider, fullscreen).
  - Responsive auto-hiding controls with cursor tracking.
- **Continue Watching Row**:
  - Live watch-progress reporting back to MySQL.
  - Netflix-style red progress indicator bar overlaid along the bottom of movie cards.
- **My List & Likes**:
  - Fast client-side toggle with local storage persistence and floating global glassmorphism toast notifications.
- **Interactive Movie Detail Modal**:
  - High-resolution banners, age ratings, runtimes, cast, director, synopsis, genres, and view statistics.
- **Post-Movie Completion Feedback**:
  - Automatically pops up when a video finishes playing or via detail modal.
  - Interactive 5-star rating, review tags (*Gripping Action*, *VFX Masterpiece*, *Mind-Blowing Twists*), and textual comments recorded in the database.
- **VIP Subscription Modal**:
  - Three distinct plans: **Free (₹0)**, **Monthly (₹199)**, and **Annual VIP (₹1299)**.
  - Fully integrated Razorpay checkout modal with backend verification.

### 2. Administrator Console (`/admin`)
- Accessible exclusively by accounts with `ROLE_ADMIN` (e.g., `admin@cinewood.com`).
- **Dashboard Overview**:
  - Real-time statistics: Total Catalog Count, Total Platform Plays/Views, Active Users, and Active VIP Subscribers.
  - Top Performing Content Leaderboard.
- **Content & Catalog Management (Full CRUD)**:
  - Add, update, and delete titles.
  - Configurable metadata: title, description, language, release year, age maturity rating (`U`, `U/A`, `UA 13+`, `UA 16+`, `A`), run-time, cast, director, thumbnail poster URL, backdrop banner URL, HLS stream URL, trending status, and genres.
- **User Management**:
  - Real-time list of all registered users with subscription tiers and role filtering.
- **Payment & Transaction Audit Log**:
  - Live log of all Razorpay order IDs, payment IDs, amounts, plan types, and bank settlement timestamps.

---

## 🔄 System Architecture & Data Flow

```
                      +-----------------------------+
                      |       Web Browser           |
                      |   React 19 + HLS.js Player  |
                      +--------------+--------------+
                                     |
               HTTP Requests (Port 5173 / Vite Dev Proxy)
                                     |
                                     v
                      +-----------------------------+
                      |   Spring Boot Backend (8080)|
                      | - SecurityFilterChain       |
                      | - JwtAuthFilter             |
                      | - RateLimitFilter           |
                      +--------------+--------------+
                                     |
            +------------------------+------------------------+
            |                        |                        |
            v                        v                        v
  +-------------------+    +-------------------+    +-------------------+
  |  MySQL 8.0 (3306) |    |  Razorpay Gateway |    |  Mux / Bitdash    |
  |  (cinewood_db)    |    |  (Payments API)   |    |  (HLS CDN Streams)|
  +-------------------+    +-------------------+    +-------------------+
```

---

## 🗄 Database Schema & Entities

The application utilizes MySQL with the following primary entities:

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique user identifier |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | User login email |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | BCrypt encoded password hash |
| `role` | `VARCHAR(50)` | `NOT NULL` | Security role: `ROLE_USER` or `ROLE_ADMIN` |
| `subscription_tier` | `VARCHAR(50)` | Default `'STANDARD'` | Active tier: `FREE`, `MONTHLY`, `ANNUAL` |
| `created_at` | `DATETIME` | `NOT NULL` | Account creation timestamp |

### 2. `profiles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique profile ID |
| `user_id` | `BIGINT` | `FK -> users.id`, `NOT NULL` | Owning user reference |
| `profile_name` | `VARCHAR(50)` | `NOT NULL` | Display name of the profile |
| `avatar_url` | `VARCHAR(255)` | Nullable | Avatar image URL |
| `is_kids` | `BOOLEAN` | Default `FALSE` | Restricts content to child-safe titles |

### 3. `media_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique media item identifier |
| `title` | `VARCHAR(255)` | `NOT NULL` | Title of the movie or show |
| `description` | `TEXT` | `NOT NULL` | Plot synopsis |
| `language` | `VARCHAR(50)` | `NOT NULL` | `Telugu`, `Tamil`, `Kannada`, `Hindi`, `English`, `Malayalam` |
| `release_year` | `INT` | `NOT NULL` | Year of theatrical / OTT release |
| `age_rating` | `VARCHAR(20)` | `NOT NULL` | Maturity classification (`U`, `U/A`, `UA 13+`, `UA 16+`, `A`) |
| `duration_minutes`| `INT` | Nullable | Total run-time in minutes |
| `cast` | `VARCHAR(500)` | Nullable | Primary cast members |
| `director` | `VARCHAR(100)` | Nullable | Director name |
| `thumbnail_url` | `VARCHAR(500)` | `NOT NULL` | Vertical movie poster image |
| `banner_url` | `VARCHAR(500)` | Nullable | Horizontal widescreen backdrop |
| `video_stream_url`| `VARCHAR(500)` | `NOT NULL` | HLS `.m3u8` video playlist link |
| `is_featured` | `BOOLEAN` | Default `FALSE` | Displays in top Hero Banner |
| `is_trending` | `BOOLEAN` | Default `FALSE` | Displays in Trending row |
| `match_percentage`| `VARCHAR(20)`| Nullable | Recommendation score (e.g., `98% Match`) |
| `view_count` | `INT` | Default `0` | Cumulative platform plays |

### 4. `genres` & `media_genres`
- Many-to-Many mapping table associating media titles with genres: *Action, Drama, Thriller, Romance, Comedy, Sci-Fi, Horror, Documentary, Fantasy, Crime, Adventure, Animation*.

### 5. `watch_history`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Record ID |
| `profile_id` | `BIGINT` | `FK -> profiles.id` | Profile that watched |
| `media_id` | `BIGINT` | `FK -> media_items.id` | Media item watched |
| `watched_duration_seconds` | `INT` | Default `0` | Playback position reached |
| `completed` | `BOOLEAN` | Default `FALSE` | Marked true if finished |
| `last_watched_at` | `DATETIME` | `NOT NULL` | Last activity timestamp |

### 6. `ratings` (User Feedback)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Rating record ID |
| `profile_id` | `BIGINT` | `FK -> profiles.id` | Reviewer profile |
| `media_id` | `BIGINT` | `FK -> media_items.id` | Media item reviewed |
| `rating` | `INT` | `NOT NULL` | Star score (1 through 5) |
| `review_tags` | `VARCHAR(255)` | Nullable | Comma-separated highlight tags |
| `comment` | `TEXT` | Nullable | Textual feedback |
| `created_at` | `DATETIME` | `NOT NULL` | Review timestamp |

### 7. `payment_transactions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Transaction ID |
| `order_id` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Razorpay order ID |
| `payment_id` | `VARCHAR(100)` | Nullable | Razorpay payment ID |
| `user_email` | `VARCHAR(255)` | `NOT NULL` | Paying customer email |
| `plan_id` | `VARCHAR(50)` | `NOT NULL` | `MONTHLY` or `ANNUAL` |
| `amount` | `DOUBLE` | `NOT NULL` | Paid amount in INR (₹199 / ₹1299) |
| `status` | `VARCHAR(50)` | `NOT NULL` | `SUCCESS`, `PENDING`, `FAILED` |
| `created_at` | `DATETIME` | `NOT NULL` | Transaction timestamp |

---

## 📡 API Reference

Base URL: `http://localhost:8080/api/v1`

### Authentication (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Register user account with email, password, and optional profile name |
| `POST` | `/auth/signin` | Public | Authenticate user credentials and issue signed JWT token |

### Media Catalog (`/media`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/media/browse?language={lang}` | Public | Get curated hero, trending, top 10, recently added, and genre rows |
| `GET` | `/media/search?query={q}` | Public | Search titles by title, cast, or director |
| `GET` | `/media/{id}` | Public | Fetch complete media metadata by ID |
| `GET` | `/media/language/{lang}` | Public | Filter media items strictly by language |

### Watch History & Progress (`/watch`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/watch/continue/{profileId}` | Authenticated | Retrieve in-progress media items with calculated watch percentages |
| `GET` | `/watch/history/{profileId}` | Authenticated | Retrieve complete viewing history for a profile |
| `POST` | `/watch/progress` | Authenticated | Update playback timestamp (in seconds) or mark as completed |

### User Feedback & Ratings (`/feedback`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/feedback` | Authenticated | Submit 1–5 star rating, highlight tags, and review comment |
| `GET` | `/feedback/media/{mediaId}` | Authenticated | Get all submitted community reviews for a given title |

### Profiles (`/profiles`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profiles/user/{userId}` | Authenticated | List all profiles associated with the account |
| `POST` | `/profiles/user/{userId}` | Authenticated | Create a new profile with display name and kids toggle |
| `DELETE`| `/profiles/{profileId}` | Authenticated | Delete a profile |

### Payments & Subscriptions (`/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/payments/create-order` | Authenticated | Create a Razorpay order for `MONTHLY` or `ANNUAL` plans |
| `POST` | `/payments/verify` | Authenticated | Verify HMAC-SHA256 signature and upgrade user subscription tier |
| `GET` | `/payments/transactions` | Authenticated (Admin) | Retrieve full transaction log |

### Admin Console (`/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/media` | Admin Only | Get complete list of all titles with full metadata |
| `POST` | `/admin/media` | Admin Only | Create a new media title |
| `PUT` | `/admin/media/{id}` | Admin Only | Update existing media title |
| `DELETE`| `/admin/media/{id}` | Admin Only | Permanently delete media title |
| `GET` | `/admin/users` | Admin Only | List all registered users, roles, and subscription tiers |

---

## 👥 Default Seeded Accounts & Content

When the backend boots for the first time, `DataSeeder.java` seeds the database with:

### Seeded Credentials
| Role | Email | Password | Tier | Access Scope |
|---|---|---|---|---|
| **Admin** | `admin@cinewood.com` | `admin123` | `ULTRA_4K` | Full Admin Console (`/admin`) + Streaming |
| **User** | `user@cinewood.com` | `user123` | `HD` | Standard Streaming Portal |

### Seeded Titles
Includes 22 Indian blockbusters and international masterpieces with verified HLS test streams:
- **Telugu**: *Devara: Part 1*, *RRR*, *Baahubali 2: The Conclusion*, *Pushpa: The Rise*, *Eega*, *Ala Vaikunthapurramuloo*
- **Tamil**: *Ponniyin Selvan: I*, *Vikram*, *Master*, *Jailer*
- **Kannada**: *KGF: Chapter 2*, *Kantara*
- **Hindi**: *Jawan*, *Pathaan*, *Animal*, *3 Idiots*
- **Malayalam**: *Manjummel Boys*, *Drishyam 2*
- **English**: *Inception*, *The Dark Knight*, *Interstellar*, *Oppenheimer*

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **Java Development Kit (JDK)**: JDK 21 or later (Tested on Oracle JDK 25)
- **MySQL**: MySQL Server 8.0

---

### 2. Database Setup

Ensure MySQL server is running on port `3306`. If using the standalone binary:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="c:\Users\ADMIN\Documents\CineWood\backend\mysql-data" --port=3306 --console
```

Verify or configure credentials in `backend/src/main/resources/application.yml`:
- **URL**: `jdbc:mysql://localhost:3306/cinewood_db?createDatabaseIfNotExist=true`
- **Username**: `root`
- **Password**: `mysql`

---

### 3. Running the Backend

Navigate to the `backend/` directory and run via the Maven wrapper:

```powershell
cd c:\Users\ADMIN\Documents\CineWood\backend
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend will start on **port 8080**.

---

### 4. Running the Frontend

Navigate to the `frontend/` directory, install packages, and start the Vite development server:

```powershell
cd c:\Users\ADMIN\Documents\CineWood\frontend
npm install
npm run dev
```

The Vite dev server will launch at:
👉 **`http://localhost:5173`**

---

## ⚙️ Configuration & Environment Variables

All settings in `backend/src/main/resources/application.yml` support system environment variable overrides:

| Property | Default Value | Environment Variable | Description |
|---|---|---|---|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/cinewood_db...` | `SPRING_DATASOURCE_URL` | MySQL JDBC connection string |
| `spring.datasource.username` | `root` | `SPRING_DATASOURCE_USERNAME` | Database username |
| `spring.datasource.password` | `mysql` | `SPRING_DATASOURCE_PASSWORD` | Database password |
| `app.jwt.secret` | `CineWoodDev$ecretKey2024!...` | `JWT_SECRET` | 256-bit HS256 JWT signing secret |
| `app.jwt.expiration-ms` | `86400000` (24 hours) | `JWT_EXPIRATION` | JWT token lifetime in milliseconds |
| `app.cors.allowed-origins` | `http://localhost:5173,http://localhost:3000` | `CORS_ORIGINS` | Permitted client origins |
| `razorpay.key-id` | `rzp_test_TijaYgPLYHkomZ` | `RAZORPAY_KEY_ID` | Razorpay public test API key |
| `razorpay.key-secret` | `eEqZwCZJQkegakGSfEWG7Skm` | `RAZORPAY_KEY_SECRET` | Razorpay private secret key |

---

## 📁 Folder Structure

```
CineWood/
├── README.md                           # Comprehensive documentation (this file)
├── ui_blueprint/                       # Design mockups & Stitch blueprint references
│   └── stitch_netflix_clone_ui_blueprint/
├── backend/                            # Spring Boot 3.4.5 Java Application
│   ├── mvnw.cmd                        # Windows Maven wrapper
│   ├── pom.xml                         # Maven dependencies & plugins
│   ├── mysql-data/                     # Local MySQL data directory
│   └── src/
│       ├── main/
│       │   ├── java/com/cinewood/
│       │   │   ├── CineWoodApplication.java
│       │   │   ├── config/             # SecurityConfig, DataSeeder
│       │   │   ├── controller/         # Auth, Media, Admin, Feedback, Payment, etc.
│       │   │   ├── dto/                # Request & response data transfer objects
│       │   │   ├── entity/             # JPA entity definitions (User, MediaItem, etc.)
│       │   │   ├── repository/         # Spring Data JPA repositories with custom queries
│       │   │   ├── security/           # JwtTokenProvider, JwtAuthFilter, RateLimitFilter
│       │   │   └── service/            # Business logic services
│       │   └── resources/
│       │       └── application.yml     # Application configuration
│       └── test/
└── frontend/                           # React 19 + Vite Application
    ├── index.html                      # HTML entry with Razorpay SDK & Google Fonts
    ├── package.json                    # Frontend dependencies
    ├── vite.config.js                  # Vite configuration with /api reverse proxy
    └── src/
        ├── main.jsx                    # React entrypoint
        ├── App.jsx                     # Route declarations & ProtectedRoute
        ├── index.css                   # Custom Cinematic Dark design tokens & Tailwind v4
        ├── assets/                     # Images, icons, static assets
        ├── components/
        │   ├── HeroBanner.jsx          # Cinematic hero showcase carousel
        │   ├── LanguageFilter.jsx      # Language selection pills
        │   ├── MovieCard.jsx           # Poster card with hover preview & progress bar
        │   ├── MovieRow.jsx            # Horizontally scrollable category carousel
        │   ├── Navbar.jsx              # Responsive header with search, notifs, profile
        │   ├── VideoPlayer.jsx         # Custom HLS streaming player with scrubber
        │   ├── FeedbackModal.jsx       # 5-star rating & review tags modal
        │   └── SubscriptionModal.jsx   # Razorpay 3-tier subscription modal
        ├── context/
        │   ├── AuthContext.jsx         # JWT session management & auto-profile select
        │   └── WatchlistContext.jsx    # My List & Liked items state
        ├── pages/
        │   ├── AuthPage.jsx            # Sign-in & Sign-up page with live validation
        │   ├── HomePage.jsx            # Core streaming portal with all categories
        │   ├── AdminPage.jsx           # Management console for media, users, and audit
        │   ├── SettingsPage.jsx        # Account settings, plan details, and sign out
        │   └── MovieDetailModal.jsx    # Complete title synopsis & media specs modal
        └── services/
            └── api.js                  # Axios instance with JWT interceptor & API methods
```

---

## ❓ Troubleshooting & FAQ

### 1. CORS Errors in Browser Console
Ensure requests go through the Vite proxy (`/api/...`) or verify that `http://localhost:5173` is listed under `app.cors.allowed-origins` in `application.yml`.

### 2. Video Player shows a black screen or fails to load
The test streams use HLS `.m3u8` playlists from public test endpoints (e.g., Mux / Bitdash). Ensure your internet connection allows outbound HTTPS streaming to media CDNs.

### 3. LazyInitializationException in Watch History
`WatchHistoryRepository` uses `JOIN FETCH w.mediaItem` and services are annotated with `@Transactional(readOnly = true)` to eagerly load related media metadata in a single query.

### 4. Direct Login without Profile Picker
The login flow has been configured to directly navigate to `/` upon authentication, automatically setting the user's primary profile in the background so that watchlist, watch progress, and ratings work seamlessly.

---

## 📜 License

This project is created for educational and demonstration purposes. All movie posters, imagery, and trademarks belong to their respective copyright holders.
