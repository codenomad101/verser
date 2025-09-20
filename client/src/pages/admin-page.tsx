import React from 'react';
import { AdminRoute } from '../components/admin-route';
import { AdminDashboard } from '../components/admin-dashboard';

export function AdminPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
