# Routing and Follow System Architecture - Complete Implementation

## Summary of Changes

This document outlines the comprehensive fixes to the routing architecture and follow system to properly separate personal profiles from public user profiles, and ensure consistent follow state across the application.

---

## 1. ROUTING ARCHITECTURE CHANGES

### Before (Broken)
- `/profile/{username}` - Could be either personal or public profile (confusing mix)
- `/user/{username}` - Old route trying to show user profiles
- HomeTab navigated to `/profile/{username}` (string-based)
- SearchTab navigated to `/profile/{username}` (string-based)
- No distinction between personal profile view and public profile view

### After (Fixed)
```
Route Structure:
├── /profile/me          → Personal profile (logged-in user only)
├── /profile/{userId}    → Public user profile (anyone can view)
├── /profile/guest       → Guest profile (handled as /profile/guest user_id)
└── Removed: /user/:username (old route)
```

**Key Routing Rules:**
1. **Personal Profile (`/profile/me`)**
   - Only accessible when `isAuthenticated === true`
   - Shows logged-in user's own profile
   - Rendered by `MyProfileRouteWrapper` → `ProfilePage`
   - If accessed while not authenticated: redirects to `/profile/guest`

2. **Public User Profile (`/profile/:userId`)**
   - Accessible to everyone (authenticated or guest)
   - Shows any user's public profile by their `user_id`
   - If logged-in user tries to access own profile: redirects to `/profile/me`
   - Rendered by `ProfileRouteWrapper` → `UserProfilePage`

3. **Guest Profile (`/profile/guest`)**
   - Special case: `userId="guest"`
   - Handled by public profile route
   - Backend returns basic guest profile data

---

## 2. FILE CHANGES MADE

### Frontend Files Modified:

#### **App.jsx** - Routing Infrastructure
**Changes:**
- Removed `UserProfileRouteWrapper` function (old implementation)
- Removed `/user/:username` route (deprecated)
- Added `MyProfileRouteWrapper` function for `/profile/me`
- Updated `ProfileRouteWrapper` to use `userId` from params instead of `username`
- Changed `ProfileRouteWrapper` to redirect to `/profile/me` if accessing own profile
- Updated all route definitions to use new structure
- Fixed `handleTabChange` to navigate to `/profile/me` not `/profile/{username}`
- Fixed Header navigation to use `/profile/me` or `/profile/guest`

**Key Functions:**
```javascript
// New: For personal profile
const MyProfileRouteWrapper = ({ isAuthenticated, currentUser }) => {
  if (!isAuthenticated) {
    return <Navigate to="/profile/guest" replace />;
  }
  return <ProfilePage ... />;
};

// Updated: For public profiles
const ProfileRouteWrapper = ({ isAuthenticated, currentUser }) => {
  const { userId } = useParams();
  if (isAuthenticated && currentUser && userId === currentUser.id.toString()) {
    return <Navigate to="/profile/me" replace />;
  }
  return <UserProfilePage userId={userId} ... />;
};
```

#### **Header.jsx** - Profile Navigation
**Changes:**
- Removed `targetUsername` variable
- Updated `handleProfileClick()` to navigate to `/profile/me` (authenticated) or `/profile/guest` (guest)
- Changed from string-based navigation to role-based navigation

#### **HomeTab.jsx** - Following Feed Navigation
**Changes:**
- Already correctly implemented: navigates to `/profile/${userId}` for user cards
- Proper type handling: uses numeric `userId` instead of string `username`

#### **SearchTab.jsx** - Search Results Navigation
**Changes:**
- Already correctly implemented: navigates to `/profile/${user.id}` for search results
- Properly fetches follow status via `checkFollowStatus(user.id)` for each result

#### **UserProfilePage.jsx** - Public Profile Component
**Changes:**
- Changed component props from `username` to `userId`
- Updated `useEffect` dependency: `[userId]` instead of `[username, selectedUser?.id]`
- Simplified `loadProfile()` to use `userAPI.getUserProfile(userId)` directly
- Removed fallback logic for `selectedUser`
- Kept follow status checking: calls `checkFollowStatus(userId)` separately

**Key Changes:**
```javascript
// Before:
const UserProfilePage = ({ username, selectedUser, isAuthenticated, ... }) => {
  useEffect(() => loadProfile(); }, [username, selectedUser?.id]);
  
  if (username) {
    data = await userAPI.getUserByUsername(username);
  } else if (selectedUser?.id) {
    data = await userAPI.getUserProfile(selectedUser.id);
  }
}

// After:
const UserProfilePage = ({ userId, isAuthenticated, ... }) => {
  useEffect(() => { if (userId) loadProfile(); }, [userId]);
  
  const data = await userAPI.getUserProfile(userId);
}
```

---

## 3. FOLLOW SYSTEM CONSISTENCY IMPROVEMENTS

### Backend Endpoints (Already Implemented)
- `GET /api/users/{user_id}/follow-status` - Check if logged-in user follows this user
- `GET /api/users/me/following` - Get list of users the logged-in user follows
- `POST /api/users/follow/{user_id}` - Follow a user (returns 400 if already following)
- `DELETE /api/users/unfollow/{user_id}` - Unfollow a user

### Frontend Follow State Flow

**SearchTab - Check Before Action:**
```
1. User searches for someone
2. For each result, call: checkFollowStatus(user.id)
3. Set result.isFriend = statusData.is_following
4. Render "Follow" or "Following" button based on isFriend
5. On follow/unfollow click: update state and UI immediately
```

**HomeTab - Show Verified Following:**
```
1. Load following list: getMyFollowing()
2. For each following user, get profile: getUserProfile(userId)
3. Display cards with enriched profile data
4. Click card: navigate to `/profile/{userId}`
```

**UserProfilePage - Check Every Load:**
```
1. Load profile: getUserProfile(userId)
2. Separately check follow status: checkFollowStatus(userId)
3. Store in isFollowing state
4. On follow/unfollow: update state, then API call
5. If error: roll back based on error message or re-fetch status
```

### Key Principle: Never Assume Follow State
- **ALWAYS** fetch follow status from backend via `checkFollowStatus()`
- **NEVER** trust cached state from previous page
- **ALWAYS** check status BEFORE rendering follow/unfollow buttons
- **ALWAYS** update UI immediately on user action (optimistic update)

---

## 4. NAVIGATION CONSISTENCY

### All User Cards Must Navigate With user_id:
✅ SearchTab: `navigate('/profile/${user.id}')`
✅ HomeTab: `navigate('/profile/${userId}')`
✅ Header profile button: `navigate('/profile/me')` or `navigate('/profile/guest')`

### All User Profile Loads Must Use user_id:
✅ ProfileRouteWrapper: `userId` from params
✅ UserProfilePage: `userId` prop
✅ getMyFollowing: returns list with user ids
✅ UserFollowingCard: passes userId to parent handler

---

## 5. VERIFICATION CHECKLIST

- [x] `/profile/me` route exists and shows personal profile
- [x] `/profile/:userId` route exists and shows public profile
- [x] `/profile/me` redirects unauthenticated users to `/profile/guest`
- [x] Own profile accessed via `:userId` redirects to `/profile/me`
- [x] Removed old `/user/:username` route
- [x] Removed old `UserProfileRouteWrapper` function
- [x] All navigation uses user_id (numeric) instead of username (string)
- [x] SearchTab navigates with user.id
- [x] HomeTab navigates with userId
- [x] Header navigates with `/profile/me` or `/profile/guest`
- [x] UserProfilePage accepts userId prop
- [x] Follow status checked via checkFollowStatus() everywhere
- [x] Follow buttons show correct state before user action
- [x] Guest users can view profiles without login
- [x] Follow/Unfollow updates UI immediately

---

## 6. USER FLOWS AFTER FIX

### Logged-in User Following Feed
```
1. Open HomeTab
2. fetchFollowingUsers() calls getMyFollowing()
3. For each user, get their profile with getUserProfile()
4. Display UserFollowingCard components
5. Click card → navigate to /profile/{userId}
6. UserProfilePage loads profile
7. Separately calls checkFollowStatus(userId)
8. Shows follow state based on is_following
9. Can follow/unfollow with immediate UI update
```

### Search and Follow
```
1. Open SearchTab
2. Search for username
3. For each result, check follow status via checkFollowStatus()
4. Render Follow/Following button
5. Click Follow → call followUser(id) → update state
6. Click user card → navigate to /profile/{user.id}
7. UserProfilePage shows profile with correct follow state
```

### Guest Viewing Profile
```
1. Click user card in SearchTab
2. Navigate to /profile/{userId}
3. UserProfilePage loads profile
4. checkFollowStatus() returns {is_following: false}
5. Show "Follow" button (or "Login to follow" variant)
6. Click follow → redirect to login
```

### Personal Profile Access
```
1. Click profile in bottom nav
2. If authenticated: /profile/me → MyProfileRouteWrapper → ProfilePage
3. If guest: /profile/guest → ProfileRouteWrapper → UserProfilePage
4. ProfilePage shows personal profile (no follow buttons)
5. UserProfilePage shows guest profile (can't follow self)
```

---

## 7. TESTING SCENARIOS

### Critical Tests:
1. **Follow State Consistency**
   - Search for user → follow → search again → should show "Following"
   - Search for user → follow → go to their profile → should show "Following"
   - Go to profile → follow → back to search → should show "Following"

2. **Personal Profile Protection**
   - Try to access own profile via user_id route → redirect to /profile/me
   - Click own profile in search → navigate to /profile/{own_id} → redirect to /profile/me

3. **Guest Access**
   - Guest can view profiles
   - Guest can see follow buttons
   - Guest clicking follow → redirect to login
   - Can't access /profile/me as guest → redirect to /profile/guest

4. **Navigation**
   - All cards navigate with numeric ID
   - All routes use user_id in params
   - No string-based username routing

---

## 8. DEPLOYMENT

**Rebuild Command:**
```bash
cd /mnt/lv1/work/saytruth
docker compose down
docker compose up --build -d
```

**Files Changed:**
- Frontend: App.jsx, Header.jsx, UserProfilePage.jsx
- Backend: No changes (already complete from previous session)

**New Routes:**
- `/profile/me` - Personal profile
- `/profile/guest` - Guest profile  
- `/profile/:userId` - Public user profile

**Removed Routes:**
- `/user/:username` - Deprecated
- Old `/profile/{username}` mixed logic

---

## 9. ARCHITECTURE BENEFITS

✅ **Clear Separation** - Personal vs Public profiles completely separated
✅ **Type Safety** - user_id is numeric, not string (better for API calls)
✅ **Consistency** - Follow state fetched fresh every time, no stale data
✅ **Guest Support** - Guests can browse profiles without login
✅ **Self-Protection** - Can't accidentally mix personal profile with public profile view
✅ **Scalability** - Numeric IDs better for large user bases
✅ **Security** - Username not exposed in routes, API uses IDs

---

## 10. NEXT PHASE (If Needed)

- Add follow button to personal profile for following others
- Implement mutual follow detection (A follows B, B follows A)
- Add follower count display
- Add "followers" page showing who follows you
- Implement follow notifications
