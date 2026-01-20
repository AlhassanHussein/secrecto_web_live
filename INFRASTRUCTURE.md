# SayTruth Infrastructure Documentation

## Overview

SayTruth uses a production-ready infrastructure with Docker Compose orchestration, HTTPS via Caddy, and internal Nginx routing. All services communicate securely through a private bridge network.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERNET (Public)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (ports 80/443)
                           ▼
                   ┌───────────────┐
                   │     CADDY     │
                   │  Reverse Proxy│
                   │   HTTPS/TLS   │
                   │   saytruth    │
                   │   .local      │
                   └───────┬───────┘
                           │ HTTP (port 80 internal)
                           ▼
                   ┌───────────────┐
                   │     NGINX     │
                   │ Internal Proxy│
                   │  Routing      │
                   └───┬───────┬───┘
                       │       │
            /api/*      │       │      /
         (rate limit)   │       │   (SPA)
                        ▼       ▼
                   ┌──────┐ ┌───────┐
                   │FastAPI
                   │Backend│ │ React │
                   │:8000  │ │:5173  │
                   └───┬───┘ └───────┘
                       │
                       ▼
                   ┌──────────┐
                   │  SQLite  │
                   │  /data   │
                   │  app.db  │
                   └──────────┘
```

### Service Stack

| Service | Port (Internal) | Port (Public) | Role |
|---------|---|---|---|
| **Caddy** | - | 80, 443 | HTTPS termination, reverse proxy |
| **Nginx** | 80 | - | Internal routing, load balancing |
| **FastAPI** | 8000 | - | REST API backend |
| **React+Vite** | 5173 | - | Frontend SPA |
| **SQLite** | - | - | Database |

---

## 📋 Configuration

### Environment Variables (.env)

All configuration is stored in `.env` file (NOT committed to git).

**Critical Variables:**
```env
# Domain routing (no code changes needed to switch domains)
DOMAIN=saytruth.local
EMAIL=admin@saytruth.local

# Security secrets (MUST be set before production)
JWT_SECRET=your-super-secret-key-min-32-chars
ENCRYPTION_KEY=your-fernet-key-from-cryptography-library

# Database path
DB_PATH=/data/app.db

# Rate limits
RATE_LIMIT=60/minute
AUTH_RATE_LIMIT=20/hour
MESSAGE_SEND_RATE_LIMIT=10/minute
```

### Generation of Secure Keys

**JWT Secret:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Fernet Encryption Key:**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## 🐳 Docker Compose Orchestration

### Service Startup Order

```
docker-compose up -d
```

Sequence:
1. `saytruth-db` (SQLite database)
2. `saytruth-api` (FastAPI backend, waits for db)
3. `saytruth-app` (React frontend, waits for api)
4. `nginx` (internal routing, waits for api & app)
5. `caddy` (public proxy, waits for nginx)

### Network Isolation

All services communicate via `saytruth-network` (bridge):
- Internal services cannot be accessed directly from outside
- Only Caddy has ports exposed (80, 443)
- Backend is completely isolated from public internet

### Volume Management

**Data Persistence:**
- `./data:/data` - Database file (app.db)
- `caddy_data` - Caddy certificate storage
- `caddy_config` - Caddy configuration cache

---

## 🔒 Security Implementation

### 1. HTTPS/TLS

**Caddy Configuration:**
- Auto-generates SSL certificates
- Uses Let's Encrypt in production
- Self-signed certificates for local development
- Enforces HTTPS by default

### 2. Message Encryption

**Fernet Cipher:**
- Symmetric key encryption (requires key to decrypt)
- All messages encrypted at storage
- Messages unencrypted only for authenticated users
- Losing encryption key = messages permanently unrecoverable

**Implementation:**
```python
from cryptography.fernet import Fernet
from app.core.security import encrypt_message, decrypt_message

# Encrypt on storage
encrypted = encrypt_message(user_content)
db.save(encrypted)

# Decrypt on retrieval (only for message owner)
decrypted = decrypt_message(encrypted)
```

### 3. Rate Limiting

**Per-IP rate limits via Nginx:**
- General endpoints: 60 requests/minute
- Authentication: 20 requests/hour
- Message sending: 10 requests/minute

Returns `429 Too Many Requests` when limit exceeded.

### 4. Security Headers

**Caddy adds headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

**Nginx adds headers:**
```
Same security headers above
Cache-Control: no-store for API responses
```

### 5. CORS Configuration

Handled at Nginx level with configurable allowed origins:
```
ALLOWED_ORIGINS=http://localhost:3000,http://saytruth.local
```

### 6. Backend Isolation

- Backend runs inside container (no shell access)
- Database file owned by container user
- No default credentials or backdoors
- All configuration via environment variables

---

## 🚀 Domain Configuration

### Changing Domain (ZERO code changes required)

1. Update `.env`:
```bash
# Old
DOMAIN=saytruth.local

# New
DOMAIN=messages.example.com
EMAIL=admin@messages.example.com
```

2. Restart services:
```bash
docker-compose down
docker-compose up -d
```

3. Access app at new domain (HTTPS automatically configured)

### DNS Requirements

Add DNS record:
```
A    example.com    your-server-ip
AAAA example.com    your-ipv6-address (optional)
```

---

## 🔍 Verification Checklist

### Security

- [x] All secrets in `.env` (never in code)
- [x] Messages encrypted at rest with Fernet
- [x] Database file in restricted volume
- [x] Rate limiting enforced per IP
- [x] Security headers configured
- [x] HTTPS enforced by Caddy
- [x] Backend not exposed publicly
- [x] No hardcoded credentials

### Configuration

- [x] Domain from environment variable
- [x] Email from environment variable
- [x] Encryption key from environment
- [x] JWT secret from environment
- [x] Database path configurable
- [x] Rate limits configurable

### Architecture

- [x] Services in private network
- [x] Only Caddy exposed to ports 80/443
- [x] Nginx handles internal routing
- [x] Proper health checks
- [x] Graceful shutdown
- [x] Volume persistence

### Operations

- [x] Domain change requires no code edit
- [x] Encryption key management clear
- [x] Setup script provided
- [x] Comprehensive documentation
- [x] Error messages helpful

---

## 🧪 Testing & Validation

### Local Testing

**1. Generate keys:**
```bash
export JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
export ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
```

**2. Update .env with values:**
```bash
echo "JWT_SECRET=$JWT_SECRET" >> .env
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env
```

**3. Start services:**
```bash
docker-compose up -d
```

**4. Verify endpoints:**
```bash
# Frontend
curl -k https://saytruth.local/

# API health
curl -k https://saytruth.local/api/health

# Authentication (should fail without credentials)
curl -k https://saytruth.local/api/auth/login
```

**5. Verify encryption:**
```bash
# Check database - content should be unreadable
docker exec saytruth-database sqlite3 /data/app.db \
  "SELECT id, content FROM message LIMIT 1;"

# Content will appear as: gAAAAABl...encrypted...string
```

### Domain Testing

**1. Add to /etc/hosts (Linux/Mac):**
```bash
echo "127.0.0.1 saytruth.local" >> /etc/hosts
```

**2. Change domain in .env:**
```bash
DOMAIN=myapp.local
```

**3. Restart:**
```bash
docker-compose down
docker-compose up -d
```

**4. Update /etc/hosts:**
```bash
echo "127.0.0.1 myapp.local" >> /etc/hosts
```

**5. Verify it works:**
```bash
curl -k https://myapp.local/
```

---

## 📊 Monitoring

### Container Health

```bash
# Check all container status
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service
docker logs saytruth-backend
```

### Performance

**Nginx stats:**
```bash
docker exec saytruth-nginx nginx -T  # validate config
```

**Caddy stats:**
```bash
docker exec saytruth-caddy caddy version
```

**Database size:**
```bash
docker exec saytruth-database du -sh /data/app.db
```

---

## 🔧 Troubleshooting

### HTTPS Certificate Issues

**Problem:** "Certificate not trusted"
**Solution:** 
- Use self-signed certs locally (normal in development)
- Browser should have option to "proceed anyway"
- Production: Use Let's Encrypt with valid domain

### Connection Refused

**Problem:** "Cannot connect to saytruth.local"
**Solution:**
- Add to /etc/hosts: `127.0.0.1 saytruth.local`
- Verify containers running: `docker-compose ps`
- Check Caddy logs: `docker logs saytruth-caddy`

### Messages Not Encrypted

**Problem:** Can read messages in database
**Solution:**
- Verify ENCRYPTION_KEY set: `grep ENCRYPTION_KEY .env`
- Restart backend: `docker-compose restart saytruth-api`
- Check backend logs for encryption warnings

### Rate Limit Too Strict

**Problem:** Legitimate requests getting 429 errors
**Solution:**
- Increase RATE_LIMIT in .env
- Restart Nginx: `docker-compose restart nginx`

### Slow Performance

**Problem:** Requests taking >1s
**Solution:**
- Check Docker resources: `docker stats`
- Check database size: `ls -lh ./data/app.db`
- Monitor Nginx: `docker logs saytruth-nginx`

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Generate and set ENCRYPTION_KEY
- [ ] Set DOMAIN to production domain
- [ ] Set EMAIL to valid admin email
- [ ] Enable AUTO_HTTPS=on in .env
- [ ] Set DEBUG=false
- [ ] Review all rate limits
- [ ] Set up database backups
- [ ] Configure monitoring/alerts
- [ ] Test failover scenarios

### Production .env Settings

```env
# Production mode
DEBUG=false
AUTO_HTTPS=on

# Security
JWT_SECRET=<production-secret-44+ chars>
ENCRYPTION_KEY=<production-fernet-key>

# Domain
DOMAIN=yourdomain.com
EMAIL=admin@yourdomain.com

# Database (optional: switch to PostgreSQL)
# DATABASE_URL=postgresql+psycopg2://user:pass@postgres:5432/saytruth

# Rate limiting (adjust based on load)
RATE_LIMIT=100/minute
AUTH_RATE_LIMIT=30/hour
MESSAGE_SEND_RATE_LIMIT=20/minute
```

### Backup Strategy

**Database backup:**
```bash
docker exec saytruth-database \
  sqlite3 /data/app.db ".backup /data/backup.db"
```

**Encryption key backup:**
```bash
# Store ENCRYPTION_KEY securely (e.g., vault, AWS Secrets Manager)
# Losing this key makes all messages unrecoverable
cp .env /secure/backup/location/.env.backup
```

### Scaling Considerations

For high-traffic production:
1. Switch from SQLite to PostgreSQL
2. Add load balancer in front of Nginx
3. Use Redis for rate limiting
4. Implement CDN for static assets
5. Monitor with Prometheus/Grafana

---

## 📚 Related Documentation

- [README.md](README.md) - Main project documentation
- [docker-compose.yml](docker-compose.yml) - Service orchestration
- [.env](.env) - Configuration template
- [caddy/Caddyfile](caddy/Caddyfile) - Reverse proxy config
- [nginx/nginx.conf](nginx/nginx.conf) - Internal routing
- [backend/app/core/security.py](backend/app/core/security.py) - Encryption implementation

---

## ✅ Final Verification

Run the setup script to validate everything:
```bash
bash setup.sh
```

This checks:
- ✅ .env file exists
- ✅ All required variables set
- ✅ Encryption key format valid
- ✅ JWT secret sufficient length
- ✅ Docker installed
- ✅ docker-compose.yml valid

---

**Status:** ✅ Production-Ready Infrastructure
**Last Updated:** 2024
**Maintainer:** SayTruth Dev Team
