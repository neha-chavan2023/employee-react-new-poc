# Employee Management POC

React + Vite proof of concept using the [dummyjson users API](https://dummyjson.com/users).

## Features
- **Login** – `POST /auth/login` (demo: `emilys` / `emilyspass`; any dummyjson username/password works). Session kept in localStorage; protected routes.
- **Employees** – list (208 users from `GET /users?limit=0`), search, department filter, sorting, pagination, add / edit / delete.
- **Departments** – derived from each user's `company.department`; add, rename (updates employees) and delete (only when empty); headcount and average age.
- **Dashboard** – KPI cards and charts (Recharts): employees per department, gender split, age distribution.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Notes
- dummyjson **simulates** add/update/delete (returns a response but does not persist). The app calls the API, then applies the change to local state, saved in localStorage so changes survive refresh.
- To reload fresh data from the API, clear the localStorage keys starting with `emp_poc_` (DevTools > Application) and refresh.
- Structure: `src/api.js` (HTTP), `src/context/` (auth + data state), `src/pages/` (screens), `src/components/` (layout, modal).
