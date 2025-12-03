import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  tempEmail: string | null;
  saveTempEmail: (email: string) => void;
  getTempEmail: () => string | null;
  clearTempEmail: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tempEmail, setTempEmail] = useState<string | null>(null);

  const saveTempEmail = (email: string) => {
    setTempEmail(email);
  };

  const getTempEmail = (): string | null => {
    return tempEmail;
  };

  const clearTempEmail = () => {
    setTempEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        tempEmail,
        saveTempEmail,
        getTempEmail,
        clearTempEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};