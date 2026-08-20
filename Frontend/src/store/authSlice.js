import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('token') || null;

const initialState = {
  user: null,
  token: initialToken,
  isAuthenticated: false,
  loading: true, // starts true until hydration check finishes
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // When user logs in or registers successfully
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      if (token) {
        localStorage.setItem('token', token);
      }
    },
    // When user profile is hydrated from token
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },
    // Set loading state during verification
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Set authentication errors
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, setUser, setLoading, setError, logout } = authSlice.actions;

export default authSlice.reducer;
