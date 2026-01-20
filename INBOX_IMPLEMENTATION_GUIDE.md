# Inbox System - Complete Architecture & Implementation Guide

## Project: SayTruth Anonymous Messaging Platform

---

## 1. System Overview

The SayTruth Inbox System is a privacy-first anonymous messaging platform featuring:
- **Anonymous Messages**: No sender identification or tracking
- **Message Encryption**: Fernet symmetric encryption at rest
- **Three-State Inbox**: Messages can be inbox (private), public, or deleted
- **Optimistic UI**: Instant frontend updates with server sync in background
- **Public Profiles**: Users can share selected messages publicly
- **Follow System**: One-way follows (Twitter-like) for user discovery
- **Mobile-First**: Responsive design with multi-language support (EN/AR/ES)

---

## 2. Database Schema

### Core Tables

#### User Table
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    secret_phrase VARCHAR NOT NULL,
    secret_answer VARCHAR NOT NULL,
    language VARCHAR DEFAULT 'EN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Purpose**: User authentication, profile data, language preferences

#### Message Table
```sql
CREATE TABLE message (
    id INTEGER PRIMARY KEY,
    receiver_id INTEGER NOT NULL FOREIGN KEY → user.id,
    content TEXT NOT NULL,  -- Encrypted with Fernet
    status VARCHAR DEFAULT 'inbox',  -- inbox | public | deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Properties**:
- NO `sender_id` field (anonymity guarantee)
- NO IP address or tracking fields
- `content` stored as Base64-encoded encrypted blob
- `status` drives visibility and access control

#### Follow Table
```sql
CREATE TABLE follow (
    id INTEGER PRIMARY KEY,
    follower_id INTEGER NOT NULL FOREIGN KEY → user.id,
    following_id INTEGER NOT NULL FOREIGN KEY → user.id,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
)
```

**Properties**:
- One-way relationship (Twitter-like)
- No mutual follow required
- No approval workflow

#### Link Table
```sql
CREATE TABLE link (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER NOT NULL FOREIGN KEY → user.id,
    temporary_name VARCHAR NOT NULL,
    public_link VARCHAR UNIQUE NOT NULL,
    private_link VARCHAR UNIQUE NOT NULL,
    expiration_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Purpose**: Shareable countdown/notification links

---

## 3. Encryption Architecture

### Encryption Strategy

**Algorithm**: Fernet (Symmetric)
- From `cryptography` Python package
- Uses AES-128 in CBC mode with HMAC
- Includes timestamp and IV
- Auto-pads plaintext

**Key Management**:
```python
# Source: ENCRYPTION_KEY environment variable
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

# If not set (dev only):
ENCRYPTION_KEY = Fernet.generate_key().decode()
print(f"WARNING: Using dev key: {ENCRYPTION_KEY}")
```

### Encryption Flow

```
1. User sends anonymous message
   ↓
2. Backend receives: MessageCreate(receiver_username, content)
   ↓
3. Lookup receiver by username
   ↓
4. ENCRYPT: encrypted_content = Fernet(key).encrypt(content)
   ↓
5. STORE: Message(receiver_id, encrypted_content, status=inbox)
   ↓
6. DATABASE: Base64-encoded ciphertext stored at rest
   ↓
7. Return: Decrypted plaintext to sender (if authenticated)
```

### Decryption Flow

```
1. Authenticated user requests: GET /api/messages/inbox
   ↓
2. Backend verifies: authorization header + JWT token
   ↓
3. Query database: SELECT * FROM message WHERE receiver_id = current_user.id
   ↓
4. DECRYPT: plaintext = Fernet(key).decrypt(encrypted_content)
   ↓
5. Handle errors: If decrypt fails → "[Message content unavailable]"
   ↓
6. Return: Decrypted messages grouped by status
   ↓
7. Frontend: Receive and display plaintext messages
```

### Key Rotation Strategy (Recommended Future)

```
current_key_version = 2
historical_keys = {
    1: "old_key_bytes",
    2: "current_key_bytes"  # Latest
}

Background job:
    FOR each message with key_version < current:
        1. Decrypt with historical key
        2. Encrypt with current key
        3. Update key_version field
        4. Commit
```

---

## 4. Message State Lifecycle

### State Diagram

```
                  ┌─────────────────────┐
                  │   User Sends Msg    │
                  └──────────┬──────────┘
                             │
                             ↓
                        ┌─────────────┐
                        │  INBOX      │  (Private)
                        │(status=0)   │
                        └──┬──────┬───┘
                           │      │
                    ┌──────┘      └──────┐
                    ↓                     ↓
              ┌──────────┐         ┌──────────┐
              │PUBLIC    │         │ DELETED  │
              │(status=1)│         │(status=2)│
              └────┬─────┘         └────┬─────┘
                   │                    │
                   │                    │
                   └─────────┬──────────┘
                             ↓
                        ┌─────────────┐
                        │ DELETED     │ (from any)
                        │ (soft del)  │
                        └─────────────┘
```

### State Descriptions

| State | Visibility | Editable | Use Case |
|-------|-----------|----------|----------|
| **inbox** | Receiver only | Yes (move to public/delete) | Default, private messages |
| **public** | All users | Yes (move to inbox/delete) | Share on public profile |
| **deleted** | None (hidden) | No (requires admin restore) | Archived/removed messages |

### Transitions

```
Routes (allowed transitions):
- inbox → public    (PATCH /messages/{id}/make-public)
- public → inbox    (PATCH /messages/{id}/make-private)
- inbox → deleted   (DELETE /messages/{id})
- public → deleted  (DELETE /messages/{id})
- deleted → ∅       (cannot transition from deleted)
```

---

## 5. API Endpoints

### Authentication Endpoints

```
POST /api/auth/signup
  Body: {username, name, secret_phrase, secret_answer}
  Response: {access_token, token_type, user}
  Rate Limit: None (recommend 5/24h per IP)

POST /api/auth/login
  Body: {username, secret_answer}
  Response: {access_token, token_type, user}
  Rate Limit: None (recommend 5/15m failed attempts per IP)

POST /api/auth/recover
  Body: {username}
  Response: {secret_phrase}
  
POST /api/auth/recover/verify
  Body: {username, secret_answer}
  Response: {access_token, token_type}

GET /api/auth/me
  Auth: Required (Bearer token)
  Response: {id, username, name, language, created_at}

PATCH /api/auth/settings
  Auth: Required
  Body: {language?}
  Response: {success, user}
```

### Message Endpoints

```
GET /api/messages/?status={status}
  Auth: Required
  Query: status = inbox | public | deleted (optional, excludes deleted by default)
  Response: [{id, receiver_id, content, status, created_at}, ...]
  Purpose: Fetch messages with optional status filter

GET /api/messages/inbox
  Auth: Required
  Response: {
    inbox: [{...}, ...],
    public: [{...}, ...],
    deleted: [{...}, ...]
  }
  Purpose: Get all messages grouped by status

POST /api/messages/send
  Auth: Optional (allows anonymous)
  Body: {receiver_username, content}
  Rate Limit: 5/minute
  Response: {id, receiver_id, content, status, created_at}
  Purpose: Send anonymous message (no sender_id stored)

PATCH /api/messages/{id}/make-public
  Auth: Required
  Ownership: receiver_id must equal current_user.id
  Response: {id, receiver_id, content, status='public', created_at}
  Purpose: Move message from inbox to public profile

PATCH /api/messages/{id}/make-private
  Auth: Required
  Ownership: receiver_id must equal current_user.id
  Response: {id, receiver_id, content, status='inbox', created_at}
  Purpose: Move message from public to private

DELETE /api/messages/{id}
  Auth: Required
  Ownership: receiver_id must equal current_user.id
  Response: {message: "Message deleted"}
  Purpose: Soft delete (status → deleted)
  Implementation: Soft delete only, not hard delete
```

### User Endpoints

```
POST /api/users/search
  Auth: Optional
  Body: {username}
  Rate Limit: 10/minute
  Response: [{id, username, name, is_following?}, ...]
  Purpose: Search for users

GET /api/users/{user_id}
  Auth: Optional
  Response: {
    id, username, name, created_at,
    public_messages: [  -- Only status=public
      {id, content, status, created_at},
      ...
    ],
    is_following: boolean
  }
  Purpose: View public profile (no auth required)

POST /api/users/follow/{user_id}
  Auth: Required
  Rate Limit: 20/hour
  Response: {message: "Following"}
  Purpose: Follow a user (one-way, instant)

DELETE /api/users/unfollow/{user_id}
  Auth: Required
  Response: {message: "Unfollowed"}
  Purpose: Unfollow a user

GET /api/users/following
  Auth: Required
  Response: [{id, username, name}, ...]
  Purpose: Get list of users you follow

GET /api/users/followers
  Auth: Required
  Response: [{id, username, name}, ...]
  Purpose: Get list of your followers
```

### Link Endpoints

```
POST /api/links/create
  Auth: Optional
  Body: {temporary_name, expiration_minutes}
  Response: {
    id, owner_id, temporary_name,
    public_link, private_link,
    expiration_time
  }
  Purpose: Create shareable countdown link

GET /api/links/{link_id}
  Auth: Optional
  Response: {id, owner_id, temporary_name, expiration_time, ...}
  Purpose: Get link details

GET /api/links/
  Auth: Optional
  Response: [{...}, ...]
  Purpose: List all public links
```

---

## 6. Frontend Architecture

### Component Hierarchy

```
App.jsx
├── Header.jsx
├── BottomNav.jsx
└── Tab Router
    ├── MessagesTab.jsx (INBOX)
    │   └── MessageCard.jsx (with actions)
    │
    ├── SearchTab.jsx
    │   └── UserCard.jsx (clickable → profile)
    │
    ├── UserProfilePage.jsx (Public Profile)
    │   └── MessageCard.jsx (read-only)
    │
    ├── ProfilePage.jsx (Own Profile)
    │   └── FollowingList.jsx
    │
    ├── LinksTab.jsx
    │   └── LinkCard.jsx
    │
    └── SettingsPage.jsx
```

### State Management

**App.jsx Global State**:
```javascript
const [activeTab, setActiveTab] = useState('messages');
const [selectedUserId, setSelectedUserId] = useState(null);
const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthToken());
const [currentUser, setCurrentUser] = useState(null);
const [language, setLanguage] = useState('EN');
```

**MessagesTab Local State**:
```javascript
const [messages, setMessages] = useState([]);
const [activeTab, setActiveTab] = useState('inbox');
const [loading, setLoading] = useState(true);
const [operatingIds, setOperatingIds] = useState(new Set()); // Tracking async ops
```

**SearchTab Local State**:
```javascript
const [searchResults, setSearchResults] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [searching, setSearching] = useState(false);
```

### Message State Transitions (Frontend)

```javascript
// Optimistic update pattern used in MessagesTab
const updateMessageStatus = async (id, newStatus) => {
    // 1. Save old state for rollback
    const oldMessages = messages;
    
    // 2. Immediately update UI (optimistic)
    setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: newStatus } : msg
    ));
    
    // 3. Add to operating set (disable button)
    setOperatingIds(prev => new Set([...prev, id]));
    
    try {
        // 4. Send to backend
        if (newStatus === 'public') {
            await messagesAPI.makeMessagePublic(id);
        } else if (newStatus === 'inbox') {
            await messagesAPI.makeMessagePrivate(id);
        } else if (newStatus === 'deleted') {
            await messagesAPI.deleteMessage(id);
        }
        
        // 5. Success - state already updated
    } catch (error) {
        // 6. Rollback on error
        setMessages(oldMessages);
        console.error('Failed:', error);
    } finally {
        // 7. Remove from operating set (re-enable button)
        setOperatingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }
};
```

---

## 7. Backend Architecture

### FastAPI Setup

**Main Application**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

app = FastAPI(title="SayTruth API")

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded"}
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://frontend:5173",   # Docker
        "https://saytruth.com"     # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api/auth")
app.include_router(messages_router, prefix="/api/messages")
app.include_router(users_router, prefix="/api/users")
app.include_router(links_router, prefix="/api/links")
```

### Dependency Injection

```python
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Verify JWT token and return current user"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(
    token: str = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, else None"""
    # Similar but doesn't raise on missing token
```

---

## 8. Docker Deployment

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: sqlite:///./database.db
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}  # Set via .env or export
      SECRET_KEY: ${SECRET_KEY}
    volumes:
      - ./backend:/app
      - ./database:/database
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  database:
    build: ./database
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Setup Instructions

```bash
# 1. Generate encryption key
export ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# 2. Start containers
docker-compose up --build

# 3. Backend runs on http://localhost:8000
# 4. Frontend runs on http://localhost:5173
# 5. API docs at http://localhost:8000/docs (Swagger UI)

# 6. Create initial user
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "name": "Test User",
    "secret_phrase": "My Secret Phrase",
    "secret_answer": "answer"
  }'
```

---

## 9. Security Checklist

### Pre-Deployment

- [ ] Set `ENCRYPTION_KEY` environment variable
- [ ] Set `SECRET_KEY` for JWT signing
- [ ] Enable HTTPS in production
- [ ] Configure CORS for your domain
- [ ] Add rate limiting to auth endpoints
- [ ] Enable database SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Run security scan on dependencies

### Post-Deployment

- [ ] Monitor rate limit exceptions
- [ ] Check encryption key is not logged
- [ ] Verify soft-deleted messages are not exposed
- [ ] Test public profile isolation
- [ ] Verify JWT token expiry
- [ ] Monitor database for suspicious activity
- [ ] Set up backup and recovery procedures

---

## 10. Monitoring & Observability

### Key Metrics to Track

```
Messages:
  - Total messages created (inbox, public, deleted)
  - Messages moved from inbox → public
  - Messages deleted
  - Failed encryption/decryption operations
  - Average message retrieval time

Users:
  - New signups per day
  - Active users (logged in this week)
  - Users with public messages
  - Follow/unfollow ratio

Performance:
  - API response times (p50, p95, p99)
  - Database query times
  - Encryption/decryption overhead
  - Memory usage

Security:
  - Rate limit exceptions
  - Auth failures
  - Unauthorized access attempts
  - Suspicious search patterns
```

### Logging Strategy

```python
import logging

logger = logging.getLogger(__name__)

# Log all message operations
logger.info(f"Message created: id={msg_id}, receiver={receiver_id}, status=inbox")
logger.info(f"Message status changed: id={msg_id}, old_status={old}, new_status={new}")
logger.warning(f"Failed to decrypt message: id={msg_id}, error={error}")

# Audit log for security
logger.warning(f"Unauthorized access attempt: user={user_id}, resource=message_{msg_id}")
logger.warning(f"Rate limit exceeded: ip={ip}, endpoint={endpoint}, limit={limit}")
```

---

## 11. Troubleshooting Guide

### Encryption Issues

**Problem**: "Message content unavailable" when viewing messages

**Solution**:
1. Check `ENCRYPTION_KEY` environment variable is set
2. Verify key matches key used when messages were created
3. Check database for corrupted encrypted data
4. Review logs for decryption failures

**Prevention**:
- Keep encrypted backup of `ENCRYPTION_KEY`
- Never change key without migration plan
- Test decryption on all messages before key rotation

### Message Not Visible

**Problem**: Message sent but not showing in receiver's inbox

**Causes**:
1. Receiver username incorrect → HTTPException 404
2. Message status not "inbox" → query doesn't return it
3. Receiver not logged in → can't access protected endpoint
4. Frontend not refreshing → cached data

**Debugging**:
```bash
# Check message in database
sqlite3 database.db "SELECT id, receiver_id, status, created_at FROM message ORDER BY id DESC LIMIT 5"

# Check receiver exists
sqlite3 database.db "SELECT id, username FROM user WHERE username='target'"

# Check API directly
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/messages/inbox
```

### Rate Limiting Too Strict

**Problem**: Legitimate users hitting rate limits

**Solution**:
```python
# In messages.py
@limiter.limit("5/minute")  # Too strict?
async def send_message(...):
    pass

# Adjust to:
@limiter.limit("10/minute")  # Allow more
async def send_message(...):
    pass
```

### High Encryption Overhead

**Problem**: Slow response times when fetching many messages

**Solution**:
1. Add database index on `receiver_id, status, created_at`
2. Implement message batching in frontend
3. Add caching layer (Redis) for public messages
4. Use async encryption for multiple messages

---

## 12. Future Enhancements

### Immediate (v1.1)
- [ ] Rate limiting on auth endpoints
- [ ] Hard delete background job (30-day soft delete cleanup)
- [ ] Message search within inbox
- [ ] Message filtering by date range

### Short-term (v1.2)
- [ ] Message reactions (emoji voting)
- [ ] Message threading/replies
- [ ] Message drafts
- [ ] Scheduled message send
- [ ] Message templates

### Medium-term (v2.0)
- [ ] End-to-end encryption option
- [ ] Key rotation mechanism
- [ ] Message expiry (auto-delete after X days)
- [ ] Admin moderation tools
- [ ] Message reporting system
- [ ] Data export (GDPR compliance)

### Long-term (v3.0)
- [ ] Group chats
- [ ] Voice messages
- [ ] File attachments
- [ ] Message encryption in browser
- [ ] Blockchain-verified timestamps
- [ ] Decentralized storage

---

## 13. Code Quality Standards

### Testing

```bash
# Backend tests
pytest backend/tests/ --cov=app --cov-report=html

# Frontend tests
npm test -- --coverage

# Integration tests
pytest backend/tests/integration/ -v
```

### Code Style

```bash
# Python
black backend/ --line-length=100
isort backend/
pylint backend/

# JavaScript
eslint frontend/src/
prettier frontend/src/ --write
```

### Documentation

- Maintain API documentation in Swagger (auto-generated from code)
- Keep README.md updated with setup instructions
- Document security decisions in this file
- Include inline comments for complex logic
- Create architecture diagrams for system overview

---

## 14. Support & Contact

For issues, questions, or security concerns:

- **Security Issues**: Please email security@saytruth.com
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **Documentation**: See [docs/](./docs/) directory

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready ✅

