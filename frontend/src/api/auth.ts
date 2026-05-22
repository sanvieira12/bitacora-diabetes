import client from './client';
import type { ApiResponse } from '../types';

interface LoginResponse {
  token: string;
  mustChangePin: boolean;
}

interface AuthStatus {
  mustChangePin: boolean;
  locked: boolean;
  lockedUntil?: string;
}

export const authApi = {
  login: async (pin: string): Promise<LoginResponse> => {
    const res = await client.post<ApiResponse<LoginResponse>>('/api/auth/login', { pin });
    return res.data.data;
  },

  changePin: async (currentPin: string, newPin: string): Promise<void> => {
    await client.post('/api/auth/change-pin', { currentPin, newPin });
  },

  getStatus: async (): Promise<AuthStatus> => {
    const res = await client.get<ApiResponse<AuthStatus>>('/api/auth/status');
    return res.data.data;
  },
};
