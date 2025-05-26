# ⛩️ Sugoi-Web 🌸

<div align="center">
  <img src="https://i.ibb.co/ym5bgfZB/logo.png" alt="PrettyJson Logo" width="250" height="260">
</div>

A modern, full-stack anime streaming and tracking platform built with **Next.js**, **MUI** and **Node.js**. Discover, track, and explore your favorite anime series with a beautiful, responsive interface.

## ✨ Features

### 🎯 Core Features

- **Anime Discovery**: Browse trending, seasonal, and featured anime
- **Advanced Search**: Filter by genre, year, status, and more
- **Anime Details**: Comprehensive information including synopsis, characters, music themes, and recommendations
- **Personal Watchlists**: Create and manage your anime collections
- **User Authentication**: Secure registration, login, and password recovery
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔒 User Management

- JWT-based authentication
- Email verification with OTP
- Password reset functionality
- Premium user roles and permissions
- Admin dashboard for user management

### 🛡️ Security & Performance

- Rate limiting with Redis support
- Cloudflare Turnstile CAPTCHA integration
- Request caching and optimization
- CORS protection
- Data validation and sanitization
- Comprehensive logging system

### 🎨 UI/UX

- Material-UI components with custom theming
- Dark and light mode support
- Skeleton loading states
- Mobile-first responsive design

## 📸 Screenshots

<div align="center">
  
### Home Page & Trending Anime
<img src="https://i.ibb.co/B2XcTX34/1.webp" alt="Home Page" width="800">

### Anime Details Page

<img src="https://i.ibb.co/xSFtz8wz/2.webp" alt="Anime Details" width="800">

### Seasonal Anime

<img src="https://i.ibb.co/BK56LBFt/3.webp" alt="Character Details" width="800">

### Animr Schedule

<img src="https://i.ibb.co/KjmbYnm3/4.webp" alt="Search Interface" width="800">

### Search & Filter Interface

<img src="https://i.ibb.co/PsQT8tPQ/5.webp" alt="Login Page" width="800">

### Login

<img src="https://i.ibb.co/fdNhCjvG/6.webp" alt="Mobile View" width="800">

### Sign Up

<img src="https://i.ibb.co/8wrsBCn/7.webp" alt="Dark Mode" width="800">

</div>

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.2.4
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Redux Toolkit
- **Icons**: Iconify and MUI Icons

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer
- **Caching**: Node-cache & Redis (optional)
- **Web Scraping**: Cheerio for MyAnimeList data
- **Logging**: Winston

### DevOps & Tools

- **Deployment**: Vercel-ready configuration
- **Environment Management**: dotenv
- **Process Management**: Nodemon (development)
- **Security**: Helmet, CORS, Rate limiting

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone https://github.com/Debojit-mitra/Sugoi-Web.git
cd Sugoi-Web
```

### 2. Backend Setup

```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## ⚙️ Environment Variables

### Backend (.env)

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/sugoi-web

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Sugoi
EMAIL_FROM_ADDRESS=your-email@gmail.com

# Redis (Optional - for distributed caching)
REDIS_URL=redis://localhost:6379

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Cloudflare Turnstile (for CAPTCHA)
TURNSTILE_SECRET_KEY=your-turnstile-secret
TURNSTILE_ENABLED=true

# Cache Control
DISABLE_CACHE=false
```

### Frontend (.env)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

## 🚀 Deployment

### Backend Deployment

The backend is configured for deployment on various platforms:

**Vercel**:

- The `vercel.json` configuration is included
- Set environment variables in your Vercel dashboard
- Deploy directly from your Git repository

**Other Platforms**:

```bash
# Build and start for production
npm run start
```

### Frontend Deployment

**Vercel** (Recommended):

```bash
cd client
npm run build
npm run start
```

## 📖 API Documentation

The backend provides a comprehensive REST API with the following endpoints:

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password/:token` - Reset password
- `POST /api/v1/auth/verify-otp` - Verify email OTP

### Anime

- `GET /api/v1/anime/trending` - Get trending anime
- `GET /api/v1/anime/seasonal` - Get seasonal anime
- `GET /api/v1/anime/search` - Search anime with filters
- `GET /api/v1/anime/:id` - Get anime details
- `GET /api/v1/anime/:id/characters` - Get anime characters
- `GET /api/v1/anime/:id/recommendations` - Get recommendations

### User & Watchlist

- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `GET /api/v1/user/watchlist` - Get user's watchlist
- `POST /api/v1/user/watchlist` - Add to watchlist
- `DELETE /api/v1/user/watchlist/:id` - Remove from watchlist

### Admin (Protected)

- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `GET /api/v1/admin/stats` - Get platform statistics

For detailed API documentation, see [Backend Documentation](server/backend%20documentation.md).

## 🔧 Development

### Available Scripts

**Backend**:

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

**Frontend**:

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC [License](LICENSE).

## 🙏 Acknowledgments

- [MyAnimeList](https://myanimelist.net/) for anime data
- [Material-UI](https://mui.com/) for the component library
- [Next.js](https://nextjs.org/) for the React framework
- [Express.js](https://expressjs.com/) for the backend framework

> [!IMPORTANT]
> This is a **personal project** created for educational and portfolio purposes. The application scrapes data from MyAnimeList (MAL) without explicit permission from MAL. This project is not intended for commercial use and should only be used for learning and demonstration purposes. Please respect the terms of service of MyAnimeList and consider obtaining proper permissions before deploying this application publicly or using it for commercial purposes.

## ✉️ Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

Made with ❤️ by Debojit
