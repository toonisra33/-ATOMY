import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

const DEFAULT_TITLE = 'โอกาสสร้างรายได้เสริมควบคู่กับงานประจำ/และโอกาสที่แสนเรียบง่าย';
const DEFAULT_DESC = 'ระบบเรียนรู้ออนไลน์ ดูฟรี 15 นาที พร้อมที่ปรึกษาคอยดูแล';
const DEFAULT_DESKTOP_IMAGE = 'https://sponsor-atomy.web.app/og-image.jpg';
const DEFAULT_MOBILE_IMAGE = 'https://sponsor-atomy.web.app/og-image-mobile.jpg';

async function fetchSponsorProfile(sponsorId: string) {
  try {
    const projectId = 'localhub-69fbe';
    const databaseId = 'ai-studio-atomy-8c095ab7-7361-4880-9af8-2d105a37ebb2';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/sponsors/${sponsorId}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.fields) return null;

    const profile: any = {};
    for (const [key, value] of Object.entries(data.fields as Record<string, any>)) {
      if (value.stringValue !== undefined) profile[key] = value.stringValue;
    }
    return profile;
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    return null;
  }
}

function injectMetaTags(html: string, profile: any, isMobile: boolean = false) {
  const title = profile?.sponsorName ? `${profile.sponsorName} - โอกาสสร้างรายได้เสริมควบคู่กับงานประจำ/และโอกาสที่แสนเรียบง่าย` : DEFAULT_TITLE;
  const description = profile?.welcomeNote || DEFAULT_DESC;
  const image = profile?.avatarUrl || (isMobile ? DEFAULT_MOBILE_IMAGE : DEFAULT_DESKTOP_IMAGE);
  const imageWidth = isMobile ? '1080' : '1200';
  const imageHeight = isMobile ? '720' : '630';

  return html
    .replace(/<title>(.*?)<\/title>/, `<title>${title}</title>`)
    .replace(/<meta property="og:title" content="([^"]*?)"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta name="description" content="([^"]*?)"\s*\/?>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:description" content="([^"]*?)"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:image" content="([^"]*?)"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta property="og:image:secure_url" content="([^"]*?)"\s*\/?>/, `<meta property="og:image:secure_url" content="${image}" />`)
    .replace(/<meta property="og:image:width" content="([^"]*?)"\s*\/?>/, `<meta property="og:image:width" content="${imageWidth}" />`)
    .replace(/<meta property="og:image:height" content="([^"]*?)"\s*\/?>/, `<meta property="og:image:height" content="${imageHeight}" />`)
    .replace(/<meta name="twitter:title" content="([^"]*?)"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="([^"]*?)"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<meta name="twitter:image" content="([^"]*?)"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  let vite: any;

  // JSON Body parser for API endpoints (supports banner image uploads up to 50MB)
  app.use(express.json({ limit: '50mb' }));

  // API Route to upload/replace Desktop or Mobile social sharing banner
  app.post('/api/admin/upload-banner', (req, res) => {
    try {
      const { imageBase64, bannerType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing image data' });
      }

      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = bannerType === 'mobile' ? 'og-image-mobile.jpg' : 'og-image.jpg';
      const publicPath = path.join(process.cwd(), 'public', fileName);
      fs.writeFileSync(publicPath, buffer);

      // If dist folder exists, sync to dist as well
      const distPath = path.join(process.cwd(), 'dist', fileName);
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        fs.writeFileSync(distPath, buffer);
      }

      return res.json({ 
        success: true, 
        fileName, 
        url: `/${fileName}?v=${Date.now()}` 
      });
    } catch (err: any) {
      console.error('Error saving banner:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use('/assets', express.static(path.join(distPath, 'assets')));
    app.use(express.static(distPath, { index: false }));
  }

  app.get('*', async (req: any, res: any, next: any) => {
    try {
      const url = req.originalUrl;
      const refMatch = url.match(/[?&]ref=([^&]+)/);
      const sponsorId = refMatch ? refMatch[1] : null;

      let html = '';

      if (!isProd) {
        const template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        html = await vite.transformIndexHtml(url, template);
      } else {
        html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8');
      }

      const profile = sponsorId ? await fetchSponsorProfile(sponsorId) : null;
      
      // Detect whether the requesting client or crawler is Mobile or Desktop
      const userAgent = (req.headers['user-agent'] || '').toString().toLowerCase();
      const isMobile = /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini/i.test(userAgent) ||
        (/android/i.test(userAgent) && !/tablet/i.test(userAgent));

      html = injectMetaTags(html, profile, isMobile);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
