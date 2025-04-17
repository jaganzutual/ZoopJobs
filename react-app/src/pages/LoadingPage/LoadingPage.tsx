import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../assets/images/zoopjobs-logo.svg';
import { UserProfile } from '../../types/user';

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await axios.get<UserProfile>('/api/users/current');
        const userData = response.data;

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
        if (axios.isAxiosError(error) && error.response?.status === 404) {
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