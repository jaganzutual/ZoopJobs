import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSpring, animated, config } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import '../assets/styles/landing.css';
import Logo from '../assets/images/zoopjobs-logo.svg';

interface FloatingObjectProps {
  style?: React.CSSProperties;
  onClick?: () => void;
  className?: string;
}

const FloatingCube: React.FC<FloatingObjectProps> = ({ style, onClick, className }) => (
  <div className={`floating-cube ${className || ''}`} style={style} onClick={onClick}>
    <div className="cube-face face-front"></div>
    <div className="cube-face face-back"></div>
    <div className="cube-face face-right"></div>
    <div className="cube-face face-left"></div>
    <div className="cube-face face-top"></div>
    <div className="cube-face face-bottom"></div>
  </div>
);

const FloatingSphere: React.FC<FloatingObjectProps> = ({ style, onClick, className }) => (
  <div className={`floating-sphere ${className || ''}`} style={style} onClick={onClick}></div>
);

interface ParticlesProps {
  count?: number;
}

const Particles: React.FC<ParticlesProps> = ({ count = 20 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      '--x': `${(Math.random() - 0.5) * 200}px`,
      '--y': `${(Math.random() - 0.5) * 200}px`,
      animationDelay: `${Math.random() * 10}s`,
    } as React.CSSProperties,
  }));

  return (
    <div className="particles">
      {particles.map(particle => (
        <div key={particle.id} className="particle" style={particle.style}></div>
      ))}
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [starCount, setStarCount] = useState<number>(0);
  const [clickedObjects, setClickedObjects] = useState<{ [key: string]: boolean }>({});
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [stepsRef, stepsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
      
      // Update CSS variables for godray effect
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Fetch GitHub stars count
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/Zutual/ZoopJobs');
        const data = await response.json();
        setStarCount(data.stargazers_count);
      } catch (error) {
        console.error('Error fetching star count:', error);
      }
    };

    fetchStarCount();
  }, []);

  const handleObjectClick = useCallback((objectId: string) => {
    setClickedObjects(prev => ({
      ...prev,
      [objectId]: true
    }));
    
    // Reset the clicked state after animation
    setTimeout(() => {
      setClickedObjects(prev => ({
        ...prev,
        [objectId]: false
      }));
    }, 2000);
  }, []);

  const heroSpring = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 50 },
    config: config.molasses,
    delay: 200
  });

  const logoSpring = useSpring({
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: config.wobbly,
    delay: 100
  });

  const featuresSpring = useSpring({
    opacity: featuresInView ? 1 : 0,
    y: featuresInView ? 0 : 20,
    config: { duration: 800 }
  });

  const stepsSpring = useSpring({
    opacity: stepsInView ? 1 : 0,
    y: stepsInView ? 0 : 20,
    config: { duration: 800 }
  });

  const ctaSpring = useSpring({
    opacity: ctaInView ? 1 : 0,
    scale: ctaInView ? 1 : 0.9,
    config: { duration: 800 }
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-violet-500/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center group">
                <img src={Logo} alt="ZoopJobs Logo" className="h-10 transition-transform duration-300 group-hover:scale-110" />
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="nav-link text-violet-200 hover:text-white transition-colors">Features</a>
                <a href="#about" className="nav-link text-violet-200 hover:text-white transition-colors">About</a>
                <a href="#pricing" className="nav-link text-violet-200 hover:text-white transition-colors">Pricing</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Zutual/ZoopJobs" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-violet-500/20 hover:bg-gray-800/70 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-violet-200" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
                </svg>
                <span className="text-violet-200 font-medium group-hover:text-violet-100 transition-colors">
                  {starCount}
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Enhanced 3D Effect */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 pt-20">
        <div className="absolute inset-0 grid-pattern"></div>
        <div className="godray"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900"></div>
        
        {/* 3D Objects */}
        <FloatingCube 
          className={clickedObjects['cube1'] ? 'clicked' : ''}
          style={{ 
            top: '20%', 
            left: '10%', 
            transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.1}deg)` 
          }} 
          onClick={() => handleObjectClick('cube1')}
        />
        <FloatingCube 
          className={clickedObjects['cube2'] ? 'clicked' : ''}
          style={{ 
            top: '60%', 
            right: '15%', 
            transform: `translateY(${scrollY * -0.3}px) rotate(${scrollY * -0.1}deg)` 
          }}
          onClick={() => handleObjectClick('cube2')}
        />
        <FloatingSphere 
          className={clickedObjects['sphere1'] ? 'clicked' : ''}
          style={{ 
            top: '30%', 
            right: '20%', 
            transform: `translateY(${scrollY * 0.15}px)` 
          }}
          onClick={() => handleObjectClick('sphere1')}
        />
        <FloatingSphere 
          className={clickedObjects['sphere2'] ? 'clicked' : ''}
          style={{ 
            bottom: '20%', 
            left: '25%', 
            transform: `translateY(${scrollY * -0.25}px)` 
          }}
          onClick={() => handleObjectClick('sphere2')}
        />
        
        {/* Particles */}
        <Particles count={30} />

        <div className="container mx-auto px-4 relative z-10">
          <animated.div style={heroSpring} className="text-center max-w-5xl mx-auto">
            <div className="mb-6 inline-flex items-center bg-violet-500/10 rounded-full px-4 py-2 border border-violet-500/20">
              <span className="text-violet-200 text-sm font-medium">Open source AI-Powered Job Automation</span>
            </div>
            <h1 className="text-7xl font-bold mb-8 hero-gradient-text leading-tight">
            Transform Your Job Search Experience
            </h1>
            <p className="text-2xl text-violet-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              One-click applications. Smart form filling. Unified job dashboard.
            </p>
            <div className="flex justify-center gap-6">
              <Link to="/register" className="btn primary large">
                Getting Started
              </Link>
              <Link to="/demo" className="btn secondary large">
                Watch Demo
              </Link>
            </div>
          </animated.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-gray-900 relative">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 gradient-text">Choose Your Plan</h2>
            <p className="text-xl text-violet-200">From open source to enterprise, we have a plan that fits your needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Open Source Plan */}
            <div className="pricing-card p-8 rounded-2xl bg-gray-800/50 border border-violet-500/20 backdrop-blur-sm hover:transform hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Open Source</h3>
              <p className="text-violet-200 mb-6">Perfect for individual developers and open source projects.</p>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Full library access
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Self-hosted version
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  MIT License
                </li>
              </ul>
              <a href="https://github.com/Zutual/ZoopJobs" target="_blank" rel="noopener noreferrer" className="btn secondary w-full">
                View on GitHub
              </a>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card p-8 rounded-2xl bg-violet-500/10 border-2 border-violet-500 backdrop-blur-sm hover:transform hover:-translate-y-2 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white px-4 py-1 rounded-full text-sm">Popular</div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <p className="text-violet-200 mb-6">For teams and businesses that need advanced features.</p>
              <div className="text-4xl font-bold mb-6">$30<span className="text-lg font-normal">/month</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Open Source
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  30 USD of API credits per month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited access
                </li>
              </ul>
              <Link to="/register" className="btn primary w-full">
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="pricing-card p-8 rounded-2xl bg-gray-800/50 border border-violet-500/20 backdrop-blur-sm hover:transform hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <p className="text-violet-200 mb-6">Custom solutions for your organization's needs.</p>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Dedicated support team
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom integrations
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  On-premise deployment
                </li>
              </ul>
              <Link to="/contact" className="btn secondary w-full">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Cards */}
      <section id="features" ref={featuresRef} className="py-32 bg-gray-900 relative">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        <FloatingCube style={{ bottom: '10%', left: '5%', transform: `translateY(${(scrollY - 1000) * 0.1}px)` }} />
        <FloatingSphere style={{ top: '20%', right: '10%', transform: `translateY(${(scrollY - 1000) * -0.1}px)` }} />
        <div className="container mx-auto px-4 relative z-10">
          <animated.h2 style={featuresSpring} className="text-5xl font-bold text-center mb-20 gradient-text">
            Why Choose ZoopJobs?
          </animated.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Unified Job Dashboard",
                description: "View and filter job listings from multiple company career pages in one place.",
                icon: "🌐",
                gradient: "from-blue-500/20 to-violet-500/20"
              },
              {
                title: "One-Click Applications",
                description: "Automated job application submission with smart form completion.",
                icon: "⚡",
                gradient: "from-violet-500/20 to-purple-500/20"
              },
              {
                title: "AI-Powered Matching",
                description: "Intelligent job matching based on your skills and preferences.",
                icon: "🤖",
                gradient: "from-purple-500/20 to-pink-500/20"
              }
            ].map((feature, index) => (
              <animated.div
                key={index}
                className={`feature-card scroll-animate neon-border p-8 rounded-2xl shadow-lg hover:shadow-violet-500/20 transition-all duration-500 bg-gradient-to-br ${feature.gradient}`}
                style={{
                  transform: featuresInView 
                    ? `translateY(${(scrollY - 1500) * 0.05}px) rotateX(${(scrollY - 1500) * 0.02}deg)`
                    : 'translateY(50px)',
                  opacity: featuresInView ? 1 : 0,
                  transition: `all 0.5s ease ${index * 0.2}s`
                }}
              >
                <div className="text-5xl mb-6 float">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-violet-300 mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </animated.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={stepsRef} className="py-32 bg-gray-800/50 relative">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        <FloatingCube style={{ top: '20%', right: '10%', transform: `translateY(${(scrollY - 2000) * 0.1}px)` }} />
        <FloatingSphere style={{ bottom: '20%', left: '10%', transform: `translateY(${(scrollY - 2000) * -0.1}px)` }} />
        <div className="container mx-auto px-4 relative z-10">
          <animated.h2 style={stepsSpring} className="text-5xl font-bold text-center mb-20 gradient-text">
            How It Works
          </animated.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Upload Your Resume",
                description: "Let our AI analyze your skills and experience",
                gradient: "from-blue-600 to-violet-600"
              },
              {
                step: "2",
                title: "Set Preferences",
                description: "Define your job search criteria",
                gradient: "from-violet-600 to-purple-600"
              },
              {
                step: "3",
                title: "Apply with One Click",
                description: "Let our AI handle the application process",
                gradient: "from-purple-600 to-pink-600"
              }
            ].map((step, index) => (
              <animated.div
                key={index}
                className="text-center card-3d scroll-animate"
                style={{
                  transform: stepsInView 
                    ? `translateY(${(scrollY - 2000) * 0.05}px)`
                    : 'translateY(50px)',
                  opacity: stepsInView ? 1 : 0,
                  transition: `all 0.5s ease ${index * 0.2}s`
                }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg shadow-violet-500/50 pulse transform hover:scale-110 transition-transform duration-300`}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-violet-300">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </animated.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-32 bg-gray-900 relative">
        <div className="container mx-auto px-4 relative z-10">
          <animated.div style={ctaSpring} className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-8 gradient-text">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-2xl text-violet-200 mb-12 leading-relaxed">
              Join thousands of professionals who found their dream jobs through ZoopJobs
            </p>
            <Link to="/register" className="btn primary large">
              Getting Started
            </Link>
          </animated.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-gray-900 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8 gradient-text">About Us</h2>
          <p className="text-xl text-violet-200 text-center max-w-3xl mx-auto">
            ZoopJobs is revolutionizing the job search process with AI-powered automation.
            Our mission is to make job hunting more efficient and less stressful.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-violet-500/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-violet-200 mb-4 md:mb-0">
              © {new Date().getFullYear()} Zutual. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Zutual/ZoopJobs" target="_blank" rel="noopener noreferrer" className="text-sm text-violet-200 hover:text-violet-400 transition-colors">
                GitHub
              </a>
              <Link to="/privacy" className="text-sm text-violet-200 hover:text-violet-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-violet-200 hover:text-violet-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 