/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect, vi } from 'vitest';

import { authReducer, initialState, type AuthState, type AuthAction } from './AuthContext';

import UserProfile from '@/types/auth/UserProfile';

// Mock the isCompleteProfile function
vi.mock('@/utils/auth/complete-signup', () => ({
  isCompleteProfile: vi.fn((user: UserProfile) => !!(user.firstName && user.lastName)),
}));

// Mock navigation to avoid import issues
vi.mock('@/utils/navigation', () => ({
  ROUTES: {
    HOME: '/',
    COMPLETE_SIGNUP: '/complete-signup',
    LOGIN: '/login',
  },
}));

describe('authReducer', () => {
  const mockUser: UserProfile = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    createdAt: '2023-01-01T00:00:00Z',
    requiredFields: [],
    announcement: {
      id: '1',
      type: 'auth-onboarding' as any,
    },
    consents: {},
  };

  const mockIncompleteUser: UserProfile = {
    id: '2',
    firstName: '',
    lastName: '',
    email: 'incomplete@example.com',
    createdAt: '2023-01-01T00:00:00Z',
    requiredFields: [],
    announcement: {
      id: '1',
      type: 'auth-onboarding' as any,
    },
    consents: {},
  };

  it('should return initial state for unknown action', () => {
    const action = { type: 'UNKNOWN' } as any;
    const result = authReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  describe('SET_LOADING action', () => {
    it('should set loading to true', () => {
      const action: AuthAction = { type: 'SET_LOADING', payload: true };
      const result = authReducer(initialState, action);
      expect(result.isLoading).toBe(true);
      expect(result).toEqual({ ...initialState, isLoading: true });
    });

    it('should set loading to false', () => {
      const loadingState: AuthState = { ...initialState, isLoading: true };
      const action: AuthAction = { type: 'SET_LOADING', payload: false };
      const result = authReducer(loadingState, action);
      expect(result.isLoading).toBe(false);
    });
  });

  describe('SET_USER action', () => {
    it('should set user and mark as authenticated with complete profile', () => {
      const action: AuthAction = { type: 'SET_USER', payload: mockUser };
      const result = authReducer(initialState, action);

      expect(result.user).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
      expect(result.isProfileComplete).toBe(true);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(null);
    });

    it('should set user and mark as authenticated with incomplete profile', () => {
      const action: AuthAction = { type: 'SET_USER', payload: mockIncompleteUser };
      const result = authReducer(initialState, action);

      expect(result.user).toEqual(mockIncompleteUser);
      expect(result.isAuthenticated).toBe(true);
      expect(result.isProfileComplete).toBe(false);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(null);
    });

    it('should handle null user (logout scenario)', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        isProfileComplete: true,
      };
      const action: AuthAction = { type: 'SET_USER', payload: null };
      const result = authReducer(authenticatedState, action);

      expect(result.user).toBe(null);
      expect(result.isAuthenticated).toBe(false);
      expect(result.isProfileComplete).toBe(false);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(null);
    });
  });

  describe('SET_ERROR action', () => {
    it('should set error message and stop loading', () => {
      const loadingState: AuthState = { ...initialState, isLoading: true };
      const action: AuthAction = { type: 'SET_ERROR', payload: 'Network error' };
      const result = authReducer(loadingState, action);

      expect(result.error).toBe('Network error');
      expect(result.isLoading).toBe(false);
      expect(result.user).toBe(null);
      expect(result.isAuthenticated).toBe(false);
    });

    it('should clear error with null payload', () => {
      const errorState: AuthState = { ...initialState, error: 'Previous error' };
      const action: AuthAction = { type: 'SET_ERROR', payload: null };
      const result = authReducer(errorState, action);

      expect(result.error).toBe(null);
      expect(result.isLoading).toBe(false);
    });
  });

  describe('SET_PROFILE_COMPLETE action', () => {
    it('should set profile complete to true', () => {
      const action: AuthAction = { type: 'SET_PROFILE_COMPLETE', payload: true };
      const result = authReducer(initialState, action);
      expect(result.isProfileComplete).toBe(true);
    });

    it('should set profile complete to false', () => {
      const completeState: AuthState = { ...initialState, isProfileComplete: true };
      const action: AuthAction = { type: 'SET_PROFILE_COMPLETE', payload: false };
      const result = authReducer(completeState, action);
      expect(result.isProfileComplete).toBe(false);
    });
  });

  describe('LOGOUT action', () => {
    it('should reset to initial state but with loading false', () => {
      const authenticatedState: AuthState = {
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: 'Some error',
        isProfileComplete: true,
      };
      const action: AuthAction = { type: 'LOGOUT' };
      const result = authReducer(authenticatedState, action);

      expect(result).toEqual({ ...initialState, isLoading: false });
    });
  });

  describe('State transitions', () => {
    it('should handle login -> logout flow', () => {
      // Login
      const loginAction: AuthAction = { type: 'SET_USER', payload: mockUser };
      const afterLogin = authReducer(initialState, loginAction);
      expect(afterLogin.isAuthenticated).toBe(true);

      // Logout
      const logoutAction: AuthAction = { type: 'LOGOUT' };
      const afterLogout = authReducer(afterLogin, logoutAction);
      expect(afterLogout.isAuthenticated).toBe(false);
      expect(afterLogout.user).toBe(null);
    });

    it('should handle loading -> error flow', () => {
      // Start loading
      const loadingAction: AuthAction = { type: 'SET_LOADING', payload: true };
      const afterLoading = authReducer(initialState, loadingAction);
      expect(afterLoading.isLoading).toBe(true);

      // Error occurs
      const errorAction: AuthAction = { type: 'SET_ERROR', payload: 'Failed to load' };
      const afterError = authReducer(afterLoading, errorAction);
      expect(afterError.isLoading).toBe(false);
      expect(afterError.error).toBe('Failed to load');
    });
  });
});
