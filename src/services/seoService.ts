import { ENVIRONMENT } from '../config/environment';

// SEO Service for managing structured data, canonical URLs, and meta tags
export class SEOService {
  private static instance: SEOService;
  
  private constructor() {}
  
  static getInstance(): SEOService {
    if (!SEOService.instance) {
      SEOService.instance = new SEOService();
    }
    return SEOService.instance;
  }

  // Set canonical URL
  setCanonicalUrl(path: string): void {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    const canonicalUrl = `${baseUrl}${path}`;
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }

  // Set page title
  setPageTitle(title: string): void {
    document.title = title;
  }

  // Set meta description
  setMetaDescription(description: string): void {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }

  // Set Open Graph tags
  setOpenGraphTags(data: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    
    const ogTags = [
      { property: 'og:title', content: data.title },
      { property: 'og:description', content: data.description },
      { property: 'og:type', content: data.type || 'website' },
      { property: 'og:url', content: data.url || baseUrl },
      { property: 'og:image', content: data.image || `${baseUrl}/Academy.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:site_name', content: 'The Reverse Aging Academy' },
    ];

    ogTags.forEach(({ property, content }) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
  }

  // Set Twitter Card tags
  setTwitterCardTags(data: {
    title: string;
    description: string;
    image?: string;
    card?: string;
  }): void {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    
    const twitterTags = [
      { name: 'twitter:card', content: data.card || 'summary_large_image' },
      { name: 'twitter:title', content: data.title },
      { name: 'twitter:description', content: data.description },
      { name: 'twitter:image', content: data.image || `${baseUrl}/Academy.png` },
      { name: 'twitter:site', content: '@reverseagingacademy' },
    ];

    twitterTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
  }

  // Add Organization structured data
  addOrganizationSchema(): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "The Reverse Aging Academy",
      "url": ENVIRONMENT.currentHostingUrl,
      "logo": `${ENVIRONMENT.currentHostingUrl}/Academy.png`,
      "description": "Your premier destination for evidence-based longevity education and transformative health optimization programs",
      "sameAs": [
        "https://www.instagram.com/reverse.aging.challenge",
        "https://www.linkedin.com/company/breathingflame",
        "https://www.facebook.com/breathingflame",
        "https://youtube.com/@BreathingFlameTV"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@reverseagingacademy.com"
      },
      "foundingDate": "2023",
      "founder": {
        "@type": "Person",
        "name": "Oscar Trelles"
      }
    };

    this.addStructuredData(schema);
  }

  // Add Course structured data
  addCourseSchema(courseData: {
    name: string;
    description: string;
    url: string;
    provider: string;
    duration?: string;
    educationalLevel?: string;
  }): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": courseData.name,
      "description": courseData.description,
      "url": courseData.url,
      "provider": {
        "@type": "Organization",
        "name": courseData.provider,
        "url": ENVIRONMENT.currentHostingUrl
      },
      "educationalLevel": courseData.educationalLevel || "Beginner",
      "timeRequired": courseData.duration || "P7W",
      "courseMode": "online",
      "inLanguage": "en-US",
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "inLanguage": "en-US"
      }
    };

    this.addStructuredData(schema);
  }

  // Add Article structured data for scientific evidence
  addArticleSchema(articleData: {
    title: string;
    description: string;
    url: string;
    author: string;
    datePublished: string;
    dateModified: string;
    image?: string;
  }): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": articleData.title,
      "description": articleData.description,
      "url": articleData.url,
      "author": {
        "@type": "Organization",
        "name": articleData.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "The Reverse Aging Academy",
        "logo": {
          "@type": "ImageObject",
          "url": `${ENVIRONMENT.currentHostingUrl}/Academy.png`
        }
      },
      "datePublished": articleData.datePublished,
      "dateModified": articleData.dateModified,
      "image": articleData.image || `${ENVIRONMENT.currentHostingUrl}/Academy.png`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleData.url
      }
    };

    this.addStructuredData(schema);
  }

  // Add Breadcrumb structured data
  addBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };

    this.addStructuredData(schema);
  }

  // Helper method to add structured data to page
  private addStructuredData(data: any): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Clear all structured data
  clearStructuredData(): void {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => script.remove());
  }

  // Set up page SEO (comprehensive method)
  setupPageSEO(config: {
    title: string;
    description: string;
    canonicalPath: string;
    ogImage?: string;
    twitterImage?: string;
    type?: string;
    breadcrumbs?: Array<{ name: string; url: string }>;
  }): void {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    
    // Set basic meta tags
    this.setPageTitle(config.title);
    this.setMetaDescription(config.description);
    this.setCanonicalUrl(config.canonicalPath);
    
    // Set social media tags
    this.setOpenGraphTags({
      title: config.title,
      description: config.description,
      image: config.ogImage,
      url: `${baseUrl}${config.canonicalPath}`,
      type: config.type
    });
    
    this.setTwitterCardTags({
      title: config.title,
      description: config.description,
      image: config.twitterImage || config.ogImage
    });
    
    // Add breadcrumbs if provided
    if (config.breadcrumbs) {
      this.addBreadcrumbSchema(config.breadcrumbs);
    }
  }
}

// Export singleton instance
export const seoService = SEOService.getInstance();
