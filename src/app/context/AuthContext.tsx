import { createContext, useContext, useState, ReactNode } from "react";
import { employees, Employee } from "../data/mockData";

interface AuthContextType {
  user: Employee | null;
  login: (phone: string, password: string) => Employee | null;
  logout: () => void;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);

  const login = (phone: string, password: string): Employee | null => {
    const employee = employees.find(
      (emp) => emp.phone === phone && emp.password === password,
    );

    if (employee) {
      setUser(employee);
      return employee;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
  };

  const isOwner = user?.role === "owner";

  return (
    <AuthContext.Provider value={{ user, login, logout, isOwner }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
