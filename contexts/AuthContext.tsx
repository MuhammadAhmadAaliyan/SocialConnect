import React, { createContext, useState, useContext } from "react";

type AuthContextType = {
  user: any | null;
  login: (user: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    logout: () => {}
});

export const AuthProvider = ({ children}: any) => {
  const [user, setUser] = useState(null);

  const login = (userData: any) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
