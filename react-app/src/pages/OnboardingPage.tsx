import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from '../components/OnboardingForm';
import ResumeUploadForm from '../components/ResumeUploadForm';
import { ResumeParseResponse } from '../services/resumeService';
import { useSpring, animated } from '@react-spring/web';
import ManualEntryForm from '../components/ManualEntryForm';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeParseResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [showManualForm, setShowManualForm] = useState<boolean>(false);
  
  const [spring] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 60 }
  }));

  const [formSpring] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 60 },
    delay: 200
  }));

  const handleResumeDataLoaded = (data: ResumeParseResponse) => {
    setResumeData(data);
    setError('');
    setShowManualForm(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed:', data);
    navigate('/dashboard');
  };

  const handleManualEntryClick = () => {
    setShowManualForm(true);
    setResumeData(null);
  };

  const handleBackToResume = () => {
    setShowManualForm(false);
    setResumeData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <animated.div style={spring} className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Complete Your <span className="text-blue-400">Profile</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Upload your resume to automatically populate your profile, or enter your details manually.
          </p>
        </animated.div>

        <div className="grid grid-cols-1 gap-10">
          {!showManualForm ? (
            <animated.div style={spring}>
              <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
                    <svg className="w-7 h-7 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Upload Your Resume
                  </h2>
                  <p className="text-slate-300 mb-6 text-lg">
                    We'll extract your skills, experience, and education details from your resume to save you time.
                  </p>
                  <ResumeUploadForm
                    onResumeDataLoaded={handleResumeDataLoaded}
                    onError={handleError}
                  />
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleManualEntryClick}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      Prefer to enter details manually?
                    </button>
                  </div>
                </div>
              </div>
            </animated.div>
          ) : (
            <animated.div style={formSpring}>
              <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                      <svg className="w-7 h-7 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Enter Your Details
                    </h2>
                  </div>
                  <ManualEntryForm
                    onComplete={handleOnboardingComplete}
                    onBackToResume={handleBackToResume}
                  />
                </div>
              </div>
            </animated.div>
          )}

          {error && (
            <animated.div style={spring} className="backdrop-blur-sm bg-red-900/20 border border-red-500/50 rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-300 text-base">{error}</p>
              </div>
            </animated.div>
          )}
        </div>
        
        <div className="text-center text-slate-400 text-sm mt-12">
          <p>Your information is secure and will only be used to match you with suitable job opportunities.</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage; 