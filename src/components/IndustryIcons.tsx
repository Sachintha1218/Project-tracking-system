import React from 'react';
import { motion } from 'framer-motion';

// --- Digital Industry Icons ---

export const CodeBrackets = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CloudNode = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 19C20.5 19 22 17 22 14.5C22 12 20.5 10 17.5 10C17.5 7 15.5 5 12 5C8.5 5 6.5 7.5 6.5 10.5C3.5 10.5 2 12.5 2 15C2 17.5 3.5 19.5 6.5 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="2" fill="currentColor" fillOpacity="0.2"/>
    <path d="M12 11V10" stroke="currentColor" strokeWidth="1"/>
    <path d="M10 13H9" stroke="currentColor" strokeWidth="1"/>
    <path d="M14 13H15" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const TechCircuit = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 4V8" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 16V20" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 12H8" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 12H20" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

// --- Marketing Industry Icons ---

export const Megaphone = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 11L6 11L11 6L11 18L6 13L3 13L3 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M15 8.5C16.5 10 16.5 14 15 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 5.5C21.5 8.5 21.5 15.5 19 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const GrowthChart = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 16V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 16V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 5L20 5L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 14L10 8L15 12L20 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
  </svg>
);

export const MarketingTarget = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <path d="M12 6V3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 21V18" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M18 12H21" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 12H6" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

// --- Floating Component Wrapper ---

interface FloatingIconProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  x?: number[];
  y?: number[];
  rotate?: number[];
  scale?: number[];
}

export const FloatingIndustryElement: React.FC<FloatingIconProps> = ({ 
  children, 
  delay = 0, 
  duration = 10, 
  className = "",
  x = [0, 20, 0],
  y = [0, -20, 0],
  rotate = [0, 10, 0],
  scale = [1, 1.1, 1]
}) => {
  return (
    <motion.div
      animate={{ 
        x,
        y,
        rotate,
        scale
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay 
      }}
      className={`pointer-events-none -z-10 ${className}`}
    >
      {children}
    </motion.div>
  );
};
