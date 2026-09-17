import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

const DEFAULT_TITLE = 'เปลี่ยนรายจ่ายเป็นรายได้กับ Atomy';
const DEFAULT_DESC = 'โอกาสธุรกิจออนไลน์ระดับโลก 26+ ประเทศ สมัครฟรี 100%';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80';

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

function injectMetaTags(html: string, profile: any) {
  const title = profile?.sponsorName ? `${profile.sponsorName} - ที่ปรึกษาธุรกิจ Atomy` : DEFAULT_TITLE;
  const description = profile?.welcomeNote || DEFAULT_DESC;
  const image = profile?.avatarUrl || DEFAULT_IMAGE;

  return html
    .replace(/<title>(.*?)<\/title>/, `<title>${title}</title>`)
    .replace(/<meta property="og:title" content="([^"]*?)"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta name="description" content="([^"]*?)"\s*\/?>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:description" content="([^"]*?)"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:image" content="([^"]*?)"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta name="twitter:title" content="([^"]*?)"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="([^"]*?)"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<meta name="twitter:image" content="([^"]*?)"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  let vite;

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
      html = injectMetaTags(html, profile); // Inject even if profile is null, to set the DEFAULT_TITLE

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
