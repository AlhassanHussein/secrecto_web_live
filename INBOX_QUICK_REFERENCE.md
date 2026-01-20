# Inbox System - Quick Reference Guide

## Core Concepts (30 seconds)

**Anonymous Messages**: Users send messages without revealing identity. No `sender_id` stored.

**Three States**: 
- `inbox` (private) 
- `public` (visible to all)
- `deleted` (soft-deleted, archived)

**Encryption**: Fernet symmetric, key from `ENCRYPTION_KEY` env var.

**Ownership**: Only receiver can view/modify their messages.

---

## API Quick Start

### Send Anonymous Message (No Auth)
```bash
curl -X POST http://localhost:8000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "receiver_username": "alice",
    "content": "You rock!"
  }'
```

**Response**:
```json
{
  "id": 123,
  "receiver_id": 5,
  "content": "You rock!",
  "status": "inbox",
  "created_at": "2024-01-15T10:30:00"
}
```

### Get Inbox (Auth Required)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/messages/inbox
```

**Response**:
```json
{
  "inbox": [
    {
      "id": 123,
      "content": "You rock!",
      "status": "inbox",
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "public": [
    {
      "id": 125,
      "content": "Thanks for the tips!",
      "status": "public",
      "created_at": "2024-01-14T15:20:00"
    }
  ],
  "deleted": []
}
```

### Make Message Public
```bash
curl -X PATCH http://localhost:8000/api/messages/123/make-public \
  -H "Authorization: Bearer $TOKEN"
```

### Make Message Private
```bash
curl -X PATCH http://localhost:8000/api/messages/125/make-private \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Message (Soft Delete)
```bash
curl -X DELETE http://localhost:8000/api/messages/123 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Frontend Quick Start

### Fetch Messages
```javascript
import { messagesAPI } from '../services/api';

const inboxData = await messagesAPI.getInbox();
// Returns: { inbox: [...], public: [...], deleted: [...] }
```

### Update Message Status (Optimistic)
```javascript
// Save old state
const oldMessages = messages;

// Update immediately
setMessages(prev => prev.map(msg => 
  msg.id === 123 ? { ...msg, status: 'public' } : msg
));

try {
  // Send to backend
  await messagesAPI.makeMessagePublic(123);
  // Success - already updated
} catch (error) {
  // Rollback on error
  setMessages(oldMessages);
}
```

### Delete Message
```javascript
await messagesAPI.deleteMessage(123);
```

---

## Database Queries

### View All Messages for User
```sql
SELECT id, content, status, created_at 
FROM message 
WHERE receiver_id = 5
ORDER BY created_at DESC;
```

### View Only Public Messages
```sql
SELECT id, content, created_at 
FROM message 
WHERE receiver_id = 5 AND status = 'public'
ORDER BY created_at DESC;
```

### View Soft-Deleted Messages
```sql
SELECT id, content, created_at 
FROM message 
WHERE receiver_id = 5 AND status = 'deleted'
ORDER BY created_at DESC;
```

### Permanently Delete Old Soft-Deleted Messages
```sql
DELETE FROM message 
WHERE status = 'deleted' 
  AND created_at < datetime('now', '-30 days');
```

---

## Encryption/Decryption

### Generate Encryption Key
```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Set Encryption Key for Docker
```bash
export ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
docker-compose up
```

### Manual Test Encryption
```python
from app.core.security import encrypt_message, decrypt_message

plaintext = "Hello, World!"
encrypted = encrypt_message(plaintext)
print(f"Encrypted: {encrypted}")

decrypted = decrypt_message(encrypted)
print(f"Decrypted: {decrypted}")
```

---

## Authentication

### Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "name": "Alice Smith",
    "secret_phrase": "My favorite color is blue",
    "secret_answer": "blue"
  }'
```

**Response** includes `access_token` - save this!

### Log In
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "secret_answer": "blue"
  }'
```

### Use Token in Requests
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/messages/inbox
```

---

## Common Issues

### Issue: "Message content unavailable"
**Cause**: Encryption key mismatch or corrupted data
**Fix**: 
1. Verify `ENCRYPTION_KEY` env var is set
2. Check key matches when message was created
3. If different key: migrate messages or delete corrupted ones

### Issue: "Not authorized" when accessing messages
**Cause**: `receiver_id` doesn't match current user
**Fix**: Only authenticated user can access their own messages

### Issue: Rate limit exceeded (429)
**Cause**: Too many requests
**Limits**:
- Message send: 5/minute
- User search: 10/minute  
- Follow: 20/hour
**Fix**: Add delays between requests, or contact admin

### Issue: Message not visible after sending
**Possible Causes**:
1. Sender and receiver are same user → try different username
2. Receiver doesn't exist → verify username exists
3. Status not 'inbox' → check message status
4. Frontend cache → refresh page
**Fix**: Check database directly with SQL query above

---

## Performance Tuning

### Add Database Indexes
```sql
CREATE INDEX idx_message_receiver_status 
  ON message(receiver_id, status, created_at);

CREATE INDEX idx_message_created_at 
  ON message(created_at DESC);

CREATE INDEX idx_user_username 
  ON user(username UNIQUE);
```

### Cache Public Messages (Redis)
```python
@cache.cached(timeout=300)  # 5 minutes
async def get_public_messages(user_id: int):
    return db.query(Message).filter(
        Message.receiver_id == user_id,
        Message.status == 'public'
    ).all()
```

### Batch Encrypt Multiple Messages
```python
async def encrypt_messages_batch(contents: List[str]):
    tasks = [encrypt_message_async(c) for c in contents]
    return await asyncio.gather(*tasks)
```

---

## Testing

### Test Sending Message
```python
def test_send_anonymous_message():
    response = client.post("/api/messages/send", json={
        "receiver_username": "alice",
        "content": "Test message"
    })
    assert response.status_code == 201
    assert response.json()["status"] == "inbox"
```

### Test Message Decryption
```python
def test_message_decrypt_on_retrieval():
    # Create message
    msg = Message(receiver_id=1, content=encrypt_message("Secret"), status="inbox")
    db.add(msg)
    db.commit()
    
    # Retrieve and verify decrypted
    response = client.get("/api/messages/", headers={"Authorization": f"Bearer {token}"})
    assert response.json()[0]["content"] == "Secret"
```

### Test Ownership Verification
```python
def test_cannot_access_others_messages():
    # User B tries to access User A's messages
    response = client.get(
        "/api/messages/",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )
    # Should only show User B's messages, not User A's
    assert all(msg["receiver_id"] == user_b_id for msg in response.json())
```

---

## Deployment Checklist

- [ ] Set `ENCRYPTION_KEY` environment variable
- [ ] Set `SECRET_KEY` for JWT signing
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for your domain
- [ ] Test encryption/decryption with production key
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Test soft delete and recovery
- [ ] Verify public profile isolation
- [ ] Run security scan on dependencies
- [ ] Update firewall rules
- [ ] Document deployment process

---

## File Structure

```
saytruth/
├── backend/
│   └── app/
│       ├── api/
│       │   └── routes/
│       │       ├── messages.py        ← Message endpoints
│       │       ├── users.py           ← User/follow endpoints
│       │       ├── auth.py            ← Auth endpoints
│       │       └── links.py           ← Link endpoints
│       ├── models/
│       │   └── models.py              ← DB schema
│       ├── schemas/
│       │   └── schemas.py             ← Pydantic models
│       ├── core/
│       │   ├── security.py            ← Encryption functions
│       │   ├── config.py              ← Settings
│       │   └── dependencies.py        ← JWT, DB setup
│       └── main.py                    ← FastAPI app setup
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── MessagesTab.jsx        ← Inbox UI
│       │   ├── SearchTab.jsx          ← User search
│       │   ├── UserProfilePage.jsx    ← Public profile
│       │   └── ProfilePage.jsx        ← Own profile
│       ├── services/
│       │   └── api.js                 ← API client
│       └── App.jsx                    ← Main app
├── INBOX_SECURITY_VALIDATION.md       ← Security audit
├── INBOX_IMPLEMENTATION_GUIDE.md      ← Full guide
└── README.md                          ← Project overview
```

---

## Key Files Reference

| File | Purpose | Key Functions |
|------|---------|---------------|
| `messages.py` | Message endpoints | send, get, make_public, make_private, delete |
| `security.py` | Encryption/JWT | encrypt_message, decrypt_message, hash_password |
| `models.py` | Database schema | User, Message, Follow, Link |
| `MessagesTab.jsx` | Inbox UI | Load messages, optimistic updates, state transitions |
| `api.js` | API client | messagesAPI.*, userAPI.*, authAPI.* |

---

## Rate Limits

```
POST /api/messages/send          → 5 per minute
GET  /api/users/search           → 10 per minute
POST /api/users/follow/{user_id} → 20 per hour
POST /api/auth/signup            → No limit (add: 5 per 24h per IP)
POST /api/auth/login             → No limit (add: 5 failed per 15m)
```

---

## Security Policies

**Anonymous Guarantee**: No `sender_id`, no IP logging, no user agent tracking

**Encryption**: Fernet symmetric at rest, decrypted on authorized read

**Access Control**: 
- Public endpoints: `/messages/send`, `/users/{id}` (profile only)
- Protected endpoints: All `/api/messages/`, `/api/users/follow/*`

**Soft Delete**: Status change, not hard delete, allows recovery

**Ownership**: Only `receiver_id == current_user.id` can modify messages

---

**Version**: 1.0 | **Updated**: 2024 | **Status**: ✅ Production Ready

