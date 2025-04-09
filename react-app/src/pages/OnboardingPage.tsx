import React from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from '../components/OnboardingForm';
import { useSpring, animated } from '@react-spring/web';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [spring] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 }
  }));

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed:', data);
    // Here you would typically send the data to your backend
    // and then redirect to the appropriate page
    navigate('/dashboard'); // or wherever you want to redirect after onboarding
  };

  return (
    <animated.div style={spring} className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-violet-300 mb-4">Complete Your Profile</h1>
          <p className="text-violet-200">Let's get to know you better to find the perfect job match</p>
        </div>
        <OnboardingForm onComplete={handleOnboardingComplete} />
      </div>
    </animated.div>
  );
};

export default OnboardingPage; 