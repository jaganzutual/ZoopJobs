import React, { useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { ResumeParseResponse } from '../services/resumeService';

interface JobPreferences {
  role: string;
  salary: string;
  remote: string;
  location: string;
  companySize: string[];
  wants: string[];
}

interface SocialLinks {
  twitter?: string;
  portfolio?: string;
  other?: string;
}

interface FormData {
  name: string;
  location: string;
  experience: string;
  photo: File | null;
  github: string;
  linkedin: string;
  resume: File | null;
  skills: string[];
  education: string;
  achievements: string;
  jobPreferences: JobPreferences;
  about: string;
  timezone: string;
  availability: string;
  socialLinks: SocialLinks;
}

interface OnboardingFormProps {
  onComplete: (data: FormData) => void;
  initialData?: ResumeParseResponse | null;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    experience: '',
    photo: null,
    github: '',
    linkedin: '',
    resume: null,
    skills: [],
    education: '',
    achievements: '',
    about: '',
    timezone: '',
    availability: '',
    socialLinks: {},
    jobPreferences: {
      role: '',
      salary: '',
      remote: '',
      location: '',
      companySize: [],
      wants: []
    }
  });

  // Update form data when resume data is loaded
  React.useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        name: initialData.personal_info?.name || prevData.name,
        location: initialData.personal_info?.location || prevData.location,
        skills: initialData.skills?.map(skill => skill.name || '').filter(Boolean) || prevData.skills,
        github: prevData.github, // No github in ResumeParseResponse
        linkedin: initialData.personal_info?.linkedin || prevData.linkedin,
        education: initialData.education?.map(edu => 
          `${edu.institution || ''} - ${edu.degree || ''} (${edu.start_date || ''})`
        ).join('\n') || prevData.education,
        experience: initialData.work_experience?.length 
          ? String(initialData.work_experience?.length) 
          : prevData.experience,
      }));
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [spring, api] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 }
  }));

  const photoRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (currentStep) {
      case 1:
        if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
        if (!formData.education.trim()) newErrors.education = 'Education is required';
        if (!formData.about.trim()) newErrors.about = 'About section is required';
        break;
      case 2:
        if (!formData.jobPreferences.role.trim()) newErrors.jobPreferences = 'Desired role is required';
        if (!formData.jobPreferences.salary.trim()) newErrors.jobPreferences = 'Desired salary is required';
        if (!formData.jobPreferences.remote) newErrors.jobPreferences = 'Remote preference is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'jobPreferences') {
        setFormData(prev => ({
          ...prev,
          jobPreferences: {
            ...prev.jobPreferences,
            [child]: value
          }
        }));
      } else if (parent === 'socialLinks') {
        setFormData(prev => ({
          ...prev,
          socialLinks: {
            ...prev.socialLinks,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [e.target.name]: file }));
      // Clear error when file is selected
      if (errors[e.target.name as keyof FormData]) {
        setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
      }
    }
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'jobPreferences') {
        setFormData(prev => ({
          ...prev,
          jobPreferences: {
            ...prev.jobPreferences,
            [child]: checked
              ? [...prev.jobPreferences[child as keyof JobPreferences] as string[], value]
              : (prev.jobPreferences[child as keyof JobPreferences] as string[]).filter(item => item !== value)
          }
        }));
      }
    } else if (name === 'skills') {
      setFormData(prev => ({
        ...prev,
        skills: checked
          ? [...prev.skills, value]
          : prev.skills.filter(item => item !== value)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      if (step < 2) {
        setStep(prev => prev + 1);
        api.start({
          from: { opacity: 0, y: 20 },
          to: { opacity: 1, y: 0 }
        });
      } else {
        onComplete(formData);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              Skills & Experience
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-slate-200 mb-2 font-medium">Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills.join(', ')}
                  onChange={(e) => {
                    const skills = e.target.value.split(',').map(skill => skill.trim());
                    setFormData(prev => ({ ...prev, skills }));
                    if (errors.skills) {
                      setErrors(prev => ({ ...prev, skills: undefined }));
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/40 border ${
                    errors.skills ? 'border-red-500' : 'border-slate-600'
                  } text-white focus:outline-none focus:border-blue-400 transition-colors duration-200`}
                  placeholder="e.g. React, JavaScript, UI Design"
                />
                {errors.skills && <p className="text-red-400 text-sm mt-1">{errors.skills}</p>}
              </div>
              <div>
                <label className="block text-slate-200 mb-2 font-medium">Education</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/40 border ${
                    errors.education ? 'border-red-500' : 'border-slate-600'
                  } text-white focus:outline-none focus:border-blue-400 transition-colors duration-200`}
                  rows={3}
                  required
                  placeholder="Your educational background"
                />
                {errors.education && <p className="text-red-400 text-sm mt-1">{errors.education}</p>}
              </div>
              <div>
                <label className="block text-slate-200 mb-2 font-medium">About You</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/40 border ${
                    errors.about ? 'border-red-500' : 'border-slate-600'
                  } text-white focus:outline-none focus:border-blue-400 transition-colors duration-200`}
                  rows={4}
                  required
                  placeholder="Tell us about yourself, your background, and what you're looking for"
                />
                {errors.about && <p className="text-red-400 text-sm mt-1">{errors.about}</p>}
              </div>
              <div>
                <label className="block text-slate-200 mb-2 font-medium">Key Achievements</label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/40 border border-slate-600 text-white focus:outline-none focus:border-blue-400 transition-colors duration-200"
                  rows={3}
                  placeholder="Notable projects, awards, or accomplishments"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-200 mb-2 font-medium">GitHub Profile</label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/40 border border-slate-600 text-white focus:outline-none focus:border-blue-400 transition-colors duration-200"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <label className="block text-slate-200 mb-2 font-medium">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/40 border border-slate-600 text-white focus:outline-none focus:border-blue-400 transition-colors duration-200"
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Job Preferences
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-slate-200 mb-2 font-medium">Desired Role</label>
                <input
                  type="text"
                  name="jobPreferences.role"
                  value={formData.jobPreferences.role}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/40 border ${
                    errors.jobPreferences ? 'border-red-500' : 'border-slate-600'
                  } text-white focus:outline-none focus:border-blue-400 transition-colors duration-200`}
                  required
                  placeholder="e.g. Frontend Developer, UX Designer"
                />
                {errors.jobPreferences && <p className="text-red-400 text-sm mt-1">{errors.jobPreferences}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-200 mb-2 font-medium">Desired Salary</label>
                  <input
                    type="text"
                    name="jobPreferences.salary"
                    value={formData.jobPreferences.salary}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-slate-800/40 border ${
                      errors.jobPreferences ? 'border-red-500' : 'border-slate-600'
                    } text-white focus:outline-none focus:border-blue-400 transition-colors duration-200`}
                    required
                    placeholder="e.g. $80,000 - $100,000"
                  />
                </div>
                <div>
                  <label className="block text-slate-200 mb-2 font-medium">Remote Work Preference</label>
                  <select
                    name="jobPreferences.remote"
                    value={formData.jobPreferences.remote}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-slate-800/40 border ${
                      errors.jobPreferences ? 'border-red-500' : 'border-slate-600'
                    } text-white focus:outline-none focus:border-blue-400 transition-colors duration-200`}
                    required
                  >
                    <option value="">Select preference</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-slate-200 mb-2 font-medium">Desired Company Size</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map(size => (
                    <label key={size} className="flex items-center space-x-2 bg-slate-800/30 px-3 py-2 rounded-md border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="jobPreferences.companySize"
                        value={size}
                        checked={formData.jobPreferences.companySize.includes(size)}
                        onChange={handleMultiSelect}
                        className="rounded border-slate-500 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-slate-200">{size} employees</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-slate-200 mb-2 font-medium">What are you looking for?</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'To build products',
                    'Progression to management',
                    'Employees wear a lot of hats',
                    'Company with good growth trajectory',
                    'Challenging problems to work on',
                    'Flexible remote work policy'
                  ].map(want => (
                    <label key={want} className="flex items-center space-x-2 bg-slate-800/30 px-3 py-2 rounded-md border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="jobPreferences.wants"
                        value={want}
                        checked={formData.jobPreferences.wants.includes(want)}
                        onChange={handleMultiSelect}
                        className="rounded border-slate-500 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-slate-200">{want}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <animated.form onSubmit={handleSubmit} style={spring} className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                s <= step ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20' : 'bg-slate-800/60 border border-slate-600'
              }`}
            >
              <span className="text-sm font-medium text-white">{s}</span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-slate-800/60 rounded-full mt-2">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {renderStep()}

      <div className="mt-10 flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(prev => prev - 1)}
            className="px-6 py-3 rounded-lg bg-slate-800/60 border border-slate-600 text-slate-200 hover:bg-slate-800 transition-all duration-300 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>
        )}
        <button
          type="submit"
          className="ml-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center"
        >
          {step === 2 ? (
            <>
              Complete Profile
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </>
          ) : (
            <>
              Next
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
              </svg>
            </>
          )}
        </button>
      </div>
    </animated.form>
  );
};

export default OnboardingForm; 