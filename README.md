# BanTrike 

**A mobile and web system for tricycle drivers to register, renew, and
check the roadworthiness of their unit — with an admin side that
monitors the fleet.**

A front-end-only prototype — plain HTML, CSS, and JavaScript, no server,
no Node.js, no install step. Everything is saved in your browser's
**localStorage**.

## How to run it

Open `public/index.html` in a browser (double-click it, or use VS
Code's "Open with Live Server" for the most reliable experience).

## Log in

| Role | Username | Password |
|---|---|---|
| Driver (fresh account, no unit yet) | `demo` | `demo` |
| Driver (registered, roadworthiness check is stale) | `rico.manalo` | `demo1234` |
| Driver (registered, failed roadworthiness) | `elena.cruz` | `demo1234` |
| Admin | `admin` | `admin123` |

Or sign up your own driver account from the login screen.

## The core rule: roadworthiness gates renewal

A driver can only renew if their **latest roadworthiness check passed**
**and** happened within the **last 60 days** (see `ROADWORTHY_VALID_DAYS`
in `js/store.js`). This means:

- A unit that's never been checked → renewal is locked.
- A unit that failed its last check → renewal is locked.
- A unit that passed, but too long ago → renewal is locked again, even
  though it once passed.

The Renewal page (`renewal.html`) explains exactly which of these
applies and links straight to the Roadworthiness Standard page to fix
it. Try logging in as `rico.manalo` or `elena.cruz` to see this in
action immediately — both are deliberately seeded in a locked state.

## Admin: Fleet Monitoring

Log in as `admin` and you land on `admin.html` instead of the driver
dashboard. It shows every registered unit, its registration and
roadworthiness standing, and lets the admin **flag a unit for
re-inspection** — which resets its roadworthiness to "not checked" and
immediately re-locks that driver's renewal, the same gate drivers hit
themselves. Every admin action is written to the activity log at the
bottom of the page.

Driver accounts are blocked from visiting `admin.html` directly
(they're redirected back to their own dashboard).

## Project structure

```
BanTrike/
└── public/
    ├── index.html            (login / sign up — the front page)
    ├── dashboard.html         (driver home after login)
    ├── registration.html
    ├── renewal.html
    ├── roadworthy.html
    ├── profile.html
    ├── admin.html             (admin-only: fleet monitoring)
    ├── css/style.css
    └── js/
        ├── store.js            (the "database" + all business rules)
        ├── auth.js
        ├── dashboard.js
        ├── register.js
        ├── renew.js
        ├── roadworthy.js
        ├── profile.js
        └── admin.js
```

## How the pieces connect

- `store.js` holds one user per account, and at most **one tricycle per
  account** (`user.tricycle`) — registering a second unit on the same
  account is blocked.
- `requireAuth()` guards every driver page; `requireAdmin()` guards
  `admin.html` and redirects anyone who isn't an admin back to their
  own dashboard.
- `isRoadworthyValid(tricycle)` is the single function that decides
  whether a unit may renew — both `renewal.html` (to show/hide the
  button) and `renewTricycle()` itself (to actually block the action
  server-side-equivalent, i.e. even if someone bypassed the UI) call
  it, so the rule can't be skipped from the front end.
- Admin's "flag for re-inspection" just sets `roadworthy` back to
  `null` on that user's tricycle — the existing gate logic in
  `renewTricycle()` then blocks renewal automatically, with no special
  admin-only code path needed.

Every file is commented to explain what it does and why.
