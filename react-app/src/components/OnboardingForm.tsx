import React, { useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';

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
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
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
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
        break;
      case 2:
        if (!formData.github.trim()) newErrors.github = 'GitHub profile is required';
        if (!formData.linkedin.trim()) newErrors.linkedin = 'LinkedIn profile is required';
        if (!formData.resume) newErrors.resume = 'Resume is required';
        break;
      case 3:
        if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
        if (!formData.education.trim()) newErrors.education = 'Education is required';
        if (!formData.about.trim()) newErrors.about = 'About section is required';
        break;
      case 4:
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
      if (step < 4) {
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
            <h3 className="text-2xl font-bold text-violet-300">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-violet-200 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.name ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.location ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  required
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.experience ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  required
                />
                {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Profile Photo</label>
                <div className="flex items-center space-x-4">
                  <input
                    ref={photoRef}
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="px-4 py-2 rounded-lg bg-gray-800/50 border border-violet-500/20 text-violet-200 hover:bg-gray-800/70 transition-all duration-300"
                  >
                    Choose Photo
                  </button>
                  {formData.photo && (
                    <span className="text-violet-200">{formData.photo.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-violet-300">Professional Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-violet-200 mb-2">GitHub Profile</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.github ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  required
                />
                {errors.github && <p className="text-red-500 text-sm mt-1">{errors.github}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.linkedin ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  required
                />
                {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Resume</label>
                <div className="flex items-center space-x-4">
                  <input
                    ref={resumeRef}
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => resumeRef.current?.click()}
                    className="px-4 py-2 rounded-lg bg-gray-800/50 border border-violet-500/20 text-violet-200 hover:bg-gray-800/70 transition-all duration-300"
                  >
                    Choose Resume
                  </button>
                  {formData.resume && (
                    <span className="text-violet-200">{formData.resume.name}</span>
                  )}
                </div>
                {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Portfolio/Website</label>
                <input
                  type="url"
                  name="socialLinks.portfolio"
                  value={formData.socialLinks.portfolio || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-violet-500/20 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-violet-300">Skills & Education</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-violet-200 mb-2">Skills (comma separated)</label>
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
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.skills ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                />
                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Education</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.education ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  rows={3}
                  required
                />
                {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">About You</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.about ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  rows={4}
                  required
                />
                {errors.about && <p className="text-red-500 text-sm mt-1">{errors.about}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Key Achievements</label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-violet-500/20 text-white focus:outline-none focus:border-violet-500"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-violet-300">Job Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-violet-200 mb-2">Desired Role</label>
                <input
                  type="text"
                  name="jobPreferences.role"
                  value={formData.jobPreferences.role}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.jobPreferences ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  required
                />
                {errors.jobPreferences && <p className="text-red-500 text-sm mt-1">{errors.jobPreferences}</p>}
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Desired Salary</label>
                <input
                  type="text"
                  name="jobPreferences.salary"
                  value={formData.jobPreferences.salary}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.jobPreferences ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  required
                />
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Remote Work Preference</label>
                <select
                  name="jobPreferences.remote"
                  value={formData.jobPreferences.remote}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800/50 border ${
                    errors.jobPreferences ? 'border-red-500' : 'border-violet-500/20'
                  } text-white focus:outline-none focus:border-violet-500`}
                  required
                >
                  <option value="">Select preference</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
              <div>
                <label className="block text-violet-200 mb-2">Desired Company Size</label>
                <div className="space-y-2">
                  {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map(size => (
                    <label key={size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="jobPreferences.companySize"
                        value={size}
                        checked={formData.jobPreferences.companySize.includes(size)}
                        onChange={handleMultiSelect}
                        className="rounded border-violet-500/20 text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-violet-200">{size} employees</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-violet-200 mb-2">What are you looking for?</label>
                <div className="space-y-2">
                  {[
                    'To build products',
                    'Progression to management',
                    'Employees wear a lot of hats',
                    'Company with good growth trajectory',
                    'Challenging problems to work on',
                    'Flexible remote work policy'
                  ].map(want => (
                    <label key={want} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="jobPreferences.wants"
                        value={want}
                        checked={formData.jobPreferences.wants.includes(want)}
                        onChange={handleMultiSelect}
                        className="rounded border-violet-500/20 text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-violet-200">{want}</span>
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
    <animated.form onSubmit={handleSubmit} style={spring} className="max-w-2xl mx-auto p-8 bg-gray-900/50 rounded-2xl border border-violet-500/20 backdrop-blur-sm">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s <= step ? 'bg-violet-500' : 'bg-gray-800'
              }`}
            >
              <span className="text-sm font-medium">{s}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-gray-800 rounded-full">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {renderStep()}

      <div className="mt-8 flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(prev => prev - 1)}
            className="px-6 py-3 rounded-lg bg-gray-800/50 border border-violet-500/20 text-violet-200 hover:bg-gray-800/70 transition-all duration-300"
          >
            Previous
          </button>
        )}
        <button
          type="submit"
          className="ml-auto px-6 py-3 rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition-all duration-300"
        >
          {step === 4 ? 'Complete Profile' : 'Next'}
        </button>
      </div>
    </animated.form>
  );
};

export default OnboardingForm; 