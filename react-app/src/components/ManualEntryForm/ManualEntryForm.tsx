import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import apiService from '../../services/apiService/apiService';
import { ONBOARDING_MANUAL_ENDPOINT } from '../../services/apiService/apiEndpoints';

interface ManualEntryFormProps {
  onComplete: (data: any) => void;
  onBackToResume: () => void;
}

interface FormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    location: string;
    role: string;
    experience: string;
    student: boolean;
    jobTitle: string;
    company: string;
    linkedin: string;
    website: string;
    employed: boolean;
  };
  preferences: Record<string, any>;
  culture: Record<string, any>;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onComplete, onBackToResume }) => {
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      location: '',
      role: '',
      experience: '',
      student: false,
      jobTitle: '',
      company: '',
      linkedin: '',
      website: '',
      employed: true
    },
    preferences: {},
    culture: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [currentSection, setCurrentSection] = useState<'profile' | 'preferences' | 'culture'>('profile');

  const [spring] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 60 }
  }));

  const handleInputChange = (section: keyof FormData, field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convert form data to API format
      const profileData = {
        first_name: formData.personalInfo.firstName,
        last_name: formData.personalInfo.lastName,
        location: formData.personalInfo.location,
        role: formData.personalInfo.role,
        experience: formData.personalInfo.experience,
        is_student: formData.personalInfo.student,
        job_title: formData.personalInfo.jobTitle,
        company: formData.personalInfo.company,
        linkedin: formData.personalInfo.linkedin,
        website: formData.personalInfo.website,
        is_employed: formData.personalInfo.employed
      };

      // Submit to backend API using apiService
      const response = await apiService.post(ONBOARDING_MANUAL_ENDPOINT, profileData);
      
      // Call the onComplete callback with the response data
      onComplete(response);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
          <input
            type="text"
            value={formData.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            placeholder="First Name"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
          <input
            type="text"
            value={formData.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            placeholder="Last Name"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Where are you based?</label>
        <input
          type="text"
          value={formData.personalInfo.location}
          onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
          placeholder="City, State, or Country"
          className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Current Role</label>
          <input
            type="text"
            value={formData.personalInfo.role}
            onChange={(e) => handleInputChange('personalInfo', 'role', e.target.value)}
            placeholder="E.g. Software Engineer"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Years of Experience</label>
          <input
            type="text"
            value={formData.personalInfo.experience}
            onChange={(e) => handleInputChange('personalInfo', 'experience', e.target.value)}
            placeholder="E.g. 3"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="block text-sm font-medium text-slate-300">Are you a student or new grad?</label>
        <div className="flex items-center gap-2">
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.personalInfo.student}
              onChange={() => handleInputChange('personalInfo', 'student', true)}
              className="h-4 w-4 text-blue-600 border-slate-700 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-300">Yes</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!formData.personalInfo.student}
              onChange={() => handleInputChange('personalInfo', 'student', false)}
              className="h-4 w-4 text-blue-600 border-slate-700 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-300">No</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Current Job Title</label>
          <input
            type="text"
            value={formData.personalInfo.jobTitle}
            onChange={(e) => handleInputChange('personalInfo', 'jobTitle', e.target.value)}
            placeholder="e.g., Design Director"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Current Company</label>
          <input
            type="text"
            value={formData.personalInfo.company}
            onChange={(e) => handleInputChange('personalInfo', 'company', e.target.value)}
            placeholder="e.g., Omnicorp"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={!formData.personalInfo.employed}
          onChange={(e) => handleInputChange('personalInfo', 'employed', !e.target.checked)}
          className="h-4 w-4 text-blue-600 border-slate-700 focus:ring-blue-500"
        />
        <label className="text-sm text-slate-300">I'm not currently employed</label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn Profile</label>
          <input
            type="url"
            value={formData.personalInfo.linkedin}
            onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Your Website</label>
          <input
            type="url"
            value={formData.personalInfo.website}
            onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
            placeholder="https://mypersonalwebsite.com"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <animated.form onSubmit={handleSubmit} style={spring} className="space-y-8">
      {currentSection === 'profile' && renderProfileSection()}

      {error && (
        <div className="text-red-400 bg-red-900/20 px-4 py-3 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <div className="flex items-center gap-4">
          {currentSection !== 'profile' && (
            <button
              type="button"
              onClick={() => setCurrentSection('profile')}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors duration-300"
              disabled={isSubmitting}
            >
              Previous
            </button>
          )}
          
          <button
            type="button"
            onClick={onBackToResume}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors duration-300 flex items-center"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Resume Upload
          </button>
        </div>
        
        {currentSection === 'profile' && (
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Complete Profile
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </animated.form>
  );
};

export default ManualEntryForm; 