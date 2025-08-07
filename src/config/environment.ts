// Environment configuration
export const ENVIRONMENT = {
  // Detect environment based on hostname
  hostname: window.location.hostname,
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  isProduction: window.location.hostname === 'academy.7weekreverseagingchallenge.com' || 
                 window.location.hostname === 'reverse-aging-academy.web.app',
  isStaging: !(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
             !(window.location.hostname === 'academy.7weekreverseagingchallenge.com' || 
               window.location.hostname === 'reverse-aging-academy.web.app'),
  
  // Firebase project IDs (both sites in same project)
  FIREBASE_PROJECTS: {
    development: 'the-reverse-aging-challenge',
    staging: 'the-reverse-aging-challenge',
    production: 'the-reverse-aging-challenge'
  },
  
  // Hosting URLs
  HOSTING_URLS: {
    development: 'http://localhost:3000',
    staging: 'https://the-reverse-aging-challenge.web.app',
    production: 'https://academy.7weekreverseagingchallenge.com'
  },
  
  // Current project ID
  get currentProjectId(): string {
    if (this.isDevelopment) return this.FIREBASE_PROJECTS.development;
    if (this.isProduction) return this.FIREBASE_PROJECTS.production;
    return this.FIREBASE_PROJECTS.staging;
  },
  
  // Current hosting URL
  get currentHostingUrl(): string {
    if (this.isDevelopment) return this.HOSTING_URLS.development;
    if (this.isProduction) return this.HOSTING_URLS.production;
    return this.HOSTING_URLS.staging;
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
    logToConsole: ENVIRONMENT.isStaging || ENVIRONMENT.isDevelopment,
  },
  
  // Feature flags
  features: {
    // Enable experimental features in staging and development
    experimentalFeatures: ENVIRONMENT.isStaging || ENVIRONMENT.isDevelopment,
    
    // Enable detailed logging in staging and development
    detailedLogging: ENVIRONMENT.isStaging || ENVIRONMENT.isDevelopment,
  }
} as const;

// Helper functions
export const getEnvironmentInfo = () => ({
  isDevelopment: ENVIRONMENT.isDevelopment,
  isProduction: ENVIRONMENT.isProduction,
  isStaging: ENVIRONMENT.isStaging,
  projectId: ENVIRONMENT.currentProjectId,
  hostingUrl: ENVIRONMENT.currentHostingUrl,
  hostname: ENVIRONMENT.hostname,
});

// Console logging for environment info (only in staging and development)
if (ENVIRONMENT.isStaging || ENVIRONMENT.isDevelopment) {
  console.log('🌍 Environment Info:', getEnvironmentInfo());
  console.log('🔧 Environment Config:', ENV_CONFIG);
}
