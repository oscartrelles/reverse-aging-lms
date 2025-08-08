import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// User agents that should receive dynamic meta tags
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Twitterbot',
  'WhatsApp',
  'LinkedInBot',
  'SkypeUriPreview',
  'SlackBot',
  'DiscordBot',
  'TelegramBot',
  'redditbot',
  'Pinterest',
  'GoogleBot'
];

interface ScientificUpdate {
  id: string;
  title: string;
  summary: string;
  publishedDate: admin.firestore.Timestamp;
  tags: string[];
  category: string;
  votes: number;
  views: number;
  author?: string;
}

// Helper function to check if request is from a social media crawler
function isCrawler(userAgent: string): boolean {
  return CRAWLER_USER_AGENTS.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

// Generate HTML with dynamic meta tags
function generateMetaHTML(config: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  author?: string;
}): string {
  const baseUrl = 'https://academy.7weekreverseagingchallenge.com';
  const fallbackImage = `${baseUrl}/Academy.png`;
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1C1F26" />
    
    <!-- Primary Meta Tags -->
    <title>${config.title}</title>
    <meta name="title" content="${config.title}" />
    <meta name="description" content="${config.description}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${config.type || 'website'}" />
    <meta property="og:url" content="${config.url}" />
    <meta property="og:title" content="${config.title}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:image" content="${config.image || fallbackImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${config.title}" />
    <meta property="og:site_name" content="The Reverse Aging Academy" />
    <meta property="og:locale" content="en_US" />
    ${config.publishedTime ? `<meta property="article:published_time" content="${config.publishedTime}" />` : ''}
    ${config.author ? `<meta property="article:author" content="${config.author}" />` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${config.url}" />
    <meta name="twitter:title" content="${config.title}" />
    <meta name="twitter:description" content="${config.description}" />
    <meta name="twitter:image" content="${config.image || fallbackImage}" />
    <meta name="twitter:image:alt" content="${config.title}" />
    <meta name="twitter:site" content="@reverseagingacademy" />
    <meta name="twitter:creator" content="@reverseagingacademy" />
    
    <!-- LinkedIn -->
    <meta property="og:image:secure_url" content="${config.image || fallbackImage}" />
    <meta property="og:image:type" content="image/png" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${config.url}" />
    
    <!-- No redirects in meta HTML - crawlers should see this content -->
  </head>
  <body>
    <div id="loading">
      <h1>${config.title}</h1>
      <p>${config.description}</p>
      <p><a href="${config.url}">Continue to article</a></p>
    </div>
  </body>
</html>`;
}

// Get evidence article data
async function getEvidenceArticle(articleId: string): Promise<ScientificUpdate | null> {
  try {
    const doc = await db.collection('scientificUpdates').doc(articleId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as ScientificUpdate;
  } catch (error) {
    console.error('Error fetching evidence article:', error);
    return null;
  }
}

// Get course data
async function getCourse(courseId: string): Promise<any | null> {
  try {
    const doc = await db.collection('courses').doc(courseId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

// Main function to handle dynamic meta tags
export const dynamicMetaTags = functions.https.onRequest(async (req: Request, res: Response) => {
  const userAgent = req.get('User-Agent') || '';
  const originalUrl = req.originalUrl;
  const host = req.get('host') || 'the-reverse-aging-challenge.web.app';
  const protocol = req.secure ? 'https' : 'http';
  const fullUrl = `${protocol}://${host}${originalUrl}`;
  
  // Log for debugging
  console.log('Request:', { userAgent, originalUrl, host, isCrawler: isCrawler(userAgent) });
  
  // If not a crawler, serve a simple HTML page that redirects via JavaScript
  // This avoids the hosting rewrite redirect loop
  if (!isCrawler(userAgent)) {
    const redirectHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting...</title>
    <script>
      // Immediate redirect to avoid Firebase hosting rewrites
      window.location.replace('https://the-reverse-aging-challenge.web.app${originalUrl}');
    </script>
    <meta http-equiv="refresh" content="0;url=https://the-reverse-aging-challenge.web.app${originalUrl}" />
  </head>
  <body>
    <p>Redirecting to <a href="https://the-reverse-aging-challenge.web.app${originalUrl}">The Reverse Aging Academy</a>...</p>
  </body>
</html>`;
    
    res.set('Content-Type', 'text/html');
    res.status(200).send(redirectHTML);
    return;
  }
  
  try {
    // Parse the URL to determine content type
    const urlParts = originalUrl.split('/').filter(Boolean);
    
    // Handle evidence articles: /evidence/[articleId]
    if (urlParts[0] === 'evidence' && urlParts[1]) {
      const articleId = urlParts[1];
      const article = await getEvidenceArticle(articleId);
      
      if (article) {
        const metaConfig = {
          title: `${article.title} - Scientific Evidence | The Reverse Aging Academy`,
          description: article.summary || 'Latest scientific research on reverse aging and longevity from The Reverse Aging Academy.',
          url: `https://academy.7weekreverseagingchallenge.com/evidence/${article.id}`,
          type: 'article',
          publishedTime: article.publishedDate.toDate().toISOString(),
          author: article.author || 'The Reverse Aging Academy'
        };
        
        const html = generateMetaHTML(metaConfig);
        res.set('Content-Type', 'text/html');
        res.status(200).send(html);
        return;
      }
    }
    
    // Handle course pages: /course/[courseId]
    if (urlParts[0] === 'course' && urlParts[1]) {
      const courseId = urlParts[1];
      const course = await getCourse(courseId);
      
      if (course) {
        const metaConfig = {
          title: `${course.title} - Course | The Reverse Aging Academy`,
          description: course.description || 'Transform your health with evidence-based longevity strategies from The Reverse Aging Academy.',
          url: `https://academy.7weekreverseagingchallenge.com/course/${course.id}`,
          type: 'website'
        };
        
        const html = generateMetaHTML(metaConfig);
        res.set('Content-Type', 'text/html');
        res.status(200).send(html);
        return;
      }
    }
    
    // Handle other pages with default meta tags
    let metaConfig;
    
    switch (urlParts[0]) {
      case 'programs':
        metaConfig = {
          title: 'Programs - The Reverse Aging Academy',
          description: 'Discover our evidence-based programs designed to help you reverse aging and optimize your healthspan.',
          url: `https://academy.7weekreverseagingchallenge.com/programs`,
          type: 'website'
        };
        break;
        
      case 'about':
        metaConfig = {
          title: 'About Us - The Reverse Aging Academy',
          description: 'Learn about The Reverse Aging Academy, our mission to bring evidence-based longevity science to everyone.',
          url: `https://academy.7weekreverseagingchallenge.com/about`,
          type: 'website'
        };
        break;
        
      case 'evidence':
        metaConfig = {
          title: 'Scientific Evidence Library - The Reverse Aging Academy',
          description: 'Explore our comprehensive library of scientific research on reverse aging, longevity, and healthspan optimization.',
          url: `https://academy.7weekreverseagingchallenge.com/evidence`,
          type: 'website'
        };
        break;
        
      default:
        // Default homepage
        metaConfig = {
          title: 'The Reverse Aging Academy - Evidence-Based Longevity Education',
          description: 'Your premier destination for evidence-based longevity education. Join our academy to learn proven strategies for reverse aging, health optimization, and living a longer, healthier life.',
          url: `https://academy.7weekreverseagingchallenge.com/`,
          type: 'website'
        };
    }
    
    const html = generateMetaHTML(metaConfig);
    res.set('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error generating dynamic meta tags:', error);
    
    // Fallback to default meta tags
    const fallbackConfig = {
      title: 'The Reverse Aging Academy - Evidence-Based Longevity Education',
      description: 'Your premier destination for evidence-based longevity education.',
      url: fullUrl,
      type: 'website'
    };
    
    const html = generateMetaHTML(fallbackConfig);
    res.set('Content-Type', 'text/html');
    res.status(200).send(html);
  }
});
