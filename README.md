# SayTruth - Anonymous Truth-Telling Platform

A modern web application for anonymous messaging, temporary links, and private communication built with React (Vite) frontend and FastAPI backend.

**Status:** ✅ Production-Ready with Enterprise-Grade Infrastructure

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- 2GB RAM minimum, 5GB disk space

### 1. Setup Environment
```bash
# Clone repository
git clone <your-repo>
cd saytruth

# Create .env file with configuration
cp .env.example .env

# Generate secure keys
export JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
export ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Update .env with your values
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
```

### 2. Validate Setup
```bash
bash setup.sh
```

This verifies:
- ✅ .env configuration
- ✅ Encryption keys valid
- ✅ Docker installed
- ✅ All required variables set

### 3. Start All Services
```bash
docker-compose up -d
```

Services start in order:
1. **Database** (SQLite) - /data/app.db
2. **Backend API** (FastAPI) - :8000
3. **Frontend** (React + Vite) - :5173
4. **Nginx** (Internal routing) - :80 (internal)
5. **Caddy** (HTTPS proxy) - :80, :443

### 4. Access Application
```bash
# Add to /etc/hosts (Linux/Mac)
echo "127.0.0.1 saytruth.local" >> /etc/hosts

# Access via HTTPS
https://saytruth.local/

# API documentation
https://saytruth.local/api/docs

# Health check
curl -k https://saytruth.local/health
```

## � Documentation

Comprehensive documentation for the SayTruth platform:

| Document | Purpose |
|----------|---------|
| **[INFRASTRUCTURE.md](INFRASTRUCTURE.md)** | Complete infrastructure setup guide, deployment instructions, troubleshooting |
| **[SECURITY_AUDIT.md](SECURITY_AUDIT.md)** | Security review, threat assessment, compliance verification |
| **[LINK_SYSTEM_IMPLEMENTATION_SUMMARY.md](LINK_SYSTEM_IMPLEMENTATION_SUMMARY.md)** | Temporary anonymous links system documentation |
| **[README_INBOX_SYSTEM.md](README_INBOX_SYSTEM.md)** | Inbox system architecture and features |

## 🔐 Security Features

✅ **HTTPS/TLS** - Automatic certificate generation via Caddy  
✅ **Message Encryption** - Fernet symmetric encryption at rest  
✅ **Rate Limiting** - Per-IP protection (60 req/min general, 20 req/hr auth)  
✅ **Network Isolation** - Services in private bridge network  
✅ **Security Headers** - HSTS, X-Frame-Options, CSP, etc.  
✅ **Secrets Management** - All configuration via .env (never in code)  
✅ **Database Security** - Encrypted messages, restricted access  

## 🚀 Infrastructure Architecture

```
┌─────────────────────────────────────────────┐
│  INTERNET (HTTPS via Caddy - ports 80/443)  │
└──────────────────┬──────────────────────────┘
                   ▼
          ┌─────────────────┐
          │     CADDY       │ HTTPS/TLS + Security Headers
          │ Reverse Proxy   │ Domain: $DOMAIN
          │  :80, :443      │ Auto-HTTPS/Self-signed
          └────────┬────────┘
                   ▼ (HTTP port 80, internal)
          ┌─────────────────┐
          │     NGINX       │ Internal Routing
          │ :80 (internal)  │ /api/ → backend
          └────┬────────┬───┘ / → frontend
               │        │
         /api/ │        │ /
              ▼        ▼
         ┌───────┐ ┌────────┐
         │FastAPI│ │ React  │
         │:8000  │ │:5173   │
         └───┬───┘ └────────┘
             │
             ▼
         ┌──────────┐
         │ SQLite   │
         │/data/    │
         │app.db    │
         └──────────┘
```

## 📦 Services Overview

### Frontend Container (saytruth-app)
- **Tech**: React 18 + Vite
- **Port**: 5173 (internal)
- **Features**: 
  - Home, Links, Search, Messages, Profile tabs
  - Multi-language support (EN, AR, ES)
  - Guest mode and authenticated mode
  - Mobile-first responsive design

### Backend Container (saytruth-api)
- **Tech**: Python 3.11 + FastAPI
- **Port**: 8000 (internal)
- **Features**:
  - JWT authentication
  - REST API endpoints
  - SQLite database integration
  - Message encryption (Fernet)
  - Anonymous link system

### Caddy (Reverse Proxy)
- **Tech**: Caddy (Alpine Linux)
- **Ports**: 80, 443 (public)
- **Features**:
  - HTTPS/TLS termination
  - Automatic certificate generation
  - Security headers
  - Gzip compression

### Nginx (Internal Router)
- **Tech**: Nginx (Alpine Linux)
- **Port**: 80 (internal only)
- **Features**:
  - Internal service routing
  - Rate limiting per IP
  - Load balancing
  - Security headers

### Database Container (saytruth-db)
- **Tech**: SQLite
- **Path**: /data/app.db
- **Features**: 
  - Persistent volume mount
  - Health checks enabled
  - No external access


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
