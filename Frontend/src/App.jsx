import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AllRoutes from './routes/allRoutes';
import useAuthHydration from './hooks/useAuthHydration';
import './App.css';

const AppContent = () => {
  useAuthHydration();
  return <AllRoutes />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;