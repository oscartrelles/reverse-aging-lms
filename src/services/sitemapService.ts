import { ENVIRONMENT } from '../config/environment';
import { scientificUpdateService } from './scientificUpdateService';
import { courseManagementService } from './courseManagementService';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export class SitemapService {
  private static instance: SitemapService;
  
  private constructor() {}
  
  static getInstance(): SitemapService {
    if (!SitemapService.instance) {
      SitemapService.instance = new SitemapService();
    }
    return SitemapService.instance;
  }

  // Generate static pages sitemap
  private getStaticPages(): SitemapUrl[] {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    const now = new Date().toISOString().split('T')[0];
    
    return [
      {
        loc: `${baseUrl}/`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 1.0
      },
      {
        loc: `${baseUrl}/programs`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.9
      },
      {
        loc: `${baseUrl}/evidence`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        loc: `${baseUrl}/about`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        loc: `${baseUrl}/privacy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        loc: `${baseUrl}/terms`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      }
    ];
  }

  // Generate scientific evidence sitemap
  private async getEvidencePages(): Promise<SitemapUrl[]> {
    try {
      const updates = await scientificUpdateService.getAllUpdates();
      const baseUrl = ENVIRONMENT.currentHostingUrl;
      
      return updates.map(update => ({
        loc: `${baseUrl}/evidence/${update.id}`,
        lastmod: update.publishedDate.toDate().toISOString().split('T')[0],
        changefreq: 'monthly' as const,
        priority: 0.8
      }));
    } catch (error) {
      console.error('Error generating evidence sitemap:', error);
      return [];
    }
  }

  // Generate course pages sitemap
  private async getCoursePages(): Promise<SitemapUrl[]> {
    try {
      const courses = await courseManagementService.getAllCourses();
      const baseUrl = ENVIRONMENT.currentHostingUrl;
      const now = new Date().toISOString().split('T')[0];
      
      return courses
        .filter(course => course.status === 'active')
        .map(course => ({
          loc: `${baseUrl}/course/${course.id}`,
          lastmod: now,
          changefreq: 'weekly' as const,
          priority: 0.8
        }));
    } catch (error) {
      console.error('Error generating course sitemap:', error);
      return [];
    }
  }

  // Generate complete sitemap XML
  async generateSitemapXML(): Promise<string> {
    const staticPages = this.getStaticPages();
    const evidencePages = await this.getEvidencePages();
    const coursePages = await this.getCoursePages();
    
    const allUrls = [...staticPages, ...evidencePages, ...coursePages];
    
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

    const xmlFooter = '</urlset>';
    
    const urlEntries = allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');
    
    return `${xmlHeader}\n\n${urlEntries}\n\n${xmlFooter}`;
  }

  // Generate sitemap index for multiple sitemaps
  generateSitemapIndex(): string {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    const now = new Date().toISOString().split('T')[0];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-evidence.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-courses.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
  }

  // Get sitemap statistics
  async getSitemapStats(): Promise<{
    totalUrls: number;
    staticPages: number;
    evidencePages: number;
    coursePages: number;
    lastGenerated: string;
  }> {
    const staticPages = this.getStaticPages();
    const evidencePages = await this.getEvidencePages();
    const coursePages = await this.getCoursePages();
    
    return {
      totalUrls: staticPages.length + evidencePages.length + coursePages.length,
      staticPages: staticPages.length,
      evidencePages: evidencePages.length,
      coursePages: coursePages.length,
      lastGenerated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const sitemapService = SitemapService.getInstance();
