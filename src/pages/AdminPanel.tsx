import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.email === 'geokullo@gmail.com';

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminPanel;