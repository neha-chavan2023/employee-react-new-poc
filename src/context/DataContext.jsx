import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../api.js";
import { useAuth } from "./AuthContext.jsx";

const DataContext = createContext(null);
const EMP_KEY = "emp_poc_employees";
const DEPT_KEY = "emp_poc_extra_depts";

const load = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

// Reduce the large dummyjson user object to what the app needs.
const normalize = (u) => ({
  id: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  phone: u.phone,
  age: u.age,
  gender: u.gender,
  image: u.image,
  department: u.company?.department || "Unassigned",
  title: u.company?.title || "",
  city: u.address?.city || "",
});

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState(() => load(EMP_KEY, []));
  const [extraDepts, setExtraDepts] = useState(() => load(DEPT_KEY, []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch once after login (unless we already have saved data).
  useEffect(() => {
    if (!user || employees.length) return;
    setLoading(true);
    api
      .fetchUsers()
      .then((d) => setEmployees(d.users.map(normalize)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    localStorage.setItem(EMP_KEY, JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem(DEPT_KEY, JSON.stringify(extraDepts));
  }, [extraDepts]);

  const departments = useMemo(() => {
    const set = new Set([...employees.map((e) => e.department), ...extraDepts]);
    return [...set].sort();
  }, [employees, extraDepts]);

  /* ---------------- Employee CRUD ---------------- */
  const addEmployee = useCallback(async (emp) => {
    await api.addUser(emp);
    setEmployees((list) => {
      const nextId = Math.max(208, ...list.map((e) => e.id)) + 1;
      return [{ ...emp, id: nextId, image: `https://i.pravatar.cc/100?u=${nextId}` }, ...list];
    });
  }, []);

  const updateEmployee = useCallback(async (id, changes) => {
    await api.updateUser(id, changes);
    setEmployees((list) => list.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }, []);

  const deleteEmployee = useCallback(async (id) => {
    await api.deleteUser(id);
    setEmployees((list) => list.filter((e) => e.id !== id));
  }, []);

  /* ---------------- Department CRUD ---------------- */
  const addDepartment = (name) => {
    const n = name.trim();
    if (!n) throw new Error("Name is required");
    if (departments.some((d) => d.toLowerCase() === n.toLowerCase()))
      throw new Error("Department already exists");
    setExtraDepts((d) => [...d, n]);
  };

  const renameDepartment = (oldName, newName) => {
    const n = newName.trim();
    if (!n) throw new Error("Name is required");
    if (n.toLowerCase() !== oldName.toLowerCase() &&
        departments.some((d) => d.toLowerCase() === n.toLowerCase()))
      throw new Error("Department already exists");
    setEmployees((list) =>
      list.map((e) => (e.department === oldName ? { ...e, department: n } : e))
    );
    setExtraDepts((d) => [...d.filter((x) => x !== oldName), n]);
  };

  const deleteDepartment = (name) => {
    if (employees.some((e) => e.department === name))
      throw new Error("Cannot delete a department that still has employees");
    setExtraDepts((d) => d.filter((x) => x !== name));
  };

  const resetData = () => {
    localStorage.removeItem(EMP_KEY);
    localStorage.removeItem(DEPT_KEY);
    setExtraDepts([]);
    setEmployees([]);
    setLoading(true);
    api
      .fetchUsers()
      .then((d) => setEmployees(d.users.map(normalize)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <DataContext.Provider
      value={{
        employees, departments, loading, error,
        addEmployee, updateEmployee, deleteEmployee,
        addDepartment, renameDepartment, deleteDepartment, resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
