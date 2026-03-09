import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  tempUsername: string | null;
  token: string | null;
  saveTempUsername: (username: string) => void;
  clearTempUsername: () => void;
  saveToken: (token: string) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tempUsername, setTempUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const saveTempUsername = (username: string) => setTempUsername(username);
  const clearTempUsername = () => setTempUsername(null);
  const saveToken = (t: string) => setToken(t);
  const clearToken = () => setToken(null);

  return (
    <AuthContext.Provider
      value={{
        tempUsername,
        token,
        saveTempUsername,
        clearTempUsername,
        saveToken,
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
