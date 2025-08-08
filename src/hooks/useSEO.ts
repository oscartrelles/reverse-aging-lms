import { useEffect } from 'react';
import { seoService } from '../services/seoService';

interface SEOConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  twitterImage?: string;
  type?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  addOrganizationSchema?: boolean;
  addCourseSchema?: {
    name: string;
    description: string;
    url: string;
    provider: string;
    duration?: string;
    educationalLevel?: string;
  };
  addArticleSchema?: {
    title: string;
    description: string;
    url: string;
    author: string;
    datePublished: string;
    dateModified: string;
    image?: string;
  };
}

export const useSEO = (config: SEOConfig) => {
  useEffect(() => {
    // Clear any existing structured data
    seoService.clearStructuredData();
    
    // Set up basic SEO
    seoService.setupPageSEO(config);
    
    // Add organization schema if requested
    if (config.addOrganizationSchema) {
      seoService.addOrganizationSchema();
    }
    
    // Add course schema if provided
    if (config.addCourseSchema) {
      seoService.addCourseSchema(config.addCourseSchema);
    }
    
    // Add article schema if provided
    if (config.addArticleSchema) {
      seoService.addArticleSchema(config.addArticleSchema);
    }
    
    // Cleanup function to clear structured data when component unmounts
    return () => {
      seoService.clearStructuredData();
    };
  }, [
    config.title,
    config.description,
    config.canonicalPath,
    config.ogImage,
    config.twitterImage,
    config.type,
    config.addOrganizationSchema,
    config.addCourseSchema,
    config.addArticleSchema,
    config.breadcrumbs
  ]);
};

// Convenience hook for landing page
export const useLandingPageSEO = () => {
  useSEO({
    title: 'The Reverse Aging Academy - Evidence-Based Longevity Education',
    description: 'Your premier destination for evidence-based longevity education and transformative health optimization programs. Join our academy to learn proven strategies for reverse aging, health optimization, and living a longer, healthier life.',
    canonicalPath: '/',
    type: 'website',
    addOrganizationSchema: true,
    breadcrumbs: [
      { name: 'Home', url: '/' }
    ]
  });
};

// Convenience hook for evidence page
export const useEvidencePageSEO = () => {
  useSEO({
    title: 'Scientific Evidence - Reverse Aging Research & Studies',
    description: 'Explore the latest scientific evidence and research studies on reverse aging, longevity, and health optimization. Evidence-based insights from leading researchers.',
    canonicalPath: '/evidence',
    type: 'website',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Scientific Evidence', url: '/evidence' }
    ]
  });
};

// Convenience hook for programs page
export const useProgramsPageSEO = () => {
  useSEO({
    title: 'Programs & Courses - Reverse Aging Academy',
    description: 'Discover our comprehensive programs and courses designed to help you reverse aging and optimize your health. Evidence-based education for lasting transformation.',
    canonicalPath: '/programs',
    type: 'website',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Programs', url: '/programs' }
    ]
  });
};

// Convenience hook for course page
export const useCoursePageSEO = (courseData: {
  title: string;
  description: string;
  courseId: string;
}) => {
  useSEO({
    title: `${courseData.title} - Reverse Aging Academy`,
    description: courseData.description,
    canonicalPath: `/course/${courseData.courseId}`,
    type: 'website',
    addCourseSchema: {
      name: courseData.title,
      description: courseData.description,
      url: `/course/${courseData.courseId}`,
      provider: 'The Reverse Aging Academy',
      duration: 'P7W',
      educationalLevel: 'Beginner'
    },
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Programs', url: '/programs' },
      { name: courseData.title, url: `/course/${courseData.courseId}` }
    ]
  });
};

// Convenience hook for individual evidence article
export const useEvidenceArticleSEO = (articleData: {
  title: string;
  summary: string;
  id: string;
  publishedDate: string;
  author?: string;
}) => {
  useSEO({
    title: `${articleData.title} - Scientific Evidence`,
    description: articleData.summary,
    canonicalPath: `/evidence/${articleData.id}`,
    type: 'article',
    addArticleSchema: {
      title: articleData.title,
      description: articleData.summary,
      url: `/evidence/${articleData.id}`,
      author: articleData.author || 'The Reverse Aging Academy',
      datePublished: articleData.publishedDate,
      dateModified: articleData.publishedDate
    },
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Scientific Evidence', url: '/evidence' },
      { name: articleData.title, url: `/evidence/${articleData.id}` }
    ]
  });
};
