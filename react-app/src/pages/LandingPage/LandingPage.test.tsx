import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import * as router from 'react-router';
import LandingPage from './LandingPage';

// Mock the react-spring animation
jest.mock('@react-spring/web', () => ({
  useSpring: () => ({ opacity: 1, y: 0, scale: 1 }),
  animated: {
    div: ({ children, ...props }: any) => (
      <div data-testid="animated-div" {...props}>
        {children}
      </div>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 data-testid="animated-h2" {...props}>
        {children}
      </h2>
    ),
    form: ({ children, ...props }: any) => (
      <form data-testid="animated-form" {...props}>
        {children}
      </form>
    )
  },
  config: {
    molasses: {},
    wobbly: {}
  }
}));

// Mock the intersection observer
jest.mock('react-intersection-observer', () => ({
  useInView: () => [jest.fn(), true],
}));

// Mock fetch for GitHub stars
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ stargazers_count: 123 }),
  })
) as jest.Mock;

// Mock useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

// Mock FormData
class MockFormData implements FormData {
  private data = new Map<string, any>();

  append(name: string, value: string | Blob, fileName?: string): void {
    this.data.set(name, value);
  }

  delete(name: string): void {
    this.data.delete(name);
  }

  get(name: string): FormDataEntryValue | null {
    return this.data.get(name) || null;
  }

  getAll(name: string): FormDataEntryValue[] {
    const value = this.data.get(name);
    return value ? [value] : [];
  }

  has(name: string): boolean {
    return this.data.has(name);
  }

  set(name: string, value: string | Blob, fileName?: string): void {
    this.data.set(name, value);
  }

  forEach(callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void): void {
    this.data.forEach((value, key) => callbackfn(value, key, this));
  }

  entries(): IterableIterator<[string, FormDataEntryValue]> {
    return this.data.entries();
  }

  keys(): IterableIterator<string> {
    return this.data.keys();
  }

  values(): IterableIterator<FormDataEntryValue> {
    return this.data.values();
  }

  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]> {
    return this.entries();
  }
}

// @ts-ignore
global.FormData = jest.fn(() => new MockFormData());

// Wrap component with router for testing
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('LandingPage Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock window methods
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true
    });
    
    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => jest.fn(),
      unobserve: () => jest.fn(),
      disconnect: () => jest.fn()
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders the landing page with logo and navigation', () => {
    renderWithRouter(<LandingPage />);
    
    // Check for logo
    expect(screen.getByAltText('ZoopJobs Logo')).toBeInTheDocument();
    
    // Check for navigation links using more specific selectors
    const navLinks = screen.getAllByRole('link', { name: /^(Features|About|Pricing)$/ });
    expect(navLinks).toHaveLength(3);
    expect(navLinks[0]).toHaveTextContent('Features');
    expect(navLinks[1]).toHaveTextContent('About');
    expect(navLinks[2]).toHaveTextContent('Pricing');
  });

  it('displays GitHub star count after fetching', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ stargazers_count: 123 })
      })
    ) as jest.Mock;

    renderWithRouter(<LandingPage />);
    
    // Wait for the star count to be updated using a more specific selector
    await waitFor(() => {
      const starCount = screen.getByText('123');
      expect(starCount).toBeInTheDocument();
    });
  });

  it('navigates to register on Get Started click', () => {
    renderWithRouter(<LandingPage />);
    const getStartedButton = screen.getByRole('link', { name: /get started/i });
    expect(getStartedButton).toHaveAttribute('href', '/register');
  });

  it('handles scroll and mouse move events', () => {
    const scrollHandler = jest.fn();
    const mouseMoveHandler = jest.fn();
    
    // Mock addEventListener before rendering
    window.addEventListener = jest.fn((event, handler) => {
      if (event === 'scroll') scrollHandler();
      if (event === 'mousemove') mouseMoveHandler();
    });

    renderWithRouter(<LandingPage />);

    // Trigger events
    fireEvent.scroll(window);
    fireEvent.mouseMove(window);

    expect(scrollHandler).toHaveBeenCalled();
    expect(mouseMoveHandler).toHaveBeenCalled();

    // Cleanup
    window.addEventListener = jest.fn();
  });

  it('renders main sections with correct structure', () => {
    renderWithRouter(<LandingPage />);
    
    // Check for navigation
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
    
    // Check for logo
    const logo = screen.getByAltText('ZoopJobs Logo');
    expect(logo).toBeInTheDocument();
    
    // Check for main heading
    const mainHeading = screen.getByRole('heading', { name: /transform your job search experience/i });
    expect(mainHeading).toBeInTheDocument();
    
    // Check for features section
    const featuresHeading = screen.getByRole('heading', { name: /why choose zoopjobs\?/i });
    expect(featuresHeading).toBeInTheDocument();
    
    // Check for pricing section
    const pricingHeading = screen.getByRole('heading', { name: /choose your plan/i });
    expect(pricingHeading).toBeInTheDocument();
    
    // Check for how it works section
    const howItWorksHeading = screen.getByRole('heading', { name: /how it works/i });
    expect(howItWorksHeading).toBeInTheDocument();
    
    // Check for about section
    const aboutHeading = screen.getByRole('heading', { name: /about us/i });
    expect(aboutHeading).toBeInTheDocument();
    
    // Check for footer
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
}); 