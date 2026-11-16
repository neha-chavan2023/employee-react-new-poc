// Thin wrapper over https://dummyjson.com
// NOTE: dummyjson simulates writes (add/update/delete) - it responds with the
// result but does not persist. The app therefore applies the change to local
// state (and localStorage) after the API call succeeds.
const BASE = "https://dummyjson.com";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const login = (username, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  });

export const fetchUsers = () => request("/users?limit=0");

export const addUser = (user) =>
  request("/users/add", { method: "POST", body: JSON.stringify(user) });

export const updateUser = (id, user) =>
  // Locally-created users (id > 208) do not exist on the server, so skip.
  id > 208
    ? Promise.resolve(user)
    : request(`/users/${id}`, { method: "PUT", body: JSON.stringify(user) });

export const deleteUser = (id) =>
  id > 208 ? Promise.resolve({ id }) : request(`/users/${id}`, { method: "DELETE" });
