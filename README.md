# SayTruth - Anonymous Truth-Telling Platform

A modern web application for anonymous messaging, temporary links, and private communication built with React (Vite) frontend and FastAPI backend.

## 🚀 Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Git (optional, for cloning)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd saytruth
cp .env.example .env  # Optional: customize environment variables
```

### 2. Start All Services
```bash
docker compose up --build
```

This will start three services in order:
1. **Database** (SQLite) - Health check enabled
2. **Backend API** (FastAPI) - Port 8000
3. **Frontend** (React + Vite) - Port 3000

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📦 Services Overview

### Frontend Container (saytruth-app)
- **Tech**: React 18 + Vite
- **Port**: 3000 (maps to container port 5173)
- **Features**: 
  - Home, Links, Search, Messages, Profile tabs
  - Multi-language support (EN, AR, ES)
  - Guest mode and authenticated mode
  - Mobile-first responsive design

### Backend Container (saytruth-api)
- **Tech**: Python 3.11 + FastAPI
- **Port**: 8000
- **Features**:
  - JWT authentication
  - REST API endpoints
  - SQLite database integration
  - Auto-migration on startup

### Database Container (saytruth-db)
- **Tech**: SQLite (Alpine Linux + sqlite3)
- **Purpose**: Development/debugging
- **Note**: SQLite runs in-process via volume mount

## 🗄️ Database Schema

### Tables
- **Users**: id, username, secret_phrase (hashed), created_at
- **Messages**: id, receiver_id, content, status (inbox/public/favorite), created_at
- **Links**: id, temporary_name, public_link, private_link, expiration_time
- **Friends**: id, user_id, friend_id, created_at

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Messages
- `GET /api/messages/` - Get user messages (auth required)
- `POST /api/messages/send` - Send anonymous message
- `PATCH /api/messages/{id}/status` - Update message status
- `DELETE /api/messages/{id}` - Delete message

### Links
- `GET /api/links/` - List all active links
- `POST /api/links/create` - Create temporary link
- `GET /api/links/get/{id}` - Get specific link

### Users & Friends
- `POST /api/users/search` - Search users by username
- `POST /api/users/friends/add` - Add friend
- `GET /api/users/friends` - Get friends list

## 🛠️ Development

### Run Individual Services

```bash
# Backend only
docker compose up saytruth-api

# Frontend only
docker compose up saytruth-app

# Database only
docker compose up saytruth-db
```

### View Logs
```bash
docker compose logs -f saytruth-api
docker compose logs -f saytruth-app
```

### Stop Services
```bash
docker compose down
```

### Rebuild After Changes
```bash
docker compose up --build
```

## 🔄 Switching to PostgreSQL

To migrate from SQLite to PostgreSQL:

1. Update `.env`:
```env
DATABASE_URL=postgresql+psycopg2://user:password@postgres:5432/saytruth
```

2. Add PostgreSQL service to `docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: saytruth
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - saytruth-network

volumes:
  postgres_data:
```

3. Update backend dependencies in `backend/requirements.txt`:
```
psycopg2-binary==2.9.9
```

4. Rebuild and restart:
```bash
docker compose down
docker compose up --build
```

## 🌐 Environment Variables

See `.env.example` for all available options:

- `JWT_SECRET` - Secret key for JWT token signing
- `FRONTEND_URL` - CORS allowed origin
- `DATABASE_URL` - Database connection string
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time

## 📱 Features

### Guest Mode
- Send anonymous messages
- Create temporary links
- Search users
- No registration required

### User Mode (Login/Signup)
- Persistent message inbox
- Manage link history
- Add friends
- Status updates (inbox/public/favorite)

## 🎨 Frontend Pages

- **Home**: Create temporary links, view active links
- **Links**: Manage all links with countdown timers
- **Search**: Find users and add friends
- **Messages**: Inbox with status filtering
- **Profile**: User settings, logout, friends list

## 🔒 Security Notes

⚠️ **For Production:**
1. Change `JWT_SECRET` in `.env`
2. Update CORS origins in backend
3. Use HTTPS/TLS
4. Switch to PostgreSQL
5. Enable rate limiting
6. Add input validation

## 📝 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Pull requests welcome! Please test with Docker Compose before submitting.
