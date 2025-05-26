# 🚀 Sugoi-Web Backend API Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Setup & Configuration](#setup--configuration)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Caching](#caching)
- [Security](#security)
- [Deployment](#deployment)

## 🔍 Overview

The Sugoi-Web backend is a RESTful API built with Node.js and Express.js that serves anime data scraped from MyAnimeList (MAL). It provides comprehensive anime information, user management, authentication, and watchlist functionality.

## ⚙️ Setup & Configuration

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/sugoi-web

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Sugoi
EMAIL_FROM_ADDRESS=your-email@gmail.com

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=your-turnstile-secret
TURNSTILE_ENABLED=true

# Cache Control
DISABLE_CACHE=false
```

### Installation

```bash
cd server
npm install
npm run dev
```

## 🔐 Authentication

The API uses JWT-based authentication with the following features:

### Authentication Flow

1. **Registration**: User registers with email and password
2. **Email Verification**: OTP sent to email for verification
3. **Login**: Returns JWT token for authenticated requests
4. **Token Usage**: Include token in Authorization header

### User Roles

- **User**: Basic access to anime data and personal watchlist
- **Premium**: Enhanced features and higher rate limits
- **Admin**: Full access to user management and platform statistics

### Protected Routes

Use the `protect` middleware to secure endpoints:

```javascript
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Protected route
router.get("/api/v1/user/profile", protect, getUserProfile);

// Admin-only route
router.get("/api/v1/admin/users", protect, isAdmin, getAllUsers);
```

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api/v1
```

## 🔐 Authentication Endpoints

### POST `/auth/register`

Register a new user account.

**Parameters:** None

**Request Body:**

```json
{
  "username": "string (3-30 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (min 6 chars, required)",
  "turnstileToken": "string (Cloudflare Turnstile token, required if enabled)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "username": "animeotaku",
      "email": "user@example.com",
      "isEmailVerified": false,
      "role": "user",
      "createdAt": "2024-03-15T10:30:00.000Z"
    }
  }
}
```

---

### POST `/auth/login`

Authenticate user and return JWT token.

**Rate Limit:** 5 requests per 15 minutes per IP

**Parameters:** None

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)",
  "turnstileToken": "string (required if enabled)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "username": "animeotaku",
      "email": "user@example.com",
      "role": "user",
      "isEmailVerified": true,
      "lastLogin": "2024-03-15T10:30:00.000Z"
    }
  }
}
```

---

### POST `/auth/verify-email`

Verify user email with OTP code.

**Rate Limit:** 5 requests per 15 minutes per IP

**Parameters:** None

**Request Body:**

```json
{
  "email": "string (required)",
  "otp": "string (6-digit code, required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "email": "user@example.com",
      "isEmailVerified": true
    }
  }
}
```

---

### POST `/auth/resend-verification`

Resend email verification OTP.

**Rate Limit:** 5 requests per 15 minutes per IP

**Parameters:** None

**Request Body:**

```json
{
  "email": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

### POST `/auth/forgot-password`

Request password reset email.

**Rate Limit:** 5 requests per 15 minutes per IP

**Parameters:** None

**Request Body:**

```json
{
  "email": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

---

### GET `/auth/reset-password/:resetToken/validate`

Validate password reset token.

**Rate Limit:** 5 requests per 15 minutes per IP

**Parameters:**

- `resetToken` (path): Password reset token from email

**Response (200):**

```json
{
  "success": true,
  "message": "Reset token is valid",
  "data": {
    "tokenValid": true,
    "email": "user@example.com"
  }
}
```

---

### PUT `/auth/reset-password/:resetToken`

Reset password using reset token.

**Rate Limit:** 5 requests per 15 minutes per IP

**Parameters:**

- `resetToken` (path): Password reset token from email

**Request Body:**

```json
{
  "password": "string (min 6 chars, required)",
  "confirmPassword": "string (must match password, required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### PUT `/auth/update-password`

Update user password (authenticated).

**Authentication:** Required (JWT token)

**Parameters:** None

**Request Body:**

```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (min 6 chars, required)",
  "confirmPassword": "string (must match newPassword, required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### POST `/auth/logout`

Logout user (invalidate token).

**Authentication:** Required (JWT token)

**Parameters:** None

**Request Body:** None

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### GET `/auth/me`

Get current authenticated user details.

**Authentication:** Required (JWT token)

**Parameters:** None

**Response (200):**

```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "username": "animeotaku",
      "email": "user@example.com",
      "role": "user",
      "isEmailVerified": true,
      "createdAt": "2024-03-15T10:30:00.000Z",
      "lastLogin": "2024-03-15T12:30:00.000Z"
    }
  }
}
```

---

## 🎌 Anime Endpoints

### GET `/anime/top`

Get top-rated anime list.

**Cache:** 1 hour

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response (200):**

```json
{
  "success": true,
  "message": "Top anime retrieved successfully",
  "data": {
    "results": [
      {
        "id": "5114",
        "title": "Fullmetal Alchemist: Brotherhood",
        "image": "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
        "score": 9.1,
        "members": 3057161,
        "status": "Finished Airing",
        "episodes": 64,
        "type": "TV",
        "year": 2009,
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Military",
          "Shounen"
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 500,
      "hasNextPage": true
    }
  }
}
```

---

### GET `/anime/top-airing`

Get currently airing top anime.

**Cache:** 30 minutes

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/top-upcoming`

Get upcoming anime releases.

**Cache:** 1 hour

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/top-tv`

Get top TV series anime.

**Cache:** 2 hours

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/top-movies`

Get top anime movies.

**Cache:** 2 hours

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/top-ova`

Get top OVA anime.

**Cache:** 2 hours

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/top-ona`

Get top ONA (Original Net Animation) anime.

**Cache:** 2 hours

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/top-special`

Get top special anime.

**Cache:** 2 hours

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/most-popular`

Get most popular anime by member count.

**Cache:** 1 hour

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/most-favorited`

Get most favorited anime.

**Cache:** 1 hour

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/current-season`

Get current season anime.

**Cache:** 30 minutes

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/season`

Get current season anime.

**Cache:** 12 hours

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top`

---

### GET `/anime/season/:year/:season`

Get anime by specific season and year.

**Cache:** 12 hours

**Parameters:**

- `year` (path, required): Year (e.g., 2024)
- `season` (path, required): Season (winter, spring, summer, fall)
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response:** Same format as `/anime/top` with additional season metadata

---

### GET `/anime/schedule`

Get anime broadcast schedule.

**Cache:** 1 hour

**Parameters:**

- `day` (query, optional): Day of week (monday, tuesday, etc.)

**Response (200):**

```json
{
  "success": true,
  "message": "Schedule retrieved successfully",
  "data": {
    "schedule": {
      "monday": [
        {
          "id": "21",
          "title": "One Piece",
          "image": "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
          "time": "09:30",
          "episode": 1100
        }
      ],
      "tuesday": []
      // ... other days
    }
  }
}
```

---

### GET `/anime/search`

Search anime with advanced filters.

**Rate Limit:** 30 requests per minute

**Cache:** 15 minutes

**Parameters:**

- `q` (query, optional): Search query
- `genre` (query, optional): Genre filter (comma-separated)
- `type` (query, optional): Type (tv, movie, ova, ona, special, music)
- `status` (query, optional): Status (airing, completed, upcoming)
- `order_by` (query, optional): Order by (title, score, members, episodes, start_date)
- `sort` (query, optional): Sort direction (asc, desc)
- `score` (query, optional): Minimum score (0-10)
- `start_date` (query, optional): Start date (YYYY-MM-DD)
- `end_date` (query, optional): End date (YYYY-MM-DD)
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 50)

**Response (200):**

```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "results": [
      {
        "id": "20",
        "title": "Naruto",
        "image": "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
        "score": 7.99,
        "members": 1847021,
        "status": "Finished Airing",
        "episodes": 720,
        "type": "TV",
        "year": 2002,
        "genres": ["Action", "Martial Arts", "Shounen", "Super Power"],
        "synopsis": "Moments prior to Naruto Uzumaki's birth..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 156,
      "hasNextPage": true
    },
    "filters": {
      "query": "naruto",
      "genre": ["action"],
      "type": "tv",
      "status": "completed"
    }
  }
}
```

---

### GET `/anime/:id`

Get detailed information about a specific anime.

**Cache:** 1 hour

**Parameters:**

- `id` (path, required): Anime ID from MyAnimeList

**Response (200):**

```json
{
  "success": true,
  "message": "Anime details retrieved successfully",
  "data": {
    "anime": {
      "id": "20",
      "title": "Naruto",
      "titleEnglish": "Naruto",
      "titleJapanese": "ナルト",
      "image": "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
      "trailer": "https://www.youtube.com/embed/j2hiC9BmJlQ",
      "score": 7.99,
      "scoredBy": 1234567,
      "rank": 1456,
      "popularity": 5,
      "members": 1847021,
      "favorites": 87654,
      "synopsis": "Moments prior to Naruto Uzumaki's birth...",
      "background": "Naruto was adapted from...",
      "status": "Finished Airing",
      "episodes": 720,
      "duration": "23 min per ep",
      "type": "TV",
      "source": "Manga",
      "rating": "PG-13 - Teens 13 or older",
      "season": "fall",
      "year": 2002,
      "broadcast": "Thursdays at 19:30 (JST)",
      "studios": ["Pierrot"],
      "genres": ["Action", "Martial Arts", "Shounen", "Super Power"],
      "themes": ["Ninja"],
      "demographics": ["Shounen"],
      "relations": [
        {
          "relation": "Sequel",
          "entry": {
            "id": "1735",
            "title": "Naruto: Shippuuden",
            "type": "anime"
          }
        }
      ],
      "characters": [
        {
          "id": "17",
          "name": "Naruto Uzumaki",
          "image": "https://cdn.myanimelist.net/images/characters/2/284121.jpg",
          "role": "Main"
        }
      ],
      "staff": [
        {
          "id": "6096",
          "name": "Hayato Date",
          "image": "https://cdn.myanimelist.net/images/people/6/47703.jpg",
          "role": "Director"
        }
      ],
      "themes": {
        "openings": ["\"R★O★C★K★S\" by Hound Dog (eps 1-25)"],
        "endings": ["\"Wind\" by Akeboshi (eps 1-25)"]
      },
      "recommendations": [
        {
          "id": "1735",
          "title": "Naruto: Shippuuden",
          "image": "https://cdn.myanimelist.net/images/anime/5/17407.jpg",
          "votes": 1234
        }
      ]
    }
  }
}
```

---

## 👤 User & Watchlist Endpoints

### GET `/user/profile`

Get current user's profile information.

**Authentication:** Required (JWT token)

**Parameters:** None

**Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "username": "animeotaku",
      "email": "user@example.com",
      "role": "user",
      "isEmailVerified": true,
      "createdAt": "2024-03-15T10:30:00.000Z",
      "lastLogin": "2024-03-15T12:30:00.000Z",
      "watchlistCount": 25,
      "totalEpisodesWatched": 1250
    }
  }
}
```

---

### PUT `/user/profile`

Update user profile information.

**Authentication:** Required (JWT token)

**Parameters:** None

**Request Body:**

```json
{
  "username": "string (3-30 chars, optional)",
  "email": "string (valid email, optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "username": "newusername",
      "email": "newemail@example.com",
      "role": "user",
      "updatedAt": "2024-03-15T14:30:00.000Z"
    }
  }
}
```

---

### DELETE `/user/profile`

Delete user account permanently.

**Authentication:** Required (JWT token)

**Parameters:** None

**Request Body:**

```json
{
  "password": "string (current password, required)",
  "confirmDeletion": "boolean (must be true, required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### GET `/user/history`

Get user's watch history.

**Authentication:** Required (JWT token)

**Parameters:** None

**Response (200):**

```json
{
  "success": true,
  "message": "Watch history retrieved successfully",
  "data": {
    "history": [
      {
        "animeId": "20",
        "episodeId": "naruto-episode-1",
        "timestamp": 1456,
        "watched": "2024-03-15T12:30:00.000Z",
        "animeTitle": "Naruto",
        "episodeTitle": "Enter: Naruto Uzumaki!"
      }
    ],
    "totalEntries": 150
  }
}
```

---

### POST `/user/history/update`

Update watch history for an episode.

**Authentication:** Required (JWT token)

**Parameters:** None

**Request Body:**

```json
{
  "animeId": "string (required)",
  "episodeId": "string (required)",
  "timestamp": "number (playback position in seconds, optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Watch history updated successfully"
}
```

---

### POST `/user/upgrade-premium`

Upgrade user to premium status (Admin only action).

**Authentication:** Required (JWT token + Admin role)

**Parameters:** None

**Request Body:** None

**Response (200):**

```json
{
  "success": true,
  "message": "User upgraded to premium successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "role": "premium",
      "upgradedAt": "2024-03-15T14:30:00.000Z"
    }
  }
}
```

---

### GET `/user/watchlist`

Get user's watchlist with pagination and filtering.

**Authentication:** Required (JWT token)

**Parameters:**

- `status` (query, optional): Filter by status (watching, completed, on-hold, dropped, plan-to-watch)
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 100)
- `sort` (query, optional): Sort by (dateAdded, title, score, episodesWatched)
- `order` (query, optional): Sort order (asc, desc)

**Response (200):**

```json
{
  "success": true,
  "message": "Watchlist retrieved successfully",
  "data": {
    "watchlist": [
      {
        "id": "64f7a1b2c3d4e5f6a7b8c9d1",
        "animeId": "20",
        "animeTitle": "Naruto",
        "animeImage": "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
        "status": "watching",
        "episodesWatched": 156,
        "totalEpisodes": 720,
        "rating": 8,
        "notes": "Great show, love the character development",
        "dateAdded": "2024-03-10T10:30:00.000Z",
        "lastUpdated": "2024-03-15T12:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 45,
      "hasNextPage": true
    },
    "stats": {
      "watching": 5,
      "completed": 20,
      "onHold": 3,
      "dropped": 2,
      "planToWatch": 15,
      "totalEntries": 45,
      "totalEpisodesWatched": 1250
    }
  }
}
```

---

### POST `/user/watchlist`

Add anime to user's watchlist.

**Authentication:** Required (JWT token)

**Parameters:** None

**Request Body:**

```json
{
  "animeId": "string (MyAnimeList anime ID, required)",
  "status": "string (watching|completed|on-hold|dropped|plan-to-watch, required)",
  "episodesWatched": "number (optional, default: 0)",
  "rating": "number (1-10, optional)",
  "notes": "string (max 500 chars, optional)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Added to watchlist successfully",
  "data": {
    "watchlistEntry": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d1",
      "animeId": "20",
      "animeTitle": "Naruto",
      "animeImage": "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
      "status": "watching",
      "episodesWatched": 5,
      "rating": 8,
      "notes": "Excited to watch this!",
      "dateAdded": "2024-03-15T10:30:00.000Z"
    }
  }
}
```

---

### PUT `/user/watchlist/:id`

Update watchlist entry.

**Authentication:** Required (JWT token)

**Parameters:**

- `id` (path, required): Watchlist entry ID

**Request Body:**

```json
{
  "status": "string (watching|completed|on-hold|dropped|plan-to-watch, optional)",
  "episodesWatched": "number (optional)",
  "rating": "number (1-10, optional)",
  "notes": "string (max 500 chars, optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Watchlist entry updated successfully",
  "data": {
    "watchlistEntry": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d1",
      "animeId": "20",
      "status": "completed",
      "episodesWatched": 720,
      "rating": 9,
      "notes": "Amazing series!",
      "lastUpdated": "2024-03-15T14:30:00.000Z"
    }
  }
}
```

---

### DELETE `/user/watchlist/:id`

Remove anime from watchlist.

**Authentication:** Required (JWT token)

**Parameters:**

- `id` (path, required): Watchlist entry ID

**Response (200):**

```json
{
  "success": true,
  "message": "Removed from watchlist successfully"
}
```

---

## 🛡️ Admin Endpoints

### GET `/admin/users`

Get all users with pagination and filtering (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 25, max: 100)
- `role` (query, optional): Filter by role (user, premium, admin)
- `verified` (query, optional): Filter by email verification (true, false)
- `search` (query, optional): Search by username or email
- `sort` (query, optional): Sort by (createdAt, lastLogin, username)
- `order` (query, optional): Sort order (asc, desc)

**Response (200):**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "64f7a1b2c3d4e5f6a7b8c9d0",
        "username": "animeotaku",
        "email": "user@example.com",
        "role": "user",
        "isEmailVerified": true,
        "isActive": true,
        "createdAt": "2024-03-15T10:30:00.000Z",
        "lastLogin": "2024-03-15T12:30:00.000Z",
        "watchlistCount": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 1250,
      "hasNextPage": true
    },
    "stats": {
      "totalUsers": 1250,
      "activeUsers": 1100,
      "verifiedUsers": 1050,
      "usersByRole": {
        "user": 1200,
        "premium": 45,
        "admin": 5
      }
    }
  }
}
```

---

### GET `/admin/users/:id`

Get specific user details (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:**

- `id` (path, required): User ID

**Response (200):**

```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "username": "animeotaku",
      "email": "user@example.com",
      "role": "user",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2024-03-15T10:30:00.000Z",
      "lastLogin": "2024-03-15T12:30:00.000Z",
      "watchlistCount": 25,
      "totalEpisodesWatched": 1250,
      "loginHistory": [
        {
          "date": "2024-03-15T12:30:00.000Z",
          "ip": "192.168.1.100"
        }
      ]
    }
  }
}
```

---

### PUT `/admin/users/:id`

Update user information (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:**

- `id` (path, required): User ID

**Request Body:**

```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "role": "string (user|premium|admin, optional)",
  "isEmailVerified": "boolean (optional)",
  "isActive": "boolean (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "username": "updatedusername",
      "email": "updated@example.com",
      "role": "premium",
      "isEmailVerified": true,
      "isActive": true,
      "updatedAt": "2024-03-15T14:30:00.000Z"
    }
  }
}
```

---

### DELETE `/admin/users/:id`

Delete user account (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:**

- `id` (path, required): User ID

**Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### GET `/admin/stats`

Get platform statistics (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:**

- `period` (query, optional): Time period (day, week, month, year)

**Response (200):**

```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "overview": {
      "totalUsers": 1250,
      "activeUsers": 1100,
      "totalWatchlistEntries": 25000,
      "totalAnimeInDatabase": 15000,
      "apiRequestsToday": 125000
    },
    "userStats": {
      "newUsersToday": 25,
      "newUsersThisWeek": 175,
      "newUsersThisMonth": 750,
      "usersByRole": {
        "user": 1200,
        "premium": 45,
        "admin": 5
      }
    },
    "activityStats": {
      "watchlistEntriesAdded": 500,
      "searchQueries": 15000,
      "animeDetailsViewed": 8500
    },
    "systemStats": {
      "serverUptime": "7 days, 12 hours",
      "databaseSize": "2.5 GB",
      "cacheHitRate": "85.2%"
    }
  }
}
```

---

### GET `/admin/logs`

Get system logs (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:**

- `level` (query, optional): Log level (error, warn, info, debug)
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 50, max: 100)
- `startDate` (query, optional): Start date (YYYY-MM-DD)
- `endDate` (query, optional): End date (YYYY-MM-DD)

**Response (200):**

```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "data": {
    "logs": [
      {
        "timestamp": "2024-03-15T14:30:00.000Z",
        "level": "info",
        "message": "User login successful",
        "userId": "64f7a1b2c3d4e5f6a7b8c9d0",
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5000,
      "hasNextPage": true
    }
  }
}
```

---

### GET `/admin/system-stats`

Get detailed system statistics (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:** None

**Response (200):**

```json
{
  "success": true,
  "message": "System statistics retrieved successfully",
  "data": {
    "server": {
      "uptime": "7 days, 12 hours, 30 minutes",
      "nodeVersion": "v18.19.0",
      "environment": "production",
      "memoryUsage": {
        "used": "250 MB",
        "total": "512 MB",
        "percentage": 48.8
      }
    },
    "database": {
      "status": "connected",
      "collections": {
        "users": 1250,
        "watchlists": 1100,
        "sessions": 50
      },
      "size": "2.5 GB",
      "indexes": 15
    },
    "cache": {
      "status": "active",
      "entries": 150,
      "hitRate": "85.2%",
      "memoryUsage": "45 MB"
    },
    "performance": {
      "averageResponseTime": "120ms",
      "requestsPerMinute": 850,
      "errorRate": "0.2%"
    }
  }
}
```

---

### POST `/admin/clear-cache`

Clear application cache (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:** None

**Request Body:**

```json
{
  "pattern": "string (optional - specific cache pattern to clear)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

---

### POST `/admin/create-admin`

Create a new admin user (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:** None

**Request Body:**

```json
{
  "name": "string (required)",
  "email": "string (valid email, required)",
  "password": "string (min 6 chars, required)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d1",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "isEmailVerified": true,
      "createdAt": "2024-03-15T10:30:00.000Z"
    }
  }
}
```

---

### POST `/admin/trigger-scrape/:type`

Manually trigger data scraping (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:**

- `type` (path, required): Scrape type (top-anime, top-airing, top-upcoming, top-tv, top-movies, season, schedule)

**Request Body:**

```json
{
  "page": "number (optional, default: 1)",
  "year": "number (required for season type)",
  "season": "string (required for season type - winter, spring, summer, fall)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Scrape completed successfully",
  "data": {
    "type": "top-anime",
    "itemsScraped": 25,
    "duration": "2.3s",
    "cacheCleared": true
  }
}
```

---

### GET `/admin/users/:id/watchlist`

Get specific user's watchlist (Admin only).

**Authentication:** Required (JWT token + Admin role)

**Parameters:**

- `id` (path, required): User ID

**Response (200):**

```json
{
  "success": true,
  "message": "User watchlist retrieved successfully",
  "data": {
    "user": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d0",
      "username": "animeotaku",
      "email": "user@example.com"
    },
    "watchlist": [
      {
        "id": "64f7a1b2c3d4e5f6a7b8c9d1",
        "animeId": "20",
        "animeTitle": "Naruto",
        "animeImage": "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
        "status": "watching",
        "episodesWatched": 156,
        "totalEpisodes": 720,
        "rating": 8,
        "dateAdded": "2024-03-10T10:30:00.000Z"
      }
    ],
    "stats": {
      "totalEntries": 25,
      "totalEpisodesWatched": 1250
    }
  }
}
```

---

## 📊 API Endpoints Summary

### Authentication Endpoints

| Method | Endpoint                               | Description              | Auth Required | Rate Limited |
| ------ | -------------------------------------- | ------------------------ | ------------- | ------------ |
| POST   | `/auth/register`                       | Register new user        | No            | No           |
| POST   | `/auth/login`                          | User login               | No            | Yes (5/15m)  |
| POST   | `/auth/verify-email`                   | Verify email with OTP    | No            | Yes (5/15m)  |
| POST   | `/auth/resend-verification`            | Resend verification code | No            | Yes (5/15m)  |
| POST   | `/auth/forgot-password`                | Request password reset   | No            | Yes (5/15m)  |
| GET    | `/auth/reset-password/:token/validate` | Validate reset token     | No            | Yes (5/15m)  |
| PUT    | `/auth/reset-password/:token`          | Reset password           | No            | Yes (5/15m)  |
| PUT    | `/auth/update-password`                | Update password          | Yes           | No           |
| POST   | `/auth/logout`                         | Logout user              | Yes           | No           |
| GET    | `/auth/me`                             | Get current user         | Yes           | No           |

### Anime Endpoints

| Method | Endpoint                      | Description              | Auth Required | Cache TTL |
| ------ | ----------------------------- | ------------------------ | ------------- | --------- |
| GET    | `/anime/top`                  | Get top anime            | No            | 1 hour    |
| GET    | `/anime/top-airing`           | Get top airing anime     | No            | 30 min    |
| GET    | `/anime/top-upcoming`         | Get top upcoming anime   | No            | 1 hour    |
| GET    | `/anime/top-tv`               | Get top TV series        | No            | 2 hours   |
| GET    | `/anime/top-movies`           | Get top movies           | No            | 2 hours   |
| GET    | `/anime/top-ova`              | Get top OVA              | No            | 2 hours   |
| GET    | `/anime/top-ona`              | Get top ONA              | No            | 2 hours   |
| GET    | `/anime/top-special`          | Get top specials         | No            | 2 hours   |
| GET    | `/anime/most-popular`         | Get most popular anime   | No            | 1 hour    |
| GET    | `/anime/most-favorited`       | Get most favorited anime | No            | 1 hour    |
| GET    | `/anime/current-season`       | Get current season anime | No            | 30 min    |
| GET    | `/anime/season`               | Get current season anime | No            | 12 hours  |
| GET    | `/anime/season/:year/:season` | Get specific season      | No            | 12 hours  |
| GET    | `/anime/schedule`             | Get broadcast schedule   | No            | 1 hour    |
| GET    | `/anime/search`               | Search anime             | No            | 15 min    |
| GET    | `/anime/:id`                  | Get anime details        | No            | 1 hour    |

### User & Watchlist Endpoints

| Method | Endpoint                | Description            | Auth Required |
| ------ | ----------------------- | ---------------------- | ------------- |
| GET    | `/user/profile`         | Get user profile       | Yes           |
| PUT    | `/user/profile`         | Update user profile    | Yes           |
| DELETE | `/user/profile`         | Delete user account    | Yes           |
| GET    | `/user/watchlist`       | Get user's watchlist   | Yes           |
| POST   | `/user/watchlist`       | Add anime to watchlist | Yes           |
| PUT    | `/user/watchlist/:id`   | Update watchlist entry | Yes           |
| DELETE | `/user/watchlist/:id`   | Remove from watchlist  | Yes           |
| GET    | `/user/history`         | Get watch history      | Yes           |
| POST   | `/user/history/update`  | Update watch history   | Yes           |
| POST   | `/user/upgrade-premium` | Upgrade to premium     | Admin         |

### Admin Endpoints

| Method | Endpoint                      | Description               | Auth Required |
| ------ | ----------------------------- | ------------------------- | ------------- |
| GET    | `/admin/stats`                | Get platform statistics   | Admin         |
| GET    | `/admin/system-stats`         | Get system statistics     | Admin         |
| GET    | `/admin/logs`                 | Get system logs           | Admin         |
| POST   | `/admin/clear-cache`          | Clear application cache   | Admin         |
| GET    | `/admin/users`                | Get all users (paginated) | Admin         |
| GET    | `/admin/users/:id`            | Get specific user         | Admin         |
| PUT    | `/admin/users/:id`            | Update user information   | Admin         |
| DELETE | `/admin/users/:id`            | Delete user               | Admin         |
| POST   | `/admin/create-admin`         | Create admin user         | Admin         |
| POST   | `/admin/trigger-scrape/:type` | Trigger data scraping     | Admin         |
| GET    | `/admin/users/:id/watchlist`  | Get user's watchlist      | Admin         |

---

## ❌ Error Handling

### Error Response Format

All errors follow a consistent format:

```javascript
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "stack": "..." // Only in development mode
  }
}
```

## 🚦 Rate Limiting

### Rate Limit Configuration

```javascript
// Global API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: "Too many requests, please try again later",
});

// Specific limiters
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // search requests per minute
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // login attempts per window
});
```

### Rate Limit Headers

The API returns rate limit information in headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 💾 Caching

### Cache Strategy

- **Memory Cache**: Node-cache for frequently accessed data
- **Redis Cache**: Optional distributed caching
- **HTTP Cache**: Cache-Control headers for client-side caching

### Cache TTL (Time To Live)

| Data Type      | TTL                  |
| -------------- | -------------------- |
| Anime Details  | 1 hour               |
| Search Results | 15 minutes           |
| Top Lists      | 30 minutes - 2 hours |
| Seasonal Data  | 30 minutes           |
| User Data      | No cache (real-time) |

### Cache Headers

```javascript
// Example cache headers
Cache-Control: public, max-age=3600
ETag: "abc123"
Last-Modified: Thu, 15 Mar 2024 10:30:00 GMT
```

## 🛡️ Security

### Security Middleware

1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Rate Limiting**: Request throttling
4. **Input Validation**: Joi schema validation
5. **JWT Authentication**: Secure token-based auth
6. **Password Hashing**: bcryptjs encryption
7. **Turnstile**: Cloudflare CAPTCHA protection

### Input Validation

All inputs are validated using Joi schemas:

```javascript
const schemas = {
  auth: {
    register: Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  },
};
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all required env vars
2. **Database**: Use MongoDB Atlas or dedicated MongoDB server
3. **Redis**: Optional but recommended for caching

### Vercel Deployment

The API is configured for Vercel with `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### Health Checks

Monitor API health using:

```
GET /api/v1/health
```

Response:

```javascript
{
  "status": "healthy",
  "environment": "production",
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

## ✉️ Support

For technical support or questions about the API, please refer to the main project documentation or open an issue on the GitHub repository.

> [!important]: This API scrapes data from MyAnimeList for educational purposes. Please respect MAL's terms of service and consider rate limiting when making requests.
