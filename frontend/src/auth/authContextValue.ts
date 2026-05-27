import { createContext } from 'react';

export const TOKEN_KEY = 'gluconoche_token';
export const MUST_CHANGE_KEY = 'gluconoche_must_change';

export interface AuthContextType {
  isAuthenticated: boolean;
  mustChangePin: boolean;
  login: (pin: string) => Promise<void>;
  logout: () => void;
  changePin: (currentPin: string, newPin: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
