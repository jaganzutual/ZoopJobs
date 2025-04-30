import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../services/userService/userService';
import { UserProfile } from '../../types/user';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';

const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userData = await getCurrentUser();
        // If we have user data, handle navigation based on onboarding status
        if (userData) {
          handleNavigation(userData);
        } else {
          // If no user data, default to landing page
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // In case of error, default to landing page
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [navigate, location.pathname]);

  const handleNavigation = (userData: UserProfile) => {
    const currentPath = location.pathname;

    // Don't redirect if user is already on the correct path
    if (
      (currentPath === '/dashboard' && userData.onboarding_status === 'completed') ||
      (currentPath === '/onboarding' && userData.onboarding_status === 'partial') ||
      (currentPath === '/' && userData.onboarding_status === 'not_started')
    ) {
      return;
    }

    // Redirect based on onboarding status
    switch (userData.onboarding_status) {
      case 'completed':
        navigate('/dashboard');
        break;
      case 'partial':
        navigate('/onboarding');
        break;
      case 'not_started':
      default:
        navigate('/');
        break;
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};

export default RouteGuard; 