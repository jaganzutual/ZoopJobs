import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import OnboardingForm from './OnboardingForm';
import { ResumeParseResponse, Skill } from '../../services/resumeService/resumeService';

// Mock the react-spring animation
jest.mock('@react-spring/web', () => ({
  useSpring: () => [
    { opacity: 1, y: 0, scale: 1 },
    {
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn()
    }
  ],
  animated: {
    div: ({ children, style, ...props }: any) => (
      <div data-testid="animated-div" style={style} {...props}>
        {children}
      </div>
    ),
    h2: ({ children, style, ...props }: any) => (
      <h2 data-testid="animated-h2" style={style} {...props}>
        {children}
      </h2>
    ),
    form: ({ children, style, ...props }: any) => (
      <form data-testid="animated-form" style={style} {...props}>
        {children}
      </form>
    )
  },
  config: {
    molasses: {},
    wobbly: {}
  }
}));

// Mock FormData properly
const mockFormData = {
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  forEach: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
  [Symbol.iterator]: jest.fn()
};

global.FormData = jest.fn(() => mockFormData);

describe('OnboardingForm Component', () => {
  const mockOnComplete = jest.fn();
  const mockInitialData = {
    personal_info: {
      name: 'John Doe',
      location: 'New York',
      linkedin: 'https://linkedin.com/in/johndoe'
    },
    skills: [
      { name: 'JavaScript', years: 3, category: undefined },
      { name: 'React', years: 2, category: undefined },
      { name: 'TypeScript', years: 0, category: undefined }
    ],
    education: [
      { 
        institution: 'Harvard University', 
        degree: 'Computer Science', 
        start_date: '2018' 
      }
    ],
    work_experience: [
      {
        company: 'Google',
        job_title: 'Software Engineer',
        start_date: '2020',
        end_date: 'Present'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with initial step and form fields', () => {
    render(<OnboardingForm onComplete={mockOnComplete} />);
    
    // Check if form elements are present in the first step
    expect(screen.getByText('Skills & Experience')).toBeInTheDocument();
    
    // Check for input fields
    const skillsInput = screen.getByPlaceholderText(/e\.g\. react, javascript/i);
    expect(skillsInput).toBeInTheDocument();
    
    const educationInput = screen.getByPlaceholderText(/your educational background/i);
    expect(educationInput).toBeInTheDocument();
    
    const aboutInput = screen.getByPlaceholderText(/tell us about yourself/i);
    expect(aboutInput).toBeInTheDocument();
  });

  test('populates form with initial data when provided', () => {
    render(<OnboardingForm onComplete={mockOnComplete} initialData={mockInitialData} />);
    
    // Check if initial data is populated in the form
    const skillsInput = screen.getByPlaceholderText(/e\.g\. react, javascript/i);
    expect(skillsInput).toHaveValue('JavaScript, React, TypeScript');
    
    const educationInput = screen.getByPlaceholderText(/your educational background/i);
    expect(educationInput).toHaveValue('Harvard University - Computer Science (2018)');
    
    const linkedinInput = screen.getByPlaceholderText(/linkedin\.com\/in\/yourusername/i);
    expect(linkedinInput).toHaveValue('https://linkedin.com/in/johndoe');
  });

  test('displays validation errors when submitting with empty required fields', async () => {
    render(<OnboardingForm onComplete={mockOnComplete} />);
    
    // Try to submit the form without filling required fields
    const submitButton = screen.getByRole('button', { name: /next/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/at least one skill is required/i)).toBeInTheDocument();
      expect(screen.getByText(/education is required/i)).toBeInTheDocument();
      expect(screen.getByText(/about section is required/i)).toBeInTheDocument();
    });
  });

  test('advances to next step when form is valid', async () => {
    render(<OnboardingForm onComplete={mockOnComplete} />);
    
    await act(async () => {
      // Fill in required fields for step 1
      const aboutInput = screen.getByPlaceholderText(/tell us about yourself/i);
      fireEvent.change(aboutInput, { target: { value: 'I am a software developer' } });
      
      const educationInput = screen.getByPlaceholderText(/your educational background/i);
      fireEvent.change(educationInput, { target: { value: 'Harvard University - BS Computer Science' } });
      
      const skillsInput = screen.getByPlaceholderText(/e\.g\. react, javascript/i);
      fireEvent.change(skillsInput, { target: { value: 'JavaScript' } });
      
      // Submit the form to advance to next step
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    });
    
    // Check if we advanced to the next step
    await waitFor(() => {
      expect(screen.getByText(/job preferences/i)).toBeInTheDocument();
    });
  });

  test('calls onComplete with form data when final step is submitted', async () => {
    render(<OnboardingForm onComplete={mockOnComplete} />);
    
    await act(async () => {
      // Fill in required fields for step 1
      const aboutInput = screen.getByPlaceholderText(/tell us about yourself/i);
      fireEvent.change(aboutInput, { target: { value: 'I am a software developer' } });
      
      const educationInput = screen.getByPlaceholderText(/your educational background/i);
      fireEvent.change(educationInput, { target: { value: 'Harvard University - BS Computer Science' } });
      
      const skillsInput = screen.getByPlaceholderText(/e\.g\. react, javascript/i);
      fireEvent.change(skillsInput, { target: { value: 'JavaScript' } });
      
      // Submit step 1
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    });
    
    await act(async () => {
      // Fill in required fields for step 2
      const roleInput = screen.getByPlaceholderText(/e\.g\. frontend developer/i);
      const salaryInput = screen.getByPlaceholderText(/e\.g\. \$80,000/i);
      const remoteSelect = screen.getByRole('combobox');
      
      fireEvent.change(roleInput, { target: { value: 'Software Engineer' } });
      fireEvent.change(salaryInput, { target: { value: '$100,000' } });
      fireEvent.change(remoteSelect, { target: { value: 'remote' } });
      
      // Submit the final step
      fireEvent.click(screen.getByRole('button', { name: /complete/i }));
    });
    
    // Check if onComplete was called with the form data
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      expect(mockOnComplete).toHaveBeenCalledWith({
        about: 'I am a software developer',
        education: 'Harvard University - BS Computer Science',
        skills: ['JavaScript'],
        achievements: '',
        availability: '',
        experience: '',
        github: '',
        linkedin: '',
        location: '',
        name: '',
        photo: null,
        resume: null,
        socialLinks: {},
        timezone: '',
        jobPreferences: {
          role: 'Software Engineer',
          salary: '$100,000',
          remote: 'remote',
          companySize: [],
          location: '',
          wants: []
        }
      });
    });
  });
}); 