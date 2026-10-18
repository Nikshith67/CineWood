# CineWood 🎬 — Premium Indian & International Streaming Platform

![CineWood Banner]("C:\Users\ADMIN\Pictures\a_wide_minimalist_dark_graphic_logo_scene_a_soli.png")

> **CineWood** is an enterprise-grade, full-stack OTT video streaming web application modeled after Netflix and crafted specifically for the diverse Indian cinematic landscape alongside global cinema. It delivers high-octane blockbusters and series across **Telugu, Tamil, Kannada, Hindi, Malayalam, and English** with a luxury "Cinematic Dark" aesthetic, adaptive HLS video streaming, automated watch-progress tracking, post-completion interactive feedback, live Razorpay payment processing, and a comprehensive administrative management console.

---

> [!NOTE]
> **Media Delivery & Content Strategy**:
> CineWood utilizes high-definition promotional media, official trailers, and open CDN HLS (`.m3u8`) test streams (10–80 seconds in duration) rather than storing full-length 2-hour movies. 
> 
> **Why?**
> 1. **Protocol Parity**: HTTP Live Streaming (HLS) delivers media via 2–6 second chunked segments (`.ts`/`.m4s`). Whether a title is 60 seconds or 2 hours, the player buffering, adaptive bitrate heuristics, and playback tracking operate identically.
> 2. **Engineering Focus**: Avoids multi-terabyte storage overhead and commercial CDN egress costs while proving the complete end-to-end full-stack streaming pipeline.
> 3. **Copyright & DRM Compliance**: Full-length commercial feature film distribution requires studio licensing and hardware DRM (Widevine/FairPlay), which is legally restricted to commercial OTT distributors.
> *See [Media Delivery & Video Length Rationale](#-media-delivery--video-length-rationale) for the detailed architectural breakdown.*

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Technology Stack](#-technology-stack)
3. [Key Features](#-key-features)
4. [Screenshots](#-screenshots)
5. [System Architecture & Data Flow](#-system-architecture--data-flow)
6. [Media Delivery & Video Length Rationale](#-media-delivery--video-length-rationale)
7. [Database Schema & Entities](#-database-schema--entities)
8. [API Reference](#-api-reference)
9. [Default Seeded Accounts & Content](#-default-seeded-accounts--content)
10. [Getting Started & Local Setup](#-getting-started--local-setup)
11. [Configuration & Environment Variables](#-configuration--environment-variables)
12. [Folder Structure](#-folder-structure)
13. [Troubleshooting & FAQ](#-troubleshooting--faq)
14. [Credits & Attribution](#-credits--attribution)
15. [License](#-license)

---

## 🏛 Architectural Overview

CineWood follows a modern decoupled client-server architecture:
- **Client Tier**: Single Page Application (SPA) powered by **React 19**, **Vite 8**, and a bespoke **Cinematic Dark Design System** (Tailwind CSS v4 + Vanilla CSS design tokens).
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
- **Build & Dependency Management**: Apache Maven 3.9 (via Maven Wrapper `mvnw.cmd`)
- **Developer Experience**: Spring Boot DevTools & Project Lombok

---

## ✨ Key Features

### 1. User Experience & Streaming
- **Direct-to-Browse Authentication**: Streamlined login/signup flow that bypasses manual profile selection, immediately navigating to the home catalog while seamlessly selecting the user's primary profile in the background.
- **Cinematic Hero Banner**: Automatic 8-second rotating carousel of top featured blockbusters (e.g., *Devara: Part 1*, *RRR*, *Oppenheimer*) with backdrop scrims, quick play, and more-details triggers.
- **Multi-Lingual Catalog Filters**: Instant pill-based language switching across **Telugu, Tamil, Kannada, Hindi, Malayalam, and English** with dynamic catalog querying.
- **Top 10 Ranked Showcase**: Custom Netflix-style numerical rank typography (`#1` through `#10`) with large drop-shadowed index numerals.
- **Custom HLS Video Player**:
  - Auto-detection of `.m3u8` playlists with native HTML5 video fallback.
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

## 📸 Screenshots

| Browse Catalog & Hero Banner | Custom HLS Video Player |
|:---:|:---:|
| *(Screenshots Placeholder: Browse Screen)* | *(Screenshots Placeholder: Video Player)* |

| Movie Detail Modal & Feedback | Admin Operations Console |
|:---:|:---:|
| *(Screenshots Placeholder: Details & Rating)* | *(Screenshots Placeholder: Admin Dashboard)* |

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
  |  MySQL 8.0 (3306) |    |  Razorpay Gateway |    |  TMDB & CDN HLS   |
  |  (cinewood_db)    |    |  (Payments API)   |    |  (Streams/Posters)|
  +-------------------+    +-------------------+    +-------------------+
```

---

## 🎥 Media Delivery & Video Length Rationale

A common question is: *Why does CineWood stream 10–80 second high-definition video clips/trailers instead of 2-to-3 hour full-length feature films?*

### 1. Protocol Parity (HTTP Live Streaming - HLS)
- **HLS Chunking Architecture**: HLS does not stream monolithic video files. It breaks video into an `.m3u8` playlist manifest index and small **2-to-6 second media segments** (`.ts` or fragmented `.mp4`).
- **Identical Client Mechanics**: The browser client (`hls.js`) buffers, parses segments, computes throughput, switches bitrates dynamically, and triggers HTML5 media events identically regardless of whether the video duration is 60 seconds or 150 minutes.
- **Watch Progress Telemetry**: Progress percentage calculations, resume-state storage, and completion triggers in `WatchHistoryController` and `VideoPlayer.jsx` are fully proven and tested using short-form clips.

### 2. Legal, Copyright & Digital Rights Management (DRM)
- **Studio Copyright**: Distributing full theatrical feature films without distributor rights is illegal under DMCA and global intellectual property laws.
- **Enterprise DRM Requirements**: Commercial streaming of theatrical releases mandates hardware DRM integration (Widevine Modular for Chromium/Android, Apple FairPlay for Safari/iOS, Microsoft PlayReady for Edge) with secure hardware decryption pipelines (Encrypted Media Extensions / EME) and license server infrastructure. 
- Using official trailers, teasers, and open HLS demo streams (e.g., Mux, Bitdash, Unified Streaming) is the standard and legally compliant approach for software portfolio applications.

### 3. Cloud Storage & Bandwidth Economics
- Storing 22 full-length 1080p/4K movies would require **~150GB–400GB** of object storage (e.g., AWS S3, Cloudflare R2) and incur high egress bandwidth costs on every viewer session without providing any additional architectural value over short-form adaptive HLS streams.

### 4. Production Scale-Up Roadmap
In a commercial enterprise production environment, CineWood's media pipeline would scale by adding:
1. **Video Ingestion Pipeline**: Asynchronous worker cluster (AWS Elemental MediaConvert or FFmpeg on Kubernetes) transcoding uploaded raw video masters into an adaptive multi-bitrate ladder (360p, 720p, 1080p, 4K).
2. **Origin & Multi-CDN**: Serving `.m3u8` manifests and `.ts` fragments via Amazon CloudFront / Cloudflare with signed URLs/cookies and token authentication to prevent stream scraping.
3. **DRM Licensing Server**: Integrating Widevine and FairPlay key exchange endpoints for encrypted CENC streams.

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
- **MySQL**: MySQL Server 8.0 running on port 3306

---

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/CineWood.git
cd CineWood
```

---

### 3. Install Dependencies
Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

---

### 4. Configure Environment Variables
Copy the `.env.example` template to `.env`:
```bash
cp .env.example .env
```
Ensure your MySQL username and password in `.env` match your local MySQL configuration:
```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/cinewood_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=mysql
JWT_SECRET=CineWoodDev$ecretKey2024!MustBeAtLeast256BitsLongForHS256Algorithm!!
```

---

### 5. Run the Application with `run.bat`

The simplest and recommended way to start CineWood on Windows is using `run.bat`:

```cmd
run.bat
```
*(Or double-click `run.bat` in Windows Explorer)*

What `run.bat` automatically does:
1. Loads configuration variables from `.env`.
2. Verifies MySQL on port 3306 (starts `MySQL80` service if needed and waits for it to become ready).
3. Launches the Spring Boot backend (`mvnw.cmd spring-boot:run`) on port 8080.
4. Launches the Vite frontend (`npm run dev`) on port 5173.
5. Automatically opens your default web browser to:
   👉 **`http://localhost:5173`**

---

### Manual Step-by-Step Launch (Alternative)

If you prefer to start services individually:

1. **Start MySQL**:
   Ensure MySQL is running on port `3306`.
2. **Start Backend**:
   ```cmd
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
3. **Start Frontend**:
   ```cmd
   cd frontend
   npm run dev
   ```
4. **Open Browser**:
   Navigate to `http://localhost:5173`.

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
├── run.bat                             # Unified Windows launcher script
├── .env.example                        # Template for environment configuration
├── .gitignore                          # Git ignore rules (secrets, build outputs)
├── README.md                           # Comprehensive documentation (this file)
├── backend/                            # Spring Boot 3.4.5 Java Application
│   ├── mvnw.cmd                        # Windows Maven wrapper
│   ├── pom.xml                         # Maven dependencies & plugins
│   ├── mysql-data/                     # Local MySQL data directory
│   └── src/
│       ├── main/
│       │   ├── java/com/cinewood/
│       │   │   ├── CineWoodApplication.java
│       │   │   ├── config/             # SecurityConfig, DataSeeder, GlobalExceptionHandler
│       │   │   ├── controller/         # Auth, Media, Admin, Feedback, Payment, User
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
    ├── tsconfig.json                   # TypeScript/JSX compiler configuration
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
Ensure requests go through the Vite proxy (`/api/...`) or verify that `http://localhost:5173` is listed under `app.cors.allowed-origins` in `application.yml` or `CORS_ORIGINS` in `.env`.

### 2. Video Player shows a black screen or fails to load
The test streams use HLS `.m3u8` playlists from public test endpoints (e.g., Mux / Bitdash). Ensure your internet connection allows outbound HTTPS streaming to media CDNs.

### 3. LazyInitializationException in Watch History
`WatchHistoryRepository` uses `JOIN FETCH w.mediaItem` and services are annotated with `@Transactional(readOnly = true)` to eagerly load related media metadata in a single query.

### 4. Direct Login without Profile Picker
The login flow has been configured to directly navigate to `/` upon authentication, automatically setting the user's primary profile in the background so that watchlist, watch progress, and ratings work seamlessly.

---

## 🏆 Credits & Attribution

- **The Movie Database (TMDB)**: For providing rich movie metadata, cast information, posters, and backdrop artwork.
- **Razorpay**: For providing sandbox payment APIs and checkout UI integration.
- **Google Fonts & Icons**: *Space Grotesk*, *Plus Jakarta Sans*, and *Material Symbols Outlined*.
- **Unsplash**: For promotional banner background photography.
- **HLS.js Team**: For the adaptive HTTP Live Streaming client library.
- **Spring Boot & React Communities**: For the open-source frameworks powering this architecture.

---

## 📜 License

This project is created for educational and demonstration purposes. All movie posters, imagery, and trademarks belong to their respective copyright holders.
