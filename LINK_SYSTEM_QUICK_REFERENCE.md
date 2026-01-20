# Temporary Anonymous Links - Quick Reference

## What It Does
Users can create temporary links to receive anonymous messages. Links expire after 6h, 12h, 24h, 7d, 30d, or remain permanent (logged-in only). All messages auto-encrypt and auto-delete on expiration.

## Quick Links
- 🏠 **Home Tab** - Create and manage links
- 📨 **Public Link** - `/link/{publicId}` - Send messages (no login)
- 📥 **Private Link** - `/link/private/{privateId}` - View messages (no login)

## User Journey

### 1. Create Link (HomeTab)
```
User → HomeTab → Enter display_name (optional)
             ↓
         Select expiration (6h/12h/24h/7d/30d/permanent*)
             ↓
         Click "Generate"
             ↓
         Get public_id + private_id + countdown timer
```
*Permanent only for logged-in users

### 2. Share Link
```
User A → Copy public_id → Share with User B
         (countdown shows time remaining)
```

### 3. Send Message (PublicLinkPage)
```
User B → Open /link/{publicId}
            ↓
      Enter message (max 5000 chars)
            ↓
      Click "Send Message"
            ↓
      Message encrypted + stored
            ↓
      Success feedback
```

### 4. Receive & Manage (PrivateLinkPage)
```
User A → Open /link/private/{privateId}
              ↓
         See messages in 3 tabs:
         • Inbox (private, new)
         • Public (shared)
         • Deleted (removed)
              ↓
         Per message: ⭐ Make Public | 🔒 Make Private | 🗑️ Delete
              ↓
         Countdown shows expiration time
```

## API Endpoints

| Method | Endpoint | Auth | Rate Limit | Purpose |
|--------|----------|------|-----------|---------|
| POST | `/api/links/create` | No | 20/hr | Create link |
| GET | `/api/links/{publicId}/info` | No | - | Get link metadata |
| POST | `/api/links/{publicId}/send` | No | 10/min | Send message |
| GET | `/api/links/{privateId}/messages` | Token | - | Get messages |
| PATCH | `/api/links/{privateId}/messages/{id}/make-public` | Token | - | Share message |
| PATCH | `/api/links/{privateId}/messages/{id}/make-private` | Token | - | Unshare message |
| DELETE | `/api/links/{privateId}/messages/{id}` | Token | - | Delete message |

## Database

**links** - Stores link metadata
- `public_id` - Shareable ID (UUID)
- `private_id` - Access token (UUID)
- `user_id` - NULL for guests, user ID for logged-in
- `display_name` - Optional user-provided name
- `expires_at` - Expiration time (NULL for permanent)
- `status` - active/expired/deleted

**link_messages** - Stores encrypted messages
- `link_id` - Link ownership
- `content` - Encrypted message
- `status` - inbox/public/deleted

## Security Features

✅ **Encryption** - Fernet symmetric (messages encrypted at rest)
✅ **UUID IDs** - Unguessable, 2^128 combinations
✅ **Anonymous** - No sender tracking, no metadata
✅ **Rate Limiting** - 20/hr create, 10/min send
✅ **Auto-Delete** - All messages purged on expiration
✅ **Access Control** - private_id acts as token

## Multi-Language
- EN (English) - LTR
- AR (العربية) - RTL
- ES (Español) - LTR

## Frontend Components

### HomeTab
- Form to generate links
- Display public_id + private_id
- Copy buttons
- Countdown timer (updates every 1s)
- Error handling

### PublicLinkPage
- Display link info
- Message textarea (5000 char limit)
- Send button
- Success feedback
- Rate limit handling

### PrivateLinkPage
- Three tabs: Inbox | Public | Deleted
- Message list with timestamps
- Action buttons per message
- Countdown until expiration
- Optimistic updates

## Expiration Timeline

| Time | Status | Access | Messages |
|------|--------|--------|----------|
| Created | active | ✅ Yes | Encrypted |
| 1h before expiry | active | ✅ Yes | Accessible |
| At expiry | expired | ❌ 410 Gone | Auto-deleted |
| After expiry | expired | ❌ 410 Gone | Gone |

## Common Scenarios

### Guest sends anonymous message to link
1. Receives `/link/{publicId}` link
2. Opens URL (no login needed)
3. Types message
4. Clicks "Send"
5. Message encrypted and stored
6. Link creator sees in PrivateLinkPage

### Logged-in user creates permanent link
1. Goes to HomeTab
2. Enters display_name: "Product Feedback"
3. Selects "permanent" (option appears for logged-in users)
4. Clicks Generate
5. Link never expires (countdown shows ∞)
6. Can keep indefinitely

### Link expires during use
1. User creates 6h link
2. 6 hours pass
3. Tries to access private link
4. Gets error: "This link has expired"
5. All messages auto-deleted
6. Cannot recover

### Rate limit hit
1. User tries to send 11 messages in 1 minute
2. 11th attempt returns 429 Too Many Requests
3. Wait 1 minute for counter reset
4. Can send again

## Troubleshooting

### "Permanent links are only for logged-in users"
→ Guest user cannot create permanent links. Must select 6h-30d.

### "This link has expired"
→ Link's expiration time has passed. Create a new link.

### "Failed to send message" after several sends
→ Hit rate limit (10/min). Wait 1 minute and retry.

### "Link not found"
→ public_id doesn't exist or has been deleted.

### Messages don't appear after sending
→ Check if sent to correct public_id
→ Verify link not expired
→ Try refresh page

## Development Notes

### Encryption
- Uses Fernet cipher (cryptography library)
- Key from environment: `FERNET_KEY`
- Messages encrypted before storage
- Decrypted on retrieval (private_id access only)

### Cleanup Logic
- `cleanup_expired_links()` runs on every API access
- Marks links status="expired" if past expiration
- Cascade delete: All messages deleted with link

### Rate Limiting
- slowapi library with in-memory cache
- Limits keyed by IP address
- 20/hour for link creation
- 10/minute for message sending

### Countdown Timer
- Updates every 1 second in frontend
- Calls formatTimeRemaining() to calculate
- Shows: "X days", "X hours", "X minutes", "X seconds"
- Auto-expires when countdown reaches 0

## Files Reference

| File | Purpose |
|------|---------|
| `models.py` | Link, LinkMessage models |
| `schemas.py` | LinkCreate, LinkResponse schemas |
| `links.py` | 8 API endpoints + cleanup |
| `HomeTab.jsx` | Link generation UI |
| `PublicLinkPage.jsx` | Message sending UI |
| `PrivateLinkPage.jsx` | Message viewing UI |
| `api.js` | 7 API methods |
| `App.jsx` | Routing integration |

---
**Status:** ✅ Complete & Ready for QA
