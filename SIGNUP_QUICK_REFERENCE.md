# Sign Up Page - Quick Reference Guide

## Key Features

### 1. Username Validation
- **Pattern**: Instagram-style (letters, numbers, underscores)
- **Length**: 3-50 characters
- **Errors**: 4 specific error messages (no spaces, invalid chars, min length, required)
- **Where**: Frontend validation + Backend Pydantic validator + Route handler

### 2. Secret Answer
- **Fields**: Confirm answer must match original
- **Visibility**: Eye icon toggle (👁️ / 👁️‍🗨️)
- **Storage**: Hashed with bcrypt on backend
- **Tooltip**: Explains recovery purpose

### 3. Form Validation
```javascript
// Frontend validation order:
1. Username validation (validateUsername)
2. Secret phrase required
3. Secret answer validation (validateSecretAnswer)
4. Answers must match
5. Terms must be accepted

// If any fail: Show field errors + generic error banner
```

### 4. Translations
All error messages translate to: EN, AR (with RTL), ES
```
- usernameRequired
- usernameMinLength
- usernameNoSpaces
- usernameInvalidChars
- secretPhraseRequired
- secretAnswerRequired
- secretAnswerMismatch
- termsRequired
```

---

## Navigation

### Success Flow
```
Valid form data → Backend validation → Create user 
→ Generate token → Redirect to /links (800ms delay)
```

### Error Handling
```
Username exists → Show in field + banner
Invalid regex → Backend HTTP 400 → Show error
Validation fails → Show field-specific errors
```

### Links
- Already have account? → /login
- Back to home → /home

---

## File Locations

### Updated Files
1. `/frontend/src/components/SignupPageNew.jsx` - Main component
2. `/frontend/src/components/AuthPages.css` - Field error + toggle styling
3. `/frontend/src/i18n/translations.js` - 12 new keys (EN/AR/ES)
4. `/backend/app/schemas/schemas.py` - Pydantic validator
5. `/backend/app/api/routes/auth.py` - Signup endpoint with comments

### No Changes
- Database schema (existing User model works)
- Login flow
- Recovery flow

---

## CSS Classes

### New Classes
```css
.field-error - Red error text below input
.input-field.error - Red border + background on invalid input
.input-with-toggle - Wrapper for password + eye icon
.toggle-visibility - Eye icon button
.field-tooltip - Gray italic helper text
```

### RTL Support
```css
.auth-page.rtl - Handles all RTL layout
.input-with-toggle in RTL - Eye icon moves to left
.toggle-visibility in RTL - Right: auto, Left: 12px
```

---

## Example Usage

### Valid Signup
```
Username: john_doe_2024
Display Name: John Doe (optional)
Secret Phrase: What is your pet's name?
Secret Answer: Fluffy
Confirm Answer: Fluffy
→ Account created, redirected to /links
```

### Invalid Cases
```
Username: "john doe" → Error: "cannot contain spaces"
Username: "john" → OK (meets 3-char minimum)
Username: "john@" → Error: "only letters, numbers, underscores"
Secret Answer mismatch → Error: "does not match"
Duplicate username → Error: "already registered"
```

---

## Frontend State Management

```javascript
const [username, setUsername] = useState('');
const [secretAnswer, setSecretAnswer] = useState('');
const [secretAnswerConfirm, setSecretAnswerConfirm] = useState('');
const [showSecretAnswer, setShowSecretAnswer] = useState(false);
const [showSecretAnswerConfirm, setShowSecretAnswerConfirm] = useState(false);
const [fieldErrors, setFieldErrors] = useState({});
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

---

## Backend Validation

### UserSignup Schema
```python
class UserSignup(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    name: Optional[str] = Field(None, max_length=100)
    secret_phrase: str = Field(..., min_length=6)
    secret_answer: str = Field(..., min_length=3)
    
    @field_validator('username')
    def validate_username(cls, v):
        # Checks: not empty, no spaces, Instagram-style
```

### Signup Endpoint
```python
@router.post("/signup")
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    # 1. Backend regex validation
    # 2. Check username uniqueness
    # 3. Hash secret answer
    # 4. Create user
    # 5. Return token
```

---

## Testing Tips

### Test Invalid Usernames
```
" " (space) - Error
"john doe" - Error (has space)
"john@2024" - Error (has @)
"john-2024" - Error (has -)
"joh" - OK (meets minimum)
"john_2024" - OK (valid)
"john_2024_xyz" - OK (valid)
```

### Test Answer Mismatch
```
Field 1: "password123"
Field 2: "password124"
→ Error: "does not match"
```

### Test Language Switching
- Click EN/AR/ES buttons
- All error messages change language
- Arabic activates RTL layout
- Toggle button position updates

### Check Backend Hashing
```bash
# In database, secret_answer should look like:
$2b$12$abc... (bcrypt hash)
# NOT: "plaintext_password"
```

---

## Redirect Behavior

### On Success
- Token generated
- Success message shown (800ms)
- Auto-redirect to `/links`
- User stays logged in (token in localStorage)

### On Error
- Error message shows
- User stays on signup page
- Can correct and retry
- No token generated

---

## Mobile Optimization

- Eye icon: 20px on desktop, 18px on mobile
- Inputs: Full width, touch-friendly padding
- Errors: Below field, clear red color
- Toggle: Right side on LTR, left side on RTL
- Responsive breakpoints: 375px (mobile), 480px (tablet), 768px+

---

## Accessibility

- Eye toggle button: `aria-label` for screen readers
- Error divs: `role="alert"` for announcements
- Form labels: Proper `htmlFor` connections
- Inputs: Proper `id` attributes
- Focus states: Clear visual feedback

