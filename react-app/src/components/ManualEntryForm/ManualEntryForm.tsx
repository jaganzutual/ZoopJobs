import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import apiService from '../../services/apiService/apiService';
import { ONBOARDING_MANUAL_ENDPOINT } from '../../services/apiService/apiEndpoints';
import { ResumeParseResponse, saveResume, WorkExperience } from '../../services/resumeService/resumeService';
import { Experience } from '../../types';

interface ManualEntryFormProps {
  onComplete: (data: any) => void;
  onBackToResume?: () => void;
  initialData?: ResumeParseResponse | null;
  fileName?: string;
  onSubmit: (data: FormData) => Promise<void>;
}

interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
  activities?: string;
}

interface Skill {
  name: string;
  category?: string;
}

interface FormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    location: string;
    student: boolean;
    linkedin: string;
    website: string;
  };
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  preferences: Record<string, any>;
  culture: Record<string, any>;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onComplete, initialData, fileName, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      location: '',
      student: false,
      linkedin: '',
      website: ''
    },
    experience: [{
      title: '',
      employmentType: 'Full-time',
      company: '',
      currentlyWorking: true,
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      location: '',
      locationType: 'Hybrid',
      description: ''
    }],
    education: [{
      school: '',
      degree: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      grade: '',
      activities: ''
    }],
    skills: [],
    preferences: {},
    culture: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [spring] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 60 }
  }));

  // Populate form with initialData when it changes
  useEffect(() => {
    console.log('[ManualEntryForm] initialData received:', initialData);
    
    if (initialData) {
      console.log('[ManualEntryForm] Processing initialData for form population');
      
      // Extract first and last name from the full name
      let firstName = '', lastName = '';
      if (initialData?.personal_info?.name) {
        const nameParts = initialData.personal_info.name.split(' ');
        if (nameParts.length > 0) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        }
        console.log('[ManualEntryForm] Extracted name:', { firstName, lastName });
      }

      // Map work experiences
      const mappedExperiences: Experience[] = [];
      
      if (initialData?.work_experience && Array.isArray(initialData.work_experience)) {
        initialData.work_experience.forEach(exp => {
          if (!exp) return;
          
          let startMonth = '', startYear = '';
          let endMonth = '', endYear = '';
          
          if (exp.start_date) {
            const startParts = exp.start_date.split(' ');
            if (startParts.length >= 2) {
              startMonth = startParts[0];
              startYear = startParts[1];
            }
          }
          
          if (exp.end_date) {
            if (exp.end_date.toLowerCase() === 'present') {
              endMonth = '';
              endYear = '';
            } else {
              const endParts = exp.end_date.split(' ');
              if (endParts.length >= 2) {
                endMonth = endParts[0];
                endYear = endParts[1];
              }
            }
          }
          
          mappedExperiences.push({
            title: exp.job_title || '',
            employmentType: 'Full-time',
            company: exp.company || '',
            currentlyWorking: exp.end_date === 'Present',
            startMonth,
            startYear,
            endMonth,
            endYear,
            location: initialData?.personal_info?.location || '',
            locationType: 'Hybrid',
            description: exp.description || ''
          });
        });
      }

      // Map skills
      const mappedSkills = initialData?.skills?.map(skill => ({
        name: skill.name,
        category: skill.category
      })) || [];

      // Map education
      const mappedEducation = initialData?.education?.map(edu => ({
        school: edu.institution || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.field_of_study || '',
        startYear: edu.start_date || '',
        endYear: edu.end_date || '',
        grade: edu.description || '',
        activities: ''
      })) || [];

      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: firstName || prev.personalInfo.firstName,
          lastName: lastName || prev.personalInfo.lastName,
          location: initialData?.personal_info?.location || prev.personalInfo.location,
          linkedin: initialData?.personal_info?.linkedin || prev.personalInfo.linkedin,
          website: initialData?.personal_info?.website || prev.personalInfo.website,
        },
        experience: mappedExperiences.length > 0 ? mappedExperiences : prev.experience,
        education: mappedEducation.length > 0 ? mappedEducation : prev.education,
        skills: mappedSkills
      }));
      
      console.log('[ManualEntryForm] Form data updated successfully');
    }
  }, [initialData]);

  const handleInputChange = (section: keyof FormData, field: string, value: string | boolean, index: number = 0) => {
    if (section === 'personalInfo') {
      setFormData({
        ...formData,
        personalInfo: {
          ...formData.personalInfo,
          [field]: value
        }
      });
    } else if (section === 'experience') {
      const updatedExperiences = [...formData.experience];
      
      // Ensure the index exists in the experiences array
      if (!updatedExperiences[index]) {
        updatedExperiences[index] = {
          title: '',
          employmentType: 'Full-time',
          company: '',
          currentlyWorking: true,
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          location: '',
          locationType: 'Hybrid',
          description: ''
        };
      }
      
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        [field]: value
      };
      
      setFormData({
        ...formData,
        experience: updatedExperiences
      });
    } else if (section === 'education') {
      const updatedEducation = [...formData.education];
      
      // Ensure the index exists in the education array
      if (!updatedEducation[index]) {
        updatedEducation[index] = {
          school: '',
          degree: '',
          fieldOfStudy: '',
          startYear: '',
          endYear: '',
          grade: '',
          activities: ''
        };
      }
      
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      };
      
      setFormData({
        ...formData,
        education: updatedEducation
      });
    } else {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    }
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      personalInfo: ['firstName', 'lastName', 'email'],
      experience: ['company', 'title', 'startMonth', 'startYear', 'description'],
      education: ['school', 'degree', 'fieldOfStudy', 'startYear', 'endYear']
    };

    let isValid = true;
    let missingFields: string[] = [];

    // Validate personal info
    requiredFields.personalInfo.forEach(field => {
      if (!formData.personalInfo[field as keyof typeof formData.personalInfo]) {
        isValid = false;
        missingFields.push(field);
      }
    });

    // Validate experience entries
    formData.experience.forEach((exp, index) => {
      requiredFields.experience.forEach(field => {
        if (!exp[field as keyof Experience]) {
          isValid = false;
          missingFields.push(`Experience ${index + 1} - ${field}`);
        }
      });
    });

    // Validate education entries
    formData.education.forEach((edu, index) => {
      requiredFields.education.forEach(field => {
        if (!edu[field as keyof Education]) {
          isValid = false;
          missingFields.push(`Education ${index + 1} - ${field}`);
        }
      });
    });

    if (!isValid) {
      alert(`Please fill in all required fields:\n${missingFields.join('\n')}`);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
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
            value={formData.experience[0]?.title || ''}
            onChange={(e) => handleInputChange('experience', 'title', e.target.value, 0)}
            placeholder="E.g. Software Engineer"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Employment Type</label>
          <input
            type="text"
            value={formData.experience[0]?.employmentType || ''}
            onChange={(e) => handleInputChange('experience', 'employmentType', e.target.value, 0)}
            placeholder="E.g. Full-time"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Current Company</label>
          <input
            type="text"
            value={formData.experience[0]?.company || ''}
            onChange={(e) => handleInputChange('experience', 'company', e.target.value, 0)}
            placeholder="e.g., Thoughtworks"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={formData.experience[0]?.currentlyWorking || false}
          onChange={(e) => handleInputChange('experience', 'currentlyWorking', e.target.checked, 0)}
          className="h-4 w-4 text-blue-600 border-slate-700 focus:ring-blue-500"
        />
        <label className="text-sm text-slate-300">I am currently working in this role</label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <select
                value={formData.experience[0]?.startMonth || ''}
                onChange={(e) => handleInputChange('experience', 'startMonth', e.target.value, 0)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
            <div>
              <select
                value={formData.experience[0]?.startYear || ''}
                onChange={(e) => handleInputChange('experience', 'startYear', e.target.value, 0)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Year</option>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {!formData.experience[0]?.currentlyWorking && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <select
                  value={formData.experience[0]?.endMonth || ''}
                  onChange={(e) => handleInputChange('experience', 'endMonth', e.target.value, 0)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div>
                <select
                  value={formData.experience[0]?.endYear || ''}
                  onChange={(e) => handleInputChange('experience', 'endYear', e.target.value, 0)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
          <input
            type="text"
            value={formData.experience[0]?.location || ''}
            onChange={(e) => handleInputChange('experience', 'location', e.target.value, 0)}
            placeholder="e.g., Bengaluru, Karnataka, India"
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Location Type</label>
          <select
            value={formData.experience[0]?.locationType || ''}
            onChange={(e) => handleInputChange('experience', 'locationType', e.target.value, 0)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
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

  const renderExperienceSection = () => (
    <div className="space-y-8">
      {formData.experience.map((exp, index) => (
        <div key={index} className="space-y-6 border border-slate-700 rounded-lg p-6 relative">
          {formData.experience.length > 1 && (
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                value={exp.title}
                onChange={(e) => handleInputChange('experience', 'title', e.target.value, index)}
                placeholder="E.g. Software Engineer"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                placeholder="E.g. Thoughtworks"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={exp.currentlyWorking}
              onChange={(e) => handleInputChange('experience', 'currentlyWorking', e.target.checked, index)}
              className="h-4 w-4 text-blue-600 border-slate-700 focus:ring-blue-500"
            />
            <label className="text-sm text-slate-300">I am currently working in this role</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={exp.startMonth}
                  onChange={(e) => handleInputChange('experience', 'startMonth', e.target.value, index)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <select
                  value={exp.startYear}
                  onChange={(e) => handleInputChange('experience', 'startYear', e.target.value, index)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            {!exp.currentlyWorking && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={exp.endMonth}
                    onChange={(e) => handleInputChange('experience', 'endMonth', e.target.value, index)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={exp.endYear}
                    onChange={(e) => handleInputChange('experience', 'endYear', e.target.value, index)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => handleInputChange('experience', 'location', e.target.value, index)}
                placeholder="City, State, Country"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location Type</label>
              <select
                value={exp.locationType}
                onChange={(e) => handleInputChange('experience', 'locationType', e.target.value, index)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addExperience}
        className="w-full py-3 rounded-lg border-2 border-dashed border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors duration-300"
      >
        + Add Another Experience
      </button>
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-8">
      {formData.education.map((edu, index) => (
        <div key={index} className="space-y-6 border border-slate-700 rounded-lg p-6 relative">
          {formData.education.length > 1 && (
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">School/Institution</label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                placeholder="E.g. Stanford University"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                placeholder="E.g. Bachelor of Science"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Field of Study</label>
            <input
              type="text"
              value={edu.fieldOfStudy}
              onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
              placeholder="E.g. Computer Science"
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Year</label>
              <select
                value={edu.startYear}
                onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">End Year</label>
              <select
                value={edu.endYear}
                onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Grade/GPA</label>
            <input
              type="text"
              value={edu.grade}
              onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
              placeholder="E.g. 3.8/4.0"
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Activities and Societies</label>
            <textarea
              value={edu.activities}
              onChange={(e) => handleEducationChange(index, 'activities', e.target.value)}
              rows={3}
              placeholder="E.g. Student Government, Robotics Club, etc."
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEducation}
        className="w-full py-3 rounded-lg border-2 border-dashed border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors duration-300"
      >
        + Add Another Education
      </button>
    </div>
  );

  const renderSkillsSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Skills</label>
        <div className="space-y-4">
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-4">
              <input
                type="text"
                value={skill.name}
                onChange={(e) => {
                  const newSkills = [...formData.skills];
                  newSkills[index] = { ...skill, name: e.target.value };
                  setFormData({ ...formData, skills: newSkills });
                }}
                placeholder="E.g. React, Python, Project Management"
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={skill.category}
                onChange={(e) => {
                  const newSkills = [...formData.skills];
                  newSkills[index] = { ...skill, category: e.target.value };
                  setFormData({ ...formData, skills: newSkills });
                }}
                className="w-48 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Category</option>
                <option value="Languages">Languages</option>
                <option value="Frameworks/Libraries">Frameworks/Libraries</option>
                <option value="Tools">Tools</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const newSkills = [...formData.skills];
                  newSkills.splice(index, 1);
                  setFormData({ ...formData, skills: newSkills });
                }}
                className="text-red-400 hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFormData({
            ...formData,
            skills: [...formData.skills, { name: '', category: '' }]
          })}
          className="mt-4 w-full py-3 rounded-lg border-2 border-dashed border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors duration-300"
        >
          + Add Skill
        </button>
      </div>
    </div>
  );

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          title: '',
          employmentType: 'Full-time',
          company: '',
          currentlyWorking: false,
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          location: '',
          locationType: 'Hybrid',
          description: ''
        }
      ]
    });
  };
  
  const removeExperience = (index: number) => {
    const updatedExperiences = [...formData.experience];
    updatedExperiences.splice(index, 1);
    
    setFormData({
      ...formData,
      experience: updatedExperiences.length > 0 ? updatedExperiences : [{
        title: '',
        employmentType: 'Full-time',
        company: '',
        currentlyWorking: false,
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        location: '',
        locationType: 'Hybrid',
        description: ''
      }]
    });
  };
  
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: '',
          degree: '',
          fieldOfStudy: '',
          startYear: '',
          endYear: '',
          grade: '',
          activities: ''
        }
      ]
    }));
  };
  
  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  return (
    <animated.form onSubmit={handleSubmit} style={spring} className="space-y-8">
      {/* Profile Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Personal Information</h3>
        {renderProfileSection()}
      </div>

      {/* Experience Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Work Experience</h3>
        {renderExperienceSection()}
      </div>

      {/* Education Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Education</h3>
        {renderEducationSection()}
      </div>

      {/* Skills Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Skills</h3>
        {renderSkillsSection()}
      </div>

      {error && (
        <div className="text-red-400 bg-red-900/20 px-4 py-3 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 flex items-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              Complete Profile
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </animated.form>
  );
};

export default ManualEntryForm; 