import React, { useEffect, useState } from 'react';
import './LoadingPage.css';

// SVG components for educational objects
// Import SVG components directly instead of from a separate file
const Book = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Pencil = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 3.5L20.5 6.5" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 10L4 17L3 21L7 20L14 13" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 10L15.5 5.5L18.5 8.5L14 13L11 10Z" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Calculator = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6H16" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10H10" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 10H16" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14H10" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 14H16" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 18H10" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 18H16" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Globe = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2C14.6522 4.65216 16 8.21885 16 12C16 15.7811 14.6522 19.3478 12 22" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2C9.34784 4.65216 8 8.21885 8 12C8 15.7811 9.34784 19.3478 12 22" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12H22" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TestTube = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3L15 3" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3V15.5C10 16.8807 8.88071 18 7.5 18V18C6.11929 18 5 16.8807 5 15.5V9" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 3V10.5C14 11.8807 15.1193 13 16.5 13V13C17.8807 13 19 11.8807 19 10.5V7" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 18C7.5 19.6569 8.84315 21 10.5 21H13.5C15.1569 21 16.5 19.6569 16.5 18" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Ruler = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="20" height="8" rx="1" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 8V12" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 8V12" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 8V12" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 8V12" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Blackboard = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="14" rx="2" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18V22" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 22H16" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11L10 8L13 11L17 7" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Backpack = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 9V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V9" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 9C5 7.34315 6.34315 6 8 6H16C17.6569 6 19 7.34315 19 9C19 10.6569 17.6569 12 16 12H8C6.34315 12 5 10.6569 5 9Z" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 6V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V6" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 16H15" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Diploma = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 10H20" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 14H20" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 18H12" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 16L19 21L21 16" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Microscope = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 18H18" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V18" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 2V6" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6L6 6" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 10V6.00001" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 10V14" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 14H21" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6L12 14" stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14Z" 
      stroke="#1a56db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface LoadingPageProps {
  onLoadingComplete?: () => void;
  simulateLoadingTime?: number; // in milliseconds
}

const loadingStates = [
  "Initialisation de Academia Hub...",
  "Chargement des modules...",
  "Préparation de l'interface...",
  "Finalisation..."
];

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  onLoadingComplete,
  simulateLoadingTime = 3000 // Default loading time: 3 seconds
}) => {
  const [progress, setProgress] = useState(0);
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionPreferenceChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleMotionPreferenceChange);

    // Simulate loading progress
    const totalSteps = loadingStates.length;
    const stepTime = simulateLoadingTime / totalSteps;
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      if (currentProgress < 100) {
        const increment = 100 / totalSteps;
        currentProgress = Math.min(currentProgress + increment / 10, 100);
        setProgress(currentProgress);
        
        // Update loading state text
        const stateIndex = Math.min(
          Math.floor(currentProgress / (100 / totalSteps)),
          totalSteps - 1
        );
        setLoadingStateIndex(stateIndex);
      } else {
        clearInterval(progressInterval);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }
    }, stepTime / 10);

    return () => {
      clearInterval(progressInterval);
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, [onLoadingComplete, simulateLoadingTime]);

  return (
    <div className="loading-page">
      <div className="loading-container">
        <div className="logo-container">
          <h1 className="logo-text">Academia Hub</h1>
        </div>
        
        <div className="progress-container">
          <div 
            className="progress-bar"
            data-progress={`${progress}%`}
            aria-label={`Chargement en cours : ${Math.round(progress)}%`}
            role="progressbar"
            aria-valuetext={`${Math.round(progress)}%`}
          ></div>
        </div>
        
        <div className="loading-text">
          <p>{loadingStates[loadingStateIndex]}</p>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Educational objects animations */}
      {!prefersReducedMotion && (
        <div className="educational-objects" aria-hidden="true">
          <div className="object book-container">
            <Book />
          </div>
          <div className="object pencil-container">
            <Pencil />
          </div>
          <div className="object calculator-container">
            <Calculator />
          </div>
          <div className="object globe-container">
            <Globe />
          </div>
          <div className="object test-tube-container">
            <TestTube />
          </div>
          <div className="object ruler-container">
            <Ruler />
          </div>
          <div className="object blackboard-container">
            <Blackboard />
          </div>
          <div className="object backpack-container">
            <Backpack />
          </div>
          <div className="object diploma-container">
            <Diploma />
          </div>
          <div className="object microscope-container">
            <Microscope />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingPage;
