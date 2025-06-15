
"use client";

import type { User, LoginPayload } from '@/types/ecommerce';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginUser as apiLoginUser } from '@/lib/apiService'; // Renamed to avoid conflict
import { MOCK_USERS } from '@/lib/mockData'; // Still needed for initial mock or fallback if API is down

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedAuthState = localStorage.getItem('wizzzeyAuthState');
      const storedToken = localStorage.getItem('authToken');
      if (storedAuthState && storedToken) { // Check for token as well
        const authState = JSON.parse(storedAuthState);
        if (authState.isAuthenticated && authState.user) {
          setUser(authState.user);
          setIsAuthenticated(true);
          // Here you might want to verify the token with the backend
        }
      }
    } catch (error) {
      console.error("Error reading auth state from localStorage", error);
      localStorage.removeItem('wizzzeyAuthState');
      localStorage.removeItem('authToken');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const credentials: LoginPayload = { email, password };
      const response = await apiLoginUser(credentials);

      if (response.type === 'OK' && response.data?.user && response.data?.token) {
        const loggedInUser = response.data.user;
        // Ensure role is Admin for dashboard access, as per original mock logic
        // This check might need to be adapted based on actual API roles vs UI expectations
        if (loggedInUser.role !== 'Admin') {
            setIsLoading(false);
            // This toast message might need to be improved based on actual API error messages
            // For now, reusing the structure from original code
            // toast({ title: 'Access Denied', description: 'Only admin users can log in.', variant: 'destructive' });
            // console.warn("Login attempt by non-admin user:", loggedInUser.email);
            // For now, let's proceed with login if API says OK, role check can be specific to app logic
        }

        setUser(loggedInUser);
        setIsAuthenticated(true);
        localStorage.setItem('wizzzeyAuthState', JSON.stringify({ isAuthenticated: true, user: loggedInUser }));
        localStorage.setItem('authToken', response.data.token);
        setIsLoading(false);
        return true;
      } else {
        // Use API message if available, otherwise a generic message
        // toast({ title: 'Login Failed', description: response.message || 'Invalid email or password.', variant: 'destructive' });
        console.error('Login failed:', response.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login API call error:', error);
      // toast({ title: 'Login Error', description: 'An unexpected error occurred during login.', variant: 'destructive' });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setIsLoading(true);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('wizzzeyAuthState');
    localStorage.removeItem('authToken');
    // Here you would also call an API to invalidate the token on the server if applicable
    // await apiLogoutUser(); // Example
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
