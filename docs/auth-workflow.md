# Auth Workflow (Sign Up / Sign In)

## Summary
- **What it does:** Lets users create an account (sign up), log in (sign in), stay logged in while they use the app, and log out. All pages except sign-in, sign-up and (currently) analytics require the user to be logged in.
- **How it works in one sentence:** The Spring Boot backend checks the email/password, then remembers the logged-in user in a **server-side session**; the browser only holds a session cookie (`JSESSIONID`) that it sends automatically with every request.
- **Why sessions instead of JWT:** Simpler for a single backend + SPA. There's no token to store in `localStorage` (safer against XSS), sign out actually kills the session on the server, and expiry is handled by Spring automatically.
- **Security pieces in place:**
  - Passwords are hashed with **BCrypt** — the real password is never stored or returned.
  - **CSRF protection** is on, because cookie-based auth is vulnerable to CSRF otherwise.
  - Session ID is **rotated on login** (prevents session fixation).
  - Session cookie is **HttpOnly** (JavaScript can't read it) and **SameSite=Lax**.
  - Sessions **expire after 15 minutes of inactivity**.
  - Failed logins return a **generic error** so attackers can't tell whether an email is registered.
- **Frontend (Angular):** an `AuthService` makes the API calls and keeps the current user in a signal, an `authGuard` blocks protected pages, and an `authInterceptor` sends the user back to sign-in if their session expires.

---

## Key Files

### Backend (`app/src/main/java/com/matador/app/`)
| File | What it does |
|---|---|
| `config/SecurityConfig.java` | Central Spring Security setup: which URLs are public, session settings, CSRF, logout, BCrypt bean, and the `AuthenticationManager` used to check passwords. |
| `controller/AuthController.java` | The `/api/auth/*` REST endpoints. Also turns auth errors into clean JSON responses (401 / 409 / 400). |
| `service/AuthService.java` | Business logic for registering: normalizes input, checks for duplicate email/phone, hashes the password, saves the user. Also `findActiveByEmail()` for looking up the logged-in user. |
| `security/UserProfileDetailsService.java` | Spring Security hook. When someone logs in, Spring calls this to load the user by email from the DB and get their password hash + role. |
| `dto/RegisterRequest.java` | Sign-up request body + validation rules (required fields, email format, phone pattern, password 8–72 chars). |
| `dto/LoginRequest.java` | Sign-in request body (email + password). |
| `dto/UserResponse.java` | What we send back to the frontend about a user. **Deliberately excludes the password hash.** |
| `exception/DuplicateUserException.java` | Thrown when email or phone is already taken → becomes a 409. |
| `entity/UserProfile.java` | JPA entity mapped to the `app.user_profile` table. |

### Frontend (`matador/src/app/`)
| File | What it does |
|---|---|
| `services/auth.service.ts` | All auth HTTP calls (`register`, `login`, `logout`, `fetchCurrentUser`), the CSRF helper, and the `currentUser` signal the rest of the app reads. |
| `guards/auth.guard.ts` | Route guard. Before opening a protected page it asks the backend "am I logged in?" and redirects to `/sign-in` if not. |
| `interceptors/auth.interceptor.ts` | Watches every API response. If an API call returns 401 (session expired), it clears the user and redirects to sign-in. |
| `pages/sign-up/` | Sign-up form + client-side validation. |
| `pages/sign-in/` | Sign-in form; shows "Account created" / "Session expired" messages based on query params. |
| `sidebar/sidebar.ts` | Has the Sign Out button. |
| `app.routes.ts` | Where `canActivate: [authGuard]` is applied to protected routes. |
| `app.config.ts` | Registers the `authInterceptor` with `HttpClient`. |

### Database
- Table `app.user_profile` (see `docker/init.sql`): `user_id`, `fname`, `lname`, `email` (unique), `pwd_hash`, `phone` (unique), `role_type`, `created_at`, `deleted_at`.
- `deleted_at` is for **soft deletes** — a user with `deleted_at` set can't log in.

---

## API Endpoints (`/api/auth`)
| Method | Path | Needs login? | Response |
|---|---|---|---|
| GET | `/csrf` | No | Sets the `XSRF-TOKEN` cookie (needed before any POST). |
| POST | `/register` | No | `201` + user info · `409` email/phone taken · `400` invalid input |
| POST | `/login` | No | `200` + user info and a session is created · `401` wrong email/password |
| GET | `/me` | Yes | `200` + current user · `401` if not logged in / expired |
| POST | `/logout` | – | `204`, session destroyed and cookie deleted |

- **Every other `/api/**` endpoint (orders, etc.) requires a valid session.** Without one it returns `401` — it does *not* redirect to a login page, because the frontend handles that.

Example register body:
```json
{ "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com", "phone": "(555) 123-4567", "password": "supersecret" }
```

Example user response (register / login / me):
```json
{ "userId": 1, "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com", "phone": "(555) 123-4567", "roleType": "USER" }
```

---

## Sign Up Flow (step by step)
1. **User fills in the form** at `/sign-up`: first name, last name, email, phone, password.
2. **Frontend validation** runs first (required fields, valid email, phone matches `^[0-9()+\-\s]{7,15}$`, password 8–72 chars). If anything fails, errors show under the fields and nothing is sent.
   - Why 72? BCrypt only uses the first 72 bytes of a password, so longer ones would be silently truncated.
3. **Frontend calls `AuthService.register()`**, which:
   - First does `GET /api/auth/csrf` to make sure the CSRF cookie exists.
   - Then `POST /api/auth/register` with the form data.
4. **Backend validates again** using the annotations on `RegisterRequest` (never trust the frontend alone). Invalid → `400 {"message": "Invalid request"}`.
5. **`AuthService.register()` (Java):**
   - Trims whitespace and **lowercases the email**, so `Jane@Example.com` and `jane@example.com` are the same account.
   - Checks if the email already exists → `409 "An account with this email already exists"`.
   - Checks if the phone already exists → `409 "An account with this phone number already exists"`.
   - Hashes the password with BCrypt.
   - Saves the user with `role_type = "USER"` and `created_at = now`.
6. **Returns `201`** with the new user's info.
7. **The user is NOT automatically logged in.** The frontend redirects to `/sign-in?registered=true`, which shows "Account created. Please sign in."
8. On error, the sign-up page shows the backend's message (e.g. the 409 duplicate message) at the top of the form.

---

## Sign In Flow (step by step)
1. **User enters email + password** at `/sign-in`. Frontend checks both are filled and email looks valid.
2. **Frontend calls `AuthService.login()`** → `GET /csrf` → `POST /api/auth/login`.
3. **Backend checks the credentials:**
   - `AuthController.login()` passes the (lowercased) email + password to Spring's `AuthenticationManager`.
   - Spring calls `UserProfileDetailsService.loadUserByUsername()` which loads the user from the DB. Soft-deleted users are treated as "not found".
   - Spring compares the typed password against the stored BCrypt hash.
4. **If wrong:** returns `401 {"message": "Invalid email or password"}`. Same message whether the email doesn't exist or the password is wrong — on purpose, so nobody can probe which emails are registered.
5. **If correct:**
   - The session ID is changed (**session fixation protection** — an attacker can't plant a session ID before login and reuse it after).
   - The authenticated user is saved into the server-side `HttpSession`.
   - The browser receives the `JSESSIONID` cookie.
   - The response body is the user's info.
6. **Frontend** stores the user in the `currentUser` signal and navigates to `/dashboard`.
7. From now on, the browser automatically sends `JSESSIONID` with every request, and Spring knows who the user is.

---

## Staying Signed In / Protecting Pages
- **Protected routes:** `dashboard`, `history`, `profile`, `trade` have `canActivate: [authGuard]`.
- **What the guard does:** every time you navigate to one of those pages it calls `GET /api/auth/me`.
  - `200` → allowed in, and `currentUser` is refreshed with the latest info.
  - `401` → redirected to `/sign-in`.
- **Why check the server every time** instead of just trusting the signal? The session could have expired or been logged out in another tab; the server is the source of truth.
- **Page refresh works:** the Angular signal is lost on refresh, but the session cookie isn't, so `/me` restores the user.
- **SSR note:** the app uses Angular server-side rendering. The guard skips the check on the server (no browser cookies there) and runs it once the page loads in the browser.

---

## Session Expiry
- Configured in `application.properties`: `server.servlet.session.timeout=15m`.
- The timer resets on every request, so it's **15 minutes of inactivity**, not 15 minutes total.
- After it expires, the next API call returns `401`. The `authInterceptor` catches it, clears `currentUser`, and redirects to `/sign-in?expired=true` ("Your session has expired. Please sign in again.").
- The interceptor **ignores `/api/auth/*`** URLs — otherwise a failed login (also a 401) would trigger an "expired" redirect.

---

## Sign Out
1. User clicks Sign Out in the sidebar → `AuthService.logout()` → `GET /csrf` → `POST /api/auth/logout`.
2. Spring Security's built-in logout handler (configured in `SecurityConfig`):
   - Invalidates the session on the server.
   - Clears the security context.
   - Deletes the `JSESSIONID` cookie.
   - Returns `204 No Content`.
3. Frontend clears `currentUser` and navigates to `/sign-in`.
4. The frontend clears local state **even if the logout request fails** (e.g. session had already expired), so the user is never stuck looking logged in.

---

## CSRF — How It Works and Why
- **Why we need it:** because the browser sends the session cookie automatically, a malicious site could trick a logged-in user's browser into making a POST to our API. CSRF tokens block that.
- **How it's set up:** Spring uses `csrf.spa()` mode:
  1. Spring puts a token in a cookie called `XSRF-TOKEN` (readable by JS).
  2. Angular's `HttpClient` automatically reads that cookie and sends it back in the `X-XSRF-TOKEN` header on POST/PUT/PATCH/DELETE.
  3. Spring compares them. A malicious site can't read our cookie, so it can't forge the header.
- **`withCsrf()`** in `auth.service.ts` hits `GET /api/auth/csrf` before each auth POST to guarantee the cookie exists (it may not on first visit).
- **⚠️ If you add a new POST/PUT/DELETE endpoint** and get a `403`, it's almost certainly a missing CSRF token. Make sure the `XSRF-TOKEN` cookie has been set (call `/api/auth/csrf` first if needed) and that you're using Angular's `HttpClient`.

---

## How To Use Auth In New Code

**Backend — get the logged-in user in a controller:**
```java
@GetMapping("/something")
public Foo something(Authentication authentication) {
    UserProfile user = authService.findActiveByEmail(authentication.getName()); // getName() = email
    ...
}
```
- New endpoints are protected automatically (`anyRequest().authenticated()`). To make one public, add it to the `permitAll()` list in `SecurityConfig`.

**Frontend — get the logged-in user in a component:**
```ts
constructor(public auth: AuthService) {}
// template: {{ auth.currentUser()?.firstName }}
```

**Frontend — protect a new page:**
```ts
{ path: 'new-page', component: NewPageComponent, canActivate: [authGuard] }
```

---

## Local Dev Notes & Gotchas
- **Use the Angular dev proxy** (`proxy.conf.json` forwards `/api` → `http://localhost:8081`). The frontend and API must look like the same origin, otherwise the browser won't send the session/CSRF cookies.
- **`/analytics` has no `authGuard`** right now — anyone can open it. Add the guard if it's supposed to be protected.
- **Auth validation errors** return a simple `{"message": "Invalid request"}` (handled inside `AuthController`), not the detailed format from `GlobalExceptionHandler` that other endpoints use. This is intentional to keep auth error messages vague.
- **Roles:** every new user gets `USER`. Spring sees it as `ROLE_USER`. There's no admin logic yet, but role-based checks can be added with `hasRole("ADMIN")` in `SecurityConfig`.
- **Sessions are in memory** on the backend, so restarting the Spring app logs everyone out. Fine for dev; for multiple instances in prod we'd need something like Spring Session + Redis/JDBC.
