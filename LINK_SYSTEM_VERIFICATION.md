# Temporary Anonymous Links System - Verification Checklist

## Overview
This document provides a comprehensive verification checklist for the Temporary Anonymous Links system implementation, ensuring all security, functionality, and UX requirements are met.

## Database Schema Verification

### Link Model
- [ ] `public_id` field is UUID type, unique indexed
- [ ] `private_id` field is UUID type, unique indexed
- [ ] `user_id` field is nullable FK to User table (for guest support)
- [ ] `display_name` field is optional string
- [ ] `expires_at` field is datetime, indexed
- [ ] `status` field uses LinkStatus enum (active, expired, deleted)
- [ ] `created_at` field records creation timestamp
- [ ] Database indices created on `public_id`, `private_id`, `expires_at`

### LinkMessage Model
- [ ] `link_id` field is FK to Link with CASCADE DELETE
- [ ] `content` field stores Fernet-encrypted message text
- [ ] `status` field uses LinkMessageStatus enum (inbox, public, deleted)
- [ ] `created_at` field records creation timestamp
- [ ] No `sender_id` field exists (anonymous messages)
- [ ] Messages automatically cleaned up when link deleted

### Schema Consistency
- [ ] MessageStatusUpdate pattern changed from "favorite" to "deleted"
- [ ] LinkCreate schema accepts `display_name` and `expiration_option`
- [ ] LinkResponse includes all required fields
- [ ] LinkMessageResponse includes id, content, status, created_at

## Backend Endpoints Verification

### POST /api/links/create
- [ ] Creates link with unique UUID-based IDs
- [ ] Accepts optional `display_name`
- [ ] Accepts `expiration_option` (6h, 12h, 24h, 7d, 30d, permanent)
- [ ] Permanent option restricted to authenticated users
- [ ] Returns both `public_id` and `private_id` in response
- [ ] Rate limited to 20/hour
- [ ] Sets `expires_at` correctly (null for permanent, now+hours otherwise)
- [ ] Sets initial status to "active"

### GET /api/links/{public_id}/info
- [ ] Accessible without authentication
- [ ] Returns `public_id`, `display_name`, `expires_at`, `status`
- [ ] Calls `cleanup_expired_links()` to mark expired links as deleted
- [ ] Returns 404 if public_id not found
- [ ] Returns 410 Gone if link status is "expired" or "deleted"

### POST /api/links/{public_id}/send
- [ ] Accessible without authentication
- [ ] Rate limited to 10/minute
- [ ] Accepts `content` field (1-5000 chars)
- [ ] Encrypts content with Fernet before storage
- [ ] Returns 404 if public_id not found
- [ ] Returns 410 Gone if link expired
- [ ] Creates message with status "inbox" (private by default)
- [ ] No sender information stored

### GET /api/links/{private_id}/messages
- [ ] `private_id` acts as authentication token (UUID verification)
- [ ] Returns all messages for that link
- [ ] Decrypts messages before returning
- [ ] Includes message status and timestamps
- [ ] Returns 404 if private_id not found
- [ ] Returns 410 Gone if link expired
- [ ] Calls `cleanup_expired_links()` on access

### PATCH /api/links/{private_id}/messages/{id}/make-public
- [ ] Verifies message belongs to link
- [ ] Changes message status to "public"
- [ ] Returns updated message with new status
- [ ] Returns 404 if message or link not found

### PATCH /api/links/{private_id}/messages/{id}/make-private
- [ ] Verifies message belongs to link
- [ ] Changes message status to "inbox"
- [ ] Returns updated message with new status
- [ ] Returns 404 if message or link not found

### DELETE /api/links/{private_id}/messages/{id}
- [ ] Verifies message belongs to link
- [ ] Soft deletes (status → "deleted")
- [ ] Returns 204 No Content on success
- [ ] Messages marked deleted can be restored via make-private

## Expiration & Cleanup Verification

### cleanup_expired_links() Function
- [ ] Marks links with `expires_at < now()` as "expired"
- [ ] Only updates links with status "active"
- [ ] Called on every access (GET info, GET messages, POST send)
- [ ] Does not throw errors on database issues

### Expiration Timing
- [ ] 6h option: expires after 6 hours
- [ ] 12h option: expires after 12 hours
- [ ] 24h option: expires after 24 hours
- [ ] 7d option: expires after 7 days
- [ ] 30d option: expires after 30 days
- [ ] permanent option: expires_at set to NULL
- [ ] Countdown timer in UI matches backend (within 1 second)

### Auto-Delete Strategy
- [ ] Soft delete: Links/messages marked with status "deleted"
- [ ] No hard delete on access (not implemented in MVP)
- [ ] Future: Background job for hard delete after 24h soft delete
- [ ] Cascade delete: When link deleted, all messages cascade deleted

## Security Verification

### Encryption
- [ ] Messages encrypted with Fernet cipher
- [ ] Encryption key retrieved from environment (FERNET_KEY)
- [ ] Decryption only occurs when returning to link owner
- [ ] Encrypted content stored as string in database

### ID Generation
- [ ] `public_id` uses UUID4 (unguessable)
- [ ] `private_id` uses UUID4 (unguessable)
- [ ] Both IDs are unique across all links
- [ ] IDs cannot be predicted or brute-forced

### Anonymous Messages
- [ ] No `sender_id` field on LinkMessage model
- [ ] No sender IP or metadata stored
- [ ] No link between message and any user account
- [ ] Public messages do not expose creator

### Rate Limiting
- [ ] POST /create limited to 20/hour per client
- [ ] POST /send limited to 10/minute per client
- [ ] Rate limit errors return 429 status code
- [ ] Limit resets correctly after time window

### Access Control
- [ ] GET info requires no authentication
- [ ] POST send requires no authentication
- [ ] GET messages requires private_id (acts as token)
- [ ] PATCH/DELETE operations require private_id
- [ ] Private_id cannot be used to create new links

## Frontend Components Verification

### HomeTab Component
- [ ] Displays link generation form
- [ ] Input field for optional `display_name`
- [ ] Select dropdown for `expiration_option` (6h, 12h, 24h, 7d, 30d)
- [ ] "Permanent" option only visible to logged-in users
- [ ] Generate button calls `linksAPI.createLink()`
- [ ] Loading state shown during creation
- [ ] Error handling for failures
- [ ] Success state shows both public and private links
- [ ] Copy-to-clipboard button for each link
- [ ] Countdown timer updates every 1 second
- [ ] Countdown shows: "X days", "X hours", "X minutes", "X seconds"
- [ ] Auto-expires when countdown reaches 0
- [ ] Multi-language support (EN, AR, ES)
- [ ] RTL support for Arabic

### PublicLinkPage Component
- [ ] Displays link information (display_name if provided)
- [ ] Shows message textarea (placeholder text)
- [ ] Character counter (max 5000)
- [ ] Send button calls `linksAPI.sendLinkMessage()`
- [ ] Loading state during send
- [ ] Success feedback ("Message sent!")
- [ ] Error handling with retry option
- [ ] Rate limit error handling (429 response)
- [ ] Multi-language support (EN, AR, ES)
- [ ] Accessible without authentication

### PrivateLinkPage Component
- [ ] Displays "Your Anonymous Messages" section
- [ ] Shows countdown timer until expiration
- [ ] Tab interface: Inbox, Public, Deleted
- [ ] Message count badges on tabs
- [ ] Displays decrypted messages
- [ ] Timestamp for each message ("X minutes ago" format)
- [ ] Action buttons per message:
  - [ ] Make Public (⭐ icon) - changes status to "public"
  - [ ] Make Private (🔒 icon) - changes status to "inbox"
  - [ ] Delete (🗑️ icon) - soft deletes message
- [ ] Restore button (↩️ icon) on deleted messages
- [ ] Optimistic UI updates (instant feedback)
- [ ] Multi-language support (EN, AR, ES)
- [ ] RTL support for Arabic

### App.jsx Integration
- [ ] HomeTab rendered in home tab
- [ ] URL parsing for `/link/{publicId}` (PublicLinkPage)
- [ ] URL parsing for `/link/private/{privateId}` (PrivateLinkPage)
- [ ] Back button to return to home
- [ ] Link page state management (linkPageType, linkId)
- [ ] Language prop passed to all components

## API Service Layer Verification

### linksAPI.createLink(displayName, expirationOption)
- [ ] POST /api/links/create with correct payload
- [ ] Returns object with public_id, private_id, expires_at
- [ ] Handles errors (400, 429, 500)
- [ ] skipAuth: true for guest users

### linksAPI.getLinkInfo(publicId)
- [ ] GET /api/links/{publicId}/info
- [ ] Returns public link metadata
- [ ] Handles 404 (not found)
- [ ] Handles 410 (expired)

### linksAPI.sendLinkMessage(publicId, content)
- [ ] POST /api/links/{publicId}/send with content
- [ ] Returns success response
- [ ] Handles 404 (link not found)
- [ ] Handles 410 (link expired)
- [ ] Handles 429 (rate limited)
- [ ] skipAuth: true for anonymous send

### linksAPI.getLinkMessages(privateId)
- [ ] GET /api/links/{privateId}/messages
- [ ] Returns array of messages
- [ ] Messages include id, content, status, created_at
- [ ] Handles 404 (link not found)
- [ ] Handles 410 (link expired)

### linksAPI.makeLinkMessagePublic(privateId, messageId)
- [ ] PATCH /api/links/{privateId}/messages/{id}/make-public
- [ ] Returns updated message with status "public"

### linksAPI.makeLinkMessagePrivate(privateId, messageId)
- [ ] PATCH /api/links/{privateId}/messages/{id}/make-private
- [ ] Returns updated message with status "inbox"

### linksAPI.deleteLinkMessage(privateId, messageId)
- [ ] DELETE /api/links/{privateId}/messages/{id}
- [ ] Returns 204 No Content
- [ ] Message status changed to "deleted"

## User Experience Verification

### Link Generation Flow
- [ ] User navigates to home tab
- [ ] Form displays with empty display_name
- [ ] User selects expiration option (default 24h)
- [ ] User clicks "Generate"
- [ ] Success: Two links displayed with countdown timer
- [ ] User can copy links to clipboard
- [ ] Success feedback shown for 2 seconds

### Public Link Flow
- [ ] User receives/shares public link
- [ ] Opens `/link/{publicId}` without authentication
- [ ] Displays message textarea
- [ ] User types message
- [ ] Clicks "Send Message"
- [ ] Success feedback shown
- [ ] User can send additional messages

### Private Link Flow
- [ ] User opens `/link/private/{privateId}`
- [ ] Private link acts as access token (no login required)
- [ ] Messages display in three tabs (Inbox, Public, Deleted)
- [ ] User can manage messages (make public, delete, restore)
- [ ] Countdown timer shows time remaining
- [ ] When expired: Error message, cannot access

### Expiration Flow
- [ ] User generates link with 24h expiration
- [ ] Countdown shows decreasing time
- [ ] After 24 hours: Link becomes inaccessible
- [ ] Both public and private links return 410 Gone
- [ ] User cannot send new messages to expired link

## Multi-Language Support Verification

### English (EN)
- [ ] All UI text displays correctly in English
- [ ] RTL not applied

### Arabic (AR)
- [ ] All UI text displays correctly in Arabic
- [ ] RTL layout applied (right-to-left)
- [ ] Text alignment correct
- [ ] Numbers formatted correctly

### Spanish (ES)
- [ ] All UI text displays correctly in Spanish
- [ ] RTL not applied (LTR layout)

## Integration Testing Scenarios

### Scenario 1: Create and Share Link
1. [ ] User creates link with display_name "Alice"
2. [ ] Expiration set to 24h
3. [ ] Copy public_id and share with friend
4. [ ] Friend sends message via PublicLinkPage
5. [ ] User views message in PrivateLinkPage (Inbox tab)
6. [ ] User makes message public (moves to Public tab)
7. [ ] Message visible in Public tab, original removed from Inbox

### Scenario 2: Expired Link
1. [ ] Create link with 1-hour expiration
2. [ ] Wait 1 hour or manually set time
3. [ ] Attempt to access public link
4. [ ] Receive 410 Gone error
5. [ ] Attempt to access private link
6. [ ] Receive 410 Gone error
7. [ ] Verify database marked link as "expired"

### Scenario 3: Guest User Permanent Link
1. [ ] Unauthenticated user opens HomeTab
2. [ ] "Permanent" option disabled/hidden
3. [ ] User cannot select permanent expiration
4. [ ] Can create 24h or shorter expiration links

### Scenario 4: Rate Limiting
1. [ ] Create link
2. [ ] Send 10 messages in 1 minute
3. [ ] 11th message attempt returns 429
4. [ ] After 1 minute: Can send again

### Scenario 5: Message Encryption
1. [ ] Send message via public link
2. [ ] Query database directly
3. [ ] Verify message is encrypted (cannot read plaintext)
4. [ ] Retrieve via API: Message decrypts correctly

## Performance Verification

### Response Times
- [ ] POST /create < 500ms
- [ ] GET info < 200ms
- [ ] POST send < 500ms (includes encryption)
- [ ] GET messages < 300ms (includes decryption)

### Database Performance
- [ ] Queries use indices on public_id, private_id, expires_at
- [ ] No N+1 queries for message retrieval
- [ ] Cleanup function efficient (batch update, not loop)

### Frontend Performance
- [ ] Countdown timer doesn't cause re-renders
- [ ] Message list handles 100+ messages smoothly
- [ ] Copy button doesn't cause full component refresh

## Deployment Verification

### Environment Setup
- [ ] FERNET_KEY configured in backend environment
- [ ] FERNET_KEY value is strong (base64 encoded)
- [ ] Database migrations applied (Link, LinkMessage tables created)
- [ ] Indices created on public_id, private_id, expires_at

### Rollout Steps
1. [ ] Deploy database migrations
2. [ ] Deploy backend code
3. [ ] Deploy frontend code
4. [ ] Verify endpoints accessible
5. [ ] Test link creation end-to-end
6. [ ] Monitor error rates (should be 0 for new system)

## Documentation & Handoff

- [ ] README updated with link system documentation
- [ ] API documentation includes all 8 endpoints
- [ ] Database schema documented
- [ ] Security considerations documented
- [ ] Limitations documented (hard delete TODO, etc.)
- [ ] Future improvements documented

## Known Limitations & TODOs

- [ ] Background job for hard delete not implemented (marked for future)
- [ ] No email notifications for received messages
- [ ] No message previews in email (would require email store)
- [ ] No link analytics (who accessed, when)
- [ ] No admin tools to view/manage links
- [ ] Private link recovery not possible (design choice)

## Verification Sign-Off

**Date Verified:** _______________
**Verified By:** _______________
**All Checks Passed:** ☐ Yes ☐ No

**Notes:**
_________________________________________________________________

**Issues Found:**
_________________________________________________________________

**Resolution:**
_________________________________________________________________
