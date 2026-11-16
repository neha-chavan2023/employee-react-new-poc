import { createContext, useContext, useState } from "react";
import * as api from "../api.js";

const AuthContext = createContext(null);
const KEY = "emp_poc_auth";
const ACCOUNTS_KEY = "emp_poc_accounts";

const readAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
  } catch {
    return [];
  }
};

const writeAccounts = (accounts) =>
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

// Passwords are hashed so they are not stored in plain text in the browser.
const hash = async (value) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  });

  const startSession = (session) => {
    localStorage.setItem(KEY, JSON.stringify(session));
    setUser(session);
  };

  const register = async ({ name, username, email, password }) => {
    const accounts = readAccounts();
    const uname = username.trim();
    const mail = email.trim();
    if (accounts.some((a) => a.username.toLowerCase() === uname.toLowerCase()))
      throw new Error("That username is already registered.");
    if (accounts.some((a) => a.email.toLowerCase() === mail.toLowerCase()))
      throw new Error("That email is already registered.");

    const account = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      username: uname,
      email: mail,
      passwordHash: await hash(password),
      createdAt: new Date().toISOString(),
    };
    writeAccounts([...accounts, account]);

    startSession({
      id: account.id,
      username: account.username,
      name: account.name,
      email: account.email,
      image: "",
      token: "local-session",
    });
  };

  // Accepts an email or a username: local accounts match either, and the
  // demo API (dummyjson) is username-based.
  const login = async (identifier, password) => {
    const id = identifier.trim().toLowerCase();
    const account = readAccounts().find(
      (a) => a.username.toLowerCase() === id || a.email.toLowerCase() === id
    );

    if (account) {
      if ((await hash(password)) !== account.passwordHash)
        throw new Error("Incorrect password.");
      startSession({
        id: account.id,
        username: account.username,
        name: account.name,
        email: account.email,
        image: "",
        token: "local-session",
      });
      return;
    }

    const data = await api.login(identifier, password);
    startSession({
      id: data.id,
      username: data.username,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      image: data.image,
      token: data.accessToken,
    });
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
