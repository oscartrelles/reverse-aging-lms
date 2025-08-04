import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

export const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({ children }) => {
  // Initialize analytics tracking
  useAnalytics();

  return <>{children}</>;
}; 