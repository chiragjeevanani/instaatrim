import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAdmin } from '../context/AdminContext';

export const AdminLayout = () => {
  const { isAuthenticated, theme } = useAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const themeClass = theme === 'light' ? 'admin-theme-light' : 'admin-theme-dark';

  return (
    <div className={`min-h-screen ${themeClass} flex transition-colors duration-200`}>
      {/* Fixed Left Sidebar */}
      <AdminSidebar />

      {/* Main Desktop Dashboard Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};
