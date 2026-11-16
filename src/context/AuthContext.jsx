import { createContext, useContext, useState } from "react";
import * as api from "../api.js";

const AuthContext = createContext(null);
const KEY = "emp_poc_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  });

  // Accepts an email or a username; the demo API (dummyjson) is username-based.
  const login = async (identifier, password) => {
    const data = await api.login(identifier, password);
    const session = {
      id: data.id,
      username: data.username,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      image: data.image,
      token: data.accessToken,
    };
    localStorage.setItem(KEY, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
