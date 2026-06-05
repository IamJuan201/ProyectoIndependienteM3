# ProjectFlow — Internal Project Management SPA

A Single Page Application for managing internal company projects, built with Vanilla JavaScript and Vite. Features role-based access control, persistent sessions, and a simulated REST API via json-server.

---

## Description

ProjectFlow allows a company's internal teams to manage projects efficiently. It provides two user roles — **Manager** and **Collaborator** — each with specific permissions. The app features full CRUD operations, session persistence, and SPA navigation without page reloads.

---

## Technologies

| Technology | Purpose |
|---|---|
| Vite 5 | Build tool and dev server |
| Vanilla JavaScript (ES Modules) | Core application logic |
| json-server 0.17 | Simulated REST API |
| CSS Custom Properties | Theming and design system |
| Google Fonts (Syne + DM Sans) | Typography |
| localStorage | Session persistence |

---

## Installation

### Prerequisites
- Node.js 18+ installed
- npm 9+

### Steps

```bash
# 1. Unzip the project and enter the folder
cd project-manager

# 2. Install dependencies
npm install
```

---

## Running the Project

You need **two terminals** running simultaneously.

### Terminal 1 — Start JSON Server (API)

```bash
npm run server
```

The API will be available at: `http://localhost:3001`

### Terminal 2 — Start Vite Dev Server (Frontend)

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

> Both servers must be running at the same time. The Vite proxy forwards `/api/*` requests to the JSON server on port 3001.

---

## Running JSON Server

```bash
npm run server
# Starts json-server watching db.json on port 3001
```

Available endpoints:
- `GET /users` — list users
- `GET /projects` — list projects
- `POST /projects` — create project
- `PATCH /projects/:id` — update project
- `DELETE /projects/:id` — delete project

---

## Test Users

Both accounts are pre-loaded in `db.json`. No registration is required.

| Role | Email | Password |
|---|---|---|
| Manager | manager@test.com | 123456 |
| Collaborator | user@test.com | 123456 |

---

## Project Structure

```
project-manager/
├── index.html                  # App shell
├── vite.config.js              # Vite config with API proxy and path aliases
├── package.json
├── db.json                     # json-server database
└── src/
    ├── main.js                 # Entry point — boots the router
    ├── router.js               # SPA router using the History API
    ├── styles/
    │   └── main.css            # Global design system and component styles
    ├── services/
    │   ├── api.js              # All fetch calls to json-server
    │   └── auth.js             # Session management via localStorage
    ├── components/
    │   ├── sidebar.js          # Navigation sidebar component
    │   └── projectModal.js     # Create, edit, and confirm modals
    ├── pages/
    │   ├── login.js            # Login page
    │   ├── dashboard.js        # Dashboard view (different per role)
    │   ├── projects.js         # Full CRUD project management (manager only)
    │   └── projectDetail.js    # Project detail view
    └── utils/
        ├── helpers.js          # Formatting and status badge utilities
        └── toast.js            # Toast notification system
```

---

## Role Permissions

### Manager
| Feature | Permission |
|---|---|
| View all projects | Yes |
| Create projects | Yes |
| Edit any project | Yes |
| Delete any project | Yes |
| View project details | Yes |
| Access /projects route | Yes |

### Collaborator
| Feature | Permission |
|---|---|
| View assigned projects only | Yes |
| View project details (own only) | Yes |
| Update status of own projects | Yes |
| Create projects | No |
| Edit other fields | No |
| Delete projects | No |
| Access /projects route | No (redirected to dashboard) |

---

## Technical Decisions

### SPA Routing
Uses the browser's History API (`history.pushState` and the `popstate` event) for navigation without page reloads. A central `router.js` maps URL paths to render functions and enforces authentication and authorization guards.

### Session Persistence
User session is stored in localStorage after login, with the password field excluded before saving. This keeps the user authenticated across page refreshes and browser restarts. Logout clears the stored key and redirects to the login page.

### Path Aliases
Vite is configured with path aliases (`@services`, `@pages`, `@components`, `@utils`) to keep imports clean and avoid deeply nested relative paths across modules.

### Modularization
The codebase follows a clear separation of concerns:
- `services/` — all data fetching and auth logic
- `pages/` — page-level render functions
- `components/` — reusable UI pieces such as the sidebar and modals
- `utils/` — pure helper functions with no side effects

### API Communication
All HTTP calls go through `src/services/api.js` using the native Fetch API. The Vite dev server proxies `/api/*` to `http://localhost:3001`, avoiding CORS issues during development.

### Role Guards
Route protection is enforced at two levels:
1. **Router level**: unauthenticated users are redirected to `/login`; authenticated users visiting `/login` are redirected to `/dashboard`.
2. **Page level**: collaborators visiting `/projects` are redirected to `/dashboard`; collaborators requesting project details that do not belong to them receive a permission error.

### Design System
All colors, spacing, and typography are managed through CSS Custom Properties in `main.css`, providing consistent theming without relying on an external CSS framework.
