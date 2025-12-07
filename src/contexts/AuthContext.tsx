'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ProfileResponse, ProfileResponseSchema, LookupOptionSchema } from '../schemas/profileSchemas';
import { z } from 'zod';
import { getUserIdFromToken, isTokenExpired } from '../utils/jwtUtils';
import { getProfile } from '../api/auth';
import { getOptions } from '@/api/user';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ProfileResponse | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUser: (user: ProfileResponse['customer']) => Promise<void>;
  lookUpOptions: LookUpOptions;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

interface LookUpOptions {
  genders: z.infer<typeof LookupOptionSchema>[];
  companies: z.infer<typeof LookupOptionSchema>[];
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<ProfileResponse | null>(null);
  const [lookUpOptions, setLookUpOptions] = useState<LookUpOptions>({
    genders: [],
    companies: [],
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
    getOptions().then((options) => {
      setLookUpOptions({
        genders: options.genders,
        companies: options.companies,
      });
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const accessToken = sessionStorage.getItem('accessToken');

      if (!accessToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(accessToken)) {
        // Token is expired, clear storage and logout
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Token is valid, fetch user data
      await refreshUserData();
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const login = async (accessToken: string, refreshToken: string) => {
    try {
      if (typeof window === 'undefined') return;

      // Store tokens
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);

      // Fetch user data
      await refreshUserData();
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshUserData = async () => {
    try {
      if (typeof window === 'undefined') return;

      const accessToken = sessionStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Get user ID from token
      const userId = getUserIdFromToken(accessToken);
      if (!userId) {
        throw new Error('Unable to extract user ID from token');
      }

      // Fetch user profile
      const profileData = await getProfile(userId);

      // Validate the response with Zod
      const validatedProfile = ProfileResponseSchema.parse(profileData);

      setUser(validatedProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If there's an error, logout the user
      logout();
      throw new Error("Error fetching user data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (customer: ProfileResponse['customer']) => {
    setUser((prev) => (prev ? { ...prev, customer } : prev));
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshUserData,
    updateUser,
    lookUpOptions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
