const functions = require('firebase-functions');
const fs = require('fs');
const path = require('path');

const DEFAULT_TITLE = 'เปลี่ยนรายจ่ายเป็นรายได้กับ Atomy';
const DEFAULT_DESC = 'โอกาสธุรกิจออนไลน์ระดับโลก 26+ ประเทศ สมัครฟรี 100%';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80';

async function fetchSponsorProfile(sponsorId) {
  try {
    const projectId = 'localhub-69fbe';
    const databaseId = 'ai-studio-atomy-8c095ab7-7361-4880-9af8-2d105a37ebb2';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/sponsors/${sponsorId}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.fields) return null;

    const profile = {};
    for (const [key, value] of Object.entries(data.fields)) {
      if (value.stringValue !== undefined) profile[key] = value.stringValue;
    }
    return profile;
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    return null;
  }
}

function injectMetaTags(html, profile) {
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

exports.ssr = functions.https.onRequest(async (req, res) => {
  try {
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
    
    const sponsorId = req.query.ref;
    const profile = sponsorId ? await fetchSponsorProfile(sponsorId) : null;
    
    html = injectMetaTags(html, profile);
    
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.status(200).send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});
