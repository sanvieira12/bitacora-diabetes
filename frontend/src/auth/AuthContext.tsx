import React, { createContext, useState, useCallback } from 'react';
import { authApi } from '../api/auth';

export const TOKEN_KEY = 'gluconoche_token';
const MUST_CHANGE_KEY = 'gluconoche_must_change';

interface AuthContextType {
  isAuthenticated: boolean;
  mustChangePin: boolean;
  login: (pin: string) => Promise<void>;
  logout: () => void;
  changePin: (currentPin: string, newPin: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem(TOKEN_KEY)
  );
  const [mustChangePin, setMustChangePin] = useState(
    () => sessionStorage.getItem(MUST_CHANGE_KEY) === 'true'
  );

  const login = useCallback(async (pin: string) => {
    const response = await authApi.login(pin);
    sessionStorage.setItem(TOKEN_KEY, response.token);
    sessionStorage.setItem(MUST_CHANGE_KEY, String(response.mustChangePin));
    setIsAuthenticated(true);
    setMustChangePin(response.mustChangePin);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(MUST_CHANGE_KEY);
    setIsAuthenticated(false);
    setMustChangePin(false);
  }, []);

  const changePin = useCallback(async (currentPin: string, newPin: string) => {
    await authApi.changePin(currentPin, newPin);
    sessionStorage.setItem(MUST_CHANGE_KEY, 'false');
    setMustChangePin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, mustChangePin, login, logout, changePin }}>
      {children}
    </AuthContext.Provider>
  );
}
