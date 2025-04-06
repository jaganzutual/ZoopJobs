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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <img src={Logo} alt="ZoopJobs Logo" className="h-8" />
            </Link>
            <button className="btn star">
              <svg className="icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
              </svg>
              Star
              <span className="star-count">1</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/features" className="text-sm text-violet-200 hover:text-violet-400 transition-colors">Features</Link>
            <Link to="/about" className="text-sm text-violet-200 hover:text-violet-400 transition-colors">About</Link>
            <Link to="/register" className="btn primary">
              Getting Started
            </Link>
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
            <h1 className="text-7xl font-bold mb-8 hero-gradient-text leading-tight">
              AI-Powered Job Automation
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

      {/* Features Section with Enhanced Cards */}
      <section ref={featuresRef} className="py-32 bg-gray-900 relative">
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
    </div>
  );
};

export default LandingPage; 