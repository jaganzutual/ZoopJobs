import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OnboardingPage from './OnboardingPage';
import * as userService from '../../services/userService/userService';
import '@testing-library/jest-dom';  // Add this import for toBeInTheDocument matcher

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the user service
jest.mock('../../services/userService/userService', () => ({
  hasCompletedOnboarding: jest.fn(),
  updateUserProfile: jest.fn(),
}));

// Mock the components
jest.mock('../../components/ResumeUploadForm/ResumeUploadForm', () => ({
  __esModule: true,
  default: ({ onResumeDataLoaded, onError }: any) => (
    <div data-testid="resume-upload-form">
      <button onClick={() => onResumeDataLoaded({ id: '123' })}>Upload Resume</button>
      <button onClick={() => onError('Error uploading')}>Trigger Error</button>
    </div>
  ),
}));

jest.mock('../../components/ManualEntryForm/ManualEntryForm', () => ({
  __esModule: true,
  default: ({ onComplete, onBackToResume }: any) => (
    <div data-testid="manual-entry-form">
      <button onClick={() => onComplete({ name: 'Test User' })}>Submit Manual Entry</button>
      <button onClick={onBackToResume}>Back</button>
    </div>
  ),
}));

const mockInitialData = {
  personal_info: {
    name: 'John Doe',
    location: 'New York',
    linkedin: 'linkedin.com/johndoe'
  },
  skills: [
    { name: 'JavaScript', years: 5 },
    { name: 'React', years: 3 }
  ],
  education: [
    {
      institution: 'University of Example',
      degree: 'Bachelor of Science',
      start_date: '2015'
    }
  ],
  work_experience: [
    {
      company: 'Example Corp',
      job_title: 'Software Engineer',
      start_date: '2018',
      end_date: '2020'
    }
  ]
};

describe('OnboardingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (userService.hasCompletedOnboarding as jest.Mock).mockResolvedValue(false);
  });

  const renderOnboardingPage = () => {
    return render(
      <BrowserRouter>
        <OnboardingPage />
      </BrowserRouter>
    );
  };

  test('renders loading state initially', async () => {
    renderOnboardingPage();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('shows resume upload form by default', async () => {
    renderOnboardingPage();
    await waitFor(() => {
      expect(screen.getByTestId('resume-upload-form')).toBeInTheDocument();
    });
  });

  test('shows manual entry form when clicking manual entry button', async () => {
    renderOnboardingPage();
    await waitFor(() => {
      const manualEntryButton = screen.getByText('Prefer to enter details manually?');
      fireEvent.click(manualEntryButton);
      expect(screen.getByTestId('manual-entry-form')).toBeInTheDocument();
    });
  });

  test('shows error message when resume upload fails', async () => {
    renderOnboardingPage();
    await waitFor(() => {
      fireEvent.click(screen.getByText('Trigger Error'));
      expect(screen.getByText('Error uploading')).toBeInTheDocument();
    });
  });

  test('redirects to dashboard when onboarding is completed', async () => {
    renderOnboardingPage();
    
    // Wait for the page to load and click manual entry button
    await waitFor(() => {
      const manualEntryButton = screen.getByText('Prefer to enter details manually?');
      fireEvent.click(manualEntryButton);
    });

    // Wait for manual entry form and complete it
    await waitFor(() => {
      const submitButton = screen.getByText('Submit Manual Entry');
      fireEvent.click(submitButton);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('redirects to dashboard if user has already completed onboarding', async () => {
    (userService.hasCompletedOnboarding as jest.Mock).mockResolvedValue(true);
    renderOnboardingPage();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
}); 