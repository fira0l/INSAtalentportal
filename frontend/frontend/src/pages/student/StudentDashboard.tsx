import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Clock, CheckCircle, XCircle } from 'lucide-react';

export const StudentDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const getStatusDisplay = () => {
    if (!user) return null;

    switch (user.approvalStatus) {
      case 'pending':
        return {
          icon: <Clock className="w-12 h-12 text-yellow-500" />,
          title: 'Application Pending',
          message: 'Your registration is currently under review by an administrator. Please check back later for an update.',
          bgColor: 'bg-yellow-50',
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          title: 'Application Approved!',
          message: 'Welcome to the INSA Talent Portal! Your account is fully active. You can now explore all the features available to you.',
          bgColor: 'bg-green-50',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: 'Application Rejected',
          message: 'We regret to inform you that your registration has been rejected. If you believe this is a mistake, please contact an administrator.',
          bgColor: 'bg-red-50',
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Talent Portal</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {statusDisplay && (
          <div className={`rounded-lg shadow-sm p-8 text-center ${statusDisplay.bgColor}`}>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow">
              {statusDisplay.icon}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{statusDisplay.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{statusDisplay.message}</p>
          </div>
        )}

        {user?.approvalStatus === 'approved' && (
            <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h3>
                <p className="text-gray-600">
                    Your profile is approved! You can now access all the features of the portal.
                    (Further components for news, certificates, etc. would be displayed here.)
                </p>
            </div>
        )}
      </main>
    </div>
  );
};