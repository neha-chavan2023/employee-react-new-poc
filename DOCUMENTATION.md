# Employee Management POC — Technical Documentation

Audience: Team Lead / technical reviewer
Status: Proof of concept (demo only, not production-hardened)
Last reviewed: 14 November 2026

---

## 1. Executive summary

This is a **front-end-only proof of concept** for an internal "people operations" tool. It demonstrates the complete user journey of an HR-style application — sign in, view workforce KPIs, browse/search/sort/paginate employees, create/edit/delete employee records, and explore roles by department — using **real HTTP calls against a public mock backend** (`dummyjson.com`) and **no custom server**.

The goal was to validate **UX, screen flows, and component structure** quickly, not to build a deployable system. There is no backend, database, or authentication service of our own; the mock API simulates writes, and the application layers local persistence on top so the demo survives a page refresh.

**In one line:** a React SPA that proves out the employee-management workflow against a mock API, ready to be re-pointed at a real backend.

---

## 2. What the POC proves (and what it does not)

| Area | Proven | Not proven |
| --- | --- | --- |
| UX / screen flows | Full login → dashboard → list → CRUD journey with responsive layout | User research / accessibility audit |
| Front-end architecture | Context-based auth + data state, clean separation of API layer, pages, components | Scalable state management for large datasets |
| API integration | Fetch, error handling, optimistic local application of writes | Real server contract, pagination on the server, concurrency |
| Auth | Login flow, session persistence, route protection | Real security: token validation, expiry, refresh, server-side authorization |
| Data model | Normalized employee shape, derived departments | Multi-tenant data, audit trails, relational integrity |
| Quality gates | Production build succeeds | Automated tests, linting, CI — **none exist yet** |

---

## 3. Tech stack

| Concern | Choice | Notes |
| --- | --- | --- |
| UI framework | React 18.3 | Function components + hooks throughout |
| Build tool | Vite 5.4 | Fast dev server, ES module build; `@vitejs/plugin-react` |
| Component library | MUI (Material UI) 9.5 | Material Design system; theme customized in `src/main.jsx` |
| Icons | `@mui/icons-material` 9.5 | Rounded/outlined icon set |
| Routing | `react-router-dom` 6.30 | `BrowserRouter`, nested routes, `NavLink` |
| Charts | Recharts 2.15 | Single bar chart on the dashboard |
| Styling | MUI `sx` prop + `createTheme` | Design tokens (palette, radius, typography) centralized |
| Backend | `https://dummyjson.com` | Third-party mock REST API, no key required |
| State | React Context + `useState` | No Redux/Zustand/React Query by design |
| Persistence | `localStorage` | Session + working dataset |

No test framework, no ESLint/Prettier config, no CI pipeline, no environment-variable configuration, no TypeScript.

---

## 4. Architecture

```
main.jsx
 ├─ ThemeProvider / CssBaseline          MUI theme + global reset
 ├─ BrowserRouter                        client-side routing
 │   └─ AuthProvider                     session: login/logout, localStorage
 │       └─ DataProvider                 employees + departments, CRUD, fetching
 │           └─ App                      route table + Protected guard
 │               └─ Layout               sidebar drawer, top bar, Outlet
 │                   ├─ Dashboard        KPI cards + Recharts bar chart
 │                   ├─ Employees        table, filters, pagination, modal form
 │                   └─ Departments      "Designations" table (read-only)
 └─ api.js                               fetch wrapper around dummyjson
```

### Layering

- **`src/api.js`** — the only file that knows the backend URL. Thin wrapper around `fetch` with JSON parsing and error normalization (`throw new Error(message)`).
- **`src/context/AuthContext.jsx`** — owns the logged-in session and exposes `login` / `logout`.
- **`src/context/DataContext.jsx`** — owns the employee dataset and derived departments, exposes CRUD operations, and mirrors state into `localStorage`.
- **`src/pages/*`** — screens; they read from context and never call `fetch` directly.
- **`src/components/*`** — presentational shell (`Layout`, `Modal`).

This means swapping the mock API for a real backend is a **single-file change plus contract mapping** — the main architectural payoff of the POC.

---

## 5. Project structure

```
.
├── index.html                  Vite HTML entry point
├── package.json                Dependencies and dev/build scripts
├── vite.config.js              React plugin only (no aliases, no proxy)
├── README.md                   Short quick-start + feature list
├── DOCUMENTATION.md            This document
├── dist/                       Committed build output (should be generated, not tracked)
└── src/
    ├── main.jsx                App bootstrap: theme, router, providers
    ├── App.jsx                 Route table, Protected route guard
    ├── api.js                  dummyjson HTTP client
    ├── components/
    │   ├── Layout.jsx          Responsive drawer navigation, user card, logout
    │   └── Modal.jsx           Reusable MUI Dialog wrapper with close button
    ├── context/
    │   ├── AuthContext.jsx     Session state + login/logout
    │   └── DataContext.jsx     Employee/department state, CRUD, persistence
    └── pages/
        ├── Login.jsx           Credentials form with error/loading states
        ├── Dashboard.jsx       KPI cards, department headcount chart
        ├── Employees.jsx       Main CRUD screen + EmployeeForm
        └── Departments.jsx     Designations (role) listing, read-only
```

---

## 6. Data model

The raw dummyjson user object is deliberately **reduced** in `DataContext.normalize()` so screens are not coupled to the API's shape:

```js
{
  id: number,            // server id (1–208) or locally generated (> 208)
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  age: number,
  gender: "male" | "female",
  image: string,         // avatar URL
  department: string,    // from company.department, "Unassigned" if missing
  title: string,         // from company.title (job title)
  city: string           // from address.city
}
```

**Departments are not a separate entity.** They are *derived* at runtime as the sorted union of every employee's `department` plus any extra department names stored separately. This is the correct simplicity trade-off for a POC, but it means a department cannot exist without either an employee or a local extra record.

Derived values used by the Dashboard:
- total employees
- department count
- employees per department (chart series)

---

## 7. Screen-by-screen behavior

### 7.1 Login — `src/pages/Login.jsx`
- Centered card on a plain light background; "Username or email" + Password fields and a full-width "Login" button.
- The first field accepts a username or an email, and is **pre-filled** with the demo account `emilys` / `emilyspass` so the app can be demoed in one click (**any valid dummyjson user works**). An info alert above the form states the same credentials.
- Calls `POST /auth/login`, then stores `id, username, name, email, image, token` in `localStorage` under `emp_poc_auth`.
- Shows an inline error alert on failure, disables the button and shows "Logging in…" while pending.
- If already signed in, `/login` redirects to `/`.

### 7.2 Layout — `src/components/Layout.jsx`
- Permanent 264px drawer on desktop; temporary drawer behind a hamburger below the `md` breakpoint.
- Three nav items (Dashboard, Employees, Departments) with active-state styling.
- Footer user card shows avatar, name, email, and a sign-out button.
- Also **the loading/error surface**: while `DataContext` fetches, it renders "Loading employees…" instead of the page; a failed fetch renders an error chip.
- The full dataset (208 users) is fetched in one request after the first successful login.

### 7.3 Dashboard — `src/pages/Dashboard.jsx`
- Two KPI cards: Employees and Departments.
- One bar chart, **"Employees per department"** — covered in detail in §7.3.1 below.
- All values computed client-side from the in-memory employee array.

#### 7.3.1 How to use the "Employees per department" chart

**What it shows.** One bar per department on the x-axis; the y-axis is the number of employees in that department. It is the only place the per-team breakdown is shown.

**How to read it.**
- Bars are **sorted largest → smallest**, so the headcount ranking is readable left to right — the leftmost bar is the largest team.
- The y-axis is whole employees only (`allowDecimals={false}`), so a bar of height 3 means exactly 3 people.
- Gridlines are horizontal only and dashed; they are guides, not thresholds.
- Departments are the `company.department` values present in the dummyjson dataset (plus "Unassigned" for any record without one), so the chart is a manageable set of bars on one screen. Labels are rotated −30° and always rendered (`interval={0}`) so no department is skipped.

**How to interact with it.**
- **Hover any bar** — a tooltip appears showing the department name and `Employees: N`, with a light band highlighting the hovered column. This is the only interaction; there are no filters, legends, or click-through.
- **Resize the window** — the chart sits in a `ResponsiveContainer` at a fixed 320px height, so it reflows horizontally and stays legible on tablet width. Below that, bars simply get narrower.

**Where the numbers come from.** The chart is derived, never stored: `byDept` in `Dashboard.jsx` counts `employee.department` across the whole in-memory array, then sorts descending. On first login this is the 208 employees returned by `GET /users?limit=0`; after that it reflects the localStorage cache.

**It is live.** Because it reads from `DataContext`, adding an employee, changing someone's department in the edit form, or deleting an employee updates the bar heights **immediately, without a refresh**. This is the fastest thing to demo: edit an employee's department on the Employees screen, then return to the Dashboard and point at the two bars that changed (one +1, one −1).

**What it deliberately does not do (state this to the TL before they ask):**
- It ignores the Employees page's search and department filter — both screens filter independently, so the chart always shows company-wide headcount, not the current table view.
- It has no drill-down; clicking a bar does nothing. "Click a bar to see that department's employees" is a natural next step, not a current feature.
- Departments with **zero** employees never appear, because the series is built from employees. A department added via the (unwired) `addDepartment` method would be counted in the "Departments" KPI but absent from the chart.
- There is no time dimension, so it cannot show headcount change, and no export or image download.

### 7.4 Employees — `src/pages/Employees.jsx`
The core of the POC.
- **Table columns:** employee (avatar, name, email), department chip, job title, age, phone, actions.
- **Search:** debounce-free but cheap — filters on name, email, and title client-side.
- **Department filter:** dropdown fed from derived departments.
- **Sorting:** by employee (first name), department, or age; toggles asc/desc via `TableSortLabel`.
- **Pagination:** client-side, 10 rows per page, MUI `Pagination`, with a "Showing X–Y of Z" summary.
- **Add / Edit:** shared `EmployeeForm` inside `Modal` — first name, last name, email, phone, age (`min 18, max 70`), gender select, department select, job title, city. HTML `required` validation + server error surfacing. Age coerced to number on submit.
- **Delete:** confirmation dialog with the employee's name, then removal.
- **Feedback:** transient success alert ("Employee added/updated/deleted") that auto-dismisses after 3 seconds.
- **Empty state:** "No employees found." row.

### 7.5 Departments — `src/pages/Departments.jsx`
- Despite the route and nav label "Departments", this screen renders a **Designations** (role) listing: unique `title + department` pairs derived from employees.
- Search by designation/department, department filter, row count chip.
- Read-only: no create/edit/delete here. See §10 for the gap.

---

## 8. API integration

Base URL is hard-coded in `src/api.js`:

| Function | Endpoint | Purpose |
| --- | --- | --- |
| `login(username, password)` | `POST /auth/login` | Returns user + `accessToken` (60-min requested lifetime) |
| `fetchUsers()` | `GET /users?limit=0` | All 208 demo users |
| `addUser(user)` | `POST /users/add` | Simulated create |
| `updateUser(id, user)` | `PUT /users/{id}` | Simulated update; **skipped for locally created ids (> 208)** |
| `deleteUser(id)` | `DELETE /users/{id}` | Simulated delete; same skip rule |

### The critical mock-API constraint

`dummyjson` accepts write requests and returns a plausible response, but **does not persist anything**. The POC therefore uses this pattern:

```
call API  →  if it resolves, apply the change to local state  →  localStorage effect persists it
```

Clients added locally receive `id = max(208, current max id) + 1` and a generated avatar (`i.pravatar.cc`), so they behave like real records for the rest of the session. Updates and deletes for those ids are intentionally not sent to the API.

### Persistence keys

| Key | Contents |
| --- | --- |
| `emp_poc_auth` | Session object incl. `accessToken` |
| `emp_poc_employees` | Normalized employee array |
| `emp_poc_extra_depts` | Department names that have no employees |

Because the employee list is cached, the app **fetches only once per browser** (until storage is cleared). `DataContext.resetData()` clears keys and refetches, but **no UI exposes it** — the README's instruction is to clear `emp_poc_*` keys manually in DevTools.

---

## 9. Running the demo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
```

**Demo script for the TL (≈3 minutes):**

1. Open the app → redirected to `/login`; credentials are already filled in → click **Login**.
2. Dashboard: read out the two KPIs. On the chart, say that bars are sorted by headcount (leftmost = largest team) and hover one to show the tooltip.
3. Employees: search "emily", filter by a department, sort by age, page to page 2.
4. Add employee with a name/department that does not exist → appears at the top of the list and in the department dropdown. **Then go back to the Dashboard: its bar has grown by one and has possibly changed position** (live derivation, §7.3.1).
5. Edit that employee's department to a different team → return to the Dashboard to show one bar drop and another rise.
6. Edit that employee's title → verify the row updates.
7. Refresh the browser → **the added/edited record is still there** (localStorage).
8. Delete it → confirmation dialog → row disappears; the Dashboard chart returns to its original shape.
9. Departments: show search/filter over derived designations.
10. Sign out → protected routes redirect to `/login`; sign back in → data persists.

---

## 10. Known gaps and discrepancies (read this before reviewing)

These are honest limitations of the POC as it currently stands:

1. **README overstates features.** It claims departments can be added, renamed (cascading to employees), and deleted when empty, and that the dashboard shows gender split and age distribution charts. The code contains `addDepartment`, `renameDepartment`, `deleteDepartment` in `DataContext` **but no UI calls them**, and only the per-department bar chart exists.
2. **Route/nav naming mismatch.** The nav item and route are "Departments", but `Departments.jsx` is a read-only **Designations** screen (`export default function Designations`).
3. **Dead code / unused API surface.** `resetData`, department CRUD, and `loading`/`error` beyond the layout guard are effectively unused.
4. **No real authorization.** The access token is stored but never sent on requests; there is no expiry handling and no server-side enforcement. Route protection is purely client-side.
5. **Sensitive data in `localStorage`.** Employee PII and a token are persisted in plain text, readable by any script on the origin.
6. **No automated tests, linting, or CI.** `eslint-disable` comments exist for a linter that is not installed. Build is the only gate.
7. **Single-browser data.** Because persistence is local, two users/browsers see different data; there is no shared source of truth.
8. **No server-side pagination/search/sort.** Everything is client-side over 208 records — fine for a demo, not for a real headcount.
9. **Hard-coded API base URL.** No `.env` support; cannot point at staging vs production without editing code.
10. **Large initial bundle** (~902 kB / 270 kB gzip, Vite warns over 500 kB) — no route-level code splitting.
11. **`dist/` is committed** alongside source, which will drift and bloat the repo.
12. **`BrowserRouter` needs a server rewrite rule** on static hosting or deep links like `/employees` 404 on refresh.
13. **No error boundary.** A render-time exception blanks the app.
14. **The department chart is overview-only.** No click-through to filter the Employees table, zero-headcount departments are omitted, and it ignores the Employees page filters (see §7.3.1).
15. **Minor robustness issues:** search text includes literal strings like "undefined" for empty titles; locally generated ids can be reused after deleting the newest record; duplicate emails are not prevented; no optimistic-update rollback if a write fails after the local change (the change is applied only after the promise resolves, so this is currently safe but not retried).

---

## 11. Risk assessment for productionization

| Risk | Impact | Mitigation |
| --- | --- | --- |
| No backend / data contract | Cannot persist or share data | Define REST/GraphQL contract; implement service + DB |
| Auth is cosmetic | Security exposure | Real identity provider, httpOnly cookies, server authorization |
| PII in browser storage | Compliance (GDPR/local law) | Server-held data, short-lived sessions, no PII caching |
| Client-side-only querying | Poor UX at scale | Server-side search/sort/pagination |
| Zero test coverage | Regression risk during rework | Add Vitest + React Testing Library; Playwright for flows |
| Hard-coded config | Environment mistakes | Vite `import.meta.env` + `.env.example` |

---

## 12. Recommended next steps (rough sequencing)

**Phase 0 — tidy the POC (hours, not days)**
- Align README with reality, or finish the missing department CRUD and charts.
- Rename the Departments/Designations screen consistently (one name everywhere).
- Remove unused context API or wire it up; stop committing `dist/`; add ESLint + Prettier.

**Phase 1 — make it testable and configurable (small)**
- Extract `BASE` to `VITE_API_BASE_URL`.
- Add Vitest + React Testing Library for `DataContext` reducers/helpers and `EmployeeForm` validation; one Playwright happy path.
- Introduce an error boundary and a proper loading skeleton.

**Phase 2 — replace the mock with a real service (medium)**
- Implement a backend (e.g. Node/Express or the team's standard stack) persisting employees.
- Introduce departments as a first-class entity (id, name) and a `departmentId` foreign key instead of a free-text string.
- Move filtering/sorting/pagination server-side.
- Add `Authorization` headers, token refresh, and real session expiry.

**Phase 3 — production readiness (larger)**
- Role-based access control (admin vs read-only HR viewer) and audit logging for edits/deletes.
- Accessibility pass (keyboard traps in dialogs, focus management, contrast).
- Observability: error tracking, request logging, basic analytics on flows.
- Route-based code splitting and dependency trimming to reduce bundle size.
- CI pipeline: typecheck/lint/test/build on every PR.

**Suggested adoption decision for the TL:** treat this as a **validated UX prototype**, keep the component structure and API abstraction, and rebuild the data/auth layers rather than evolving the mock persistence.

---

## 13. Points to raise with the TL

1. Is the designations/roles view a separate feature from department management, or should it be merged? This affects the data model.
2. Do we need department CRUD (add/rename/delete) in v1, and what happens to employees when a department is deleted?
3. Which backend and database are the standard here? That decides Phase 2 effort.
4. What are the PII/compliance constraints for employee data in our environment?
5. Who are the roles (HR admin, manager, read-only) and what may each do?
6. Is 208 seeded records representative? What is the realistic headcount ceiling we must design for?

---

## 14. Verification status

- `npm run build` — **passes** (Vite 5.4.21, 1544 modules, only the chunk-size advisory).
- No automated tests exist, so no test suite was run.
- MUI 9 compatibility issues found during review were corrected: legacy Grid `item`/`xs` props and TextField `InputProps`/`inputProps` now use `size` and `slotProps`.
- Routing, persistence, and CRUD behavior were verified by code review only; a browser pass is recommended before the demo (§9 script).
