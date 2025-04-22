import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService/apiService';
import Logo from '../../assets/images/zoopjobs-logo.svg';
import { UserProfile } from '../../types/user';
import { AxiosError } from 'axios';
import { USER_CURRENT_ENDPOINT } from '../../services/apiService/apiEndpoints';

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      const startTime = Date.now();
      
      try {
        const userData = await apiService.get<UserProfile>(USER_CURRENT_ENDPOINT);

        // Calculate remaining time to ensure minimum 2 second delay
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1000 - elapsedTime);

        // Wait for remaining time if needed
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        // Navigate based on onboarding status
        switch (userData.onboarding_status) {
          case 'completed':
            navigate('/dashboard');
            break;
          case 'partial':
            navigate('/onboarding');
            break;
          case 'not_started':
          default:
            navigate('/landing');
            break;
        }
      } catch (error) {
        // Calculate remaining time for error case as well
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 2000 - elapsedTime);

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        if (error instanceof AxiosError && error.response?.status === 404) {
          // If user not found, redirect to landing page
          navigate('/landing');
        } else {
          console.error('Error checking user status:', error);
          // For any other error, also redirect to landing page
          navigate('/landing');
        }
      }
    };

    checkUserStatus();
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 flex flex-col items-center justify-center">
      <img src={Logo} alt="ZoopJobs Logo" className="h-16 mb-8 animate-pulse" />
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-violet-500 border-solid rounded-full opacity-20"></div>
      </div>
      <p className="mt-6 text-violet-200 text-lg">Loading your experience...</p>
    </div>
  );
};

export default LoadingPage; 