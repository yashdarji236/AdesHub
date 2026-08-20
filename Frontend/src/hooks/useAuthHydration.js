import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout, setLoading } from '../store/authSlice';
import { getMe } from '../services/authService';

export const useAuthHydration = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const hydrateAuth = async () => {
      // 1. Check if token was returned in URL search params (e.g. Google OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      let activeToken = urlToken;

      if (urlToken) {
        // Save token to localStorage
        localStorage.setItem('token', urlToken);
        // Clean URL to remove token from address bar for security
        urlParams.delete('token');
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } else {
        // 2. Otherwise read token from localStorage
        activeToken = localStorage.getItem('token');
      }

      // 3. If token exists, verify with backend and fetch user profile
      if (activeToken) {
        try {
          dispatch(setLoading(true));
          const data = await getMe();
          dispatch(setCredentials({ user: data.user, token: activeToken }));
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          dispatch(logout());
        }
      } else {
        // No token present, complete loading
        dispatch(setLoading(false));
      }
    };

    hydrateAuth();
  }, [dispatch]);
};

export default useAuthHydration;
