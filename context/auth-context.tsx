import {
  patientStorage,
  roleStorage,
  tokenStorage,
  usernameStorage,
} from "@/utils/token-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  tempUsername: string | null;
  token: string | null;
  role: string | null;
  isLoading: boolean;
  saveTempUsername: (username: string) => void;
  clearTempUsername: () => void;
  saveToken: (token: string) => Promise<void>;
  saveRole: (role: string) => Promise<void>;
  clearToken: () => Promise<void>;
  username: string | null;
  saveUsername: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tempUsername, setTempUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([tokenStorage.get(), roleStorage.get(), usernameStorage.get()])
      .then(([storedToken, storedRole, storedUsername]) => {
        if (storedToken) setToken(storedToken);
        if (storedRole) setRole(storedRole);
        if (storedUsername) setUsername(storedUsername);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const saveTempUsername = (username: string) => setTempUsername(username);
  const clearTempUsername = () => setTempUsername(null);

  const saveUsername = async (u: string) => {
    await usernameStorage.save(u);
    setUsername(u);
  };

  const saveToken = async (t: string) => {
    await tokenStorage.save(t);
    setToken(t);
  };

  const saveRole = async (r: string) => {
    await roleStorage.save(r);
    setRole(r);
  };

  const clearToken = async () => {
    await tokenStorage.clear();
    await roleStorage.clear();
    await patientStorage.clear();
    await usernameStorage.clear();
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{
        tempUsername,
        token,
        role,
        username,
        isLoading,
        saveTempUsername,
        clearTempUsername,
        saveToken,
        saveRole,
        saveUsername,
        clearToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
