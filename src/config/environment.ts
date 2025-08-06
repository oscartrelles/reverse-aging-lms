// Environment configuration
export const ENVIRONMENT = {
  // Detect environment based on hostname
  isProduction: window.location.hostname === 'academy.7weekreverseagingchallenge.com' || 
                 window.location.hostname === 'reverse-aging-academy.web.app',
  isStaging: window.location.hostname === 'the-reverse-aging-challenge.web.app',
  
  // Firebase project IDs (both sites in same project)
  FIREBASE_PROJECTS: {
    staging: 'the-reverse-aging-challenge',
    production: 'the-reverse-aging-challenge'
  },
  
  // Hosting URLs
  HOSTING_URLS: {
    staging: 'https://the-reverse-aging-challenge.web.app',
    production: 'https://academy.7weekreverseagingchallenge.com'
  },
  
  // Current project ID
  get currentProjectId(): string {
    return this.isProduction ? this.FIREBASE_PROJECTS.production : this.FIREBASE_PROJECTS.staging;
  },
  
  // Current hosting URL
  get currentHostingUrl(): string {
    return this.isProduction ? this.HOSTING_URLS.production : this.HOSTING_URLS.staging;
  }
} as const;

// Environment-specific configurations
export const ENV_CONFIG = {
  // Analytics settings
  analytics: {
    enabled: ENVIRONMENT.isProduction, // Only enable analytics in production
    debug: ENVIRONMENT.isStaging, // Enable debug mode in staging
  },
  
  // Error reporting
  errorReporting: {
    enabled: ENVIRONMENT.isProduction,
    logToConsole: ENVIRONMENT.isStaging,
  },
  
  // Feature flags
  features: {
    // Enable experimental features in staging
    experimentalFeatures: ENVIRONMENT.isStaging,
    
    // Enable detailed logging in staging
    detailedLogging: ENVIRONMENT.isStaging,
  }
} as const;

// Helper functions
export const getEnvironmentInfo = () => ({
  isProduction: ENVIRONMENT.isProduction,
  isStaging: ENVIRONMENT.isStaging,
  projectId: ENVIRONMENT.currentProjectId,
  hostingUrl: ENVIRONMENT.currentHostingUrl,
  hostname: window.location.hostname,
});

// Console logging for environment info (only in staging)
if (ENVIRONMENT.isStaging) {
  console.log('🌍 Environment Info:', getEnvironmentInfo());
  console.log('🔧 Environment Config:', ENV_CONFIG);
}
