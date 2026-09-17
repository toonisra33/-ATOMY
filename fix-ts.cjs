const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  'async function fetchSponsorProfile(sponsorId)',
  'async function fetchSponsorProfile(sponsorId: string)'
);

code = code.replace(
  'function injectMetaTags(html, profile)',
  'function injectMetaTags(html: string, profile: any)'
);

code = code.replace(
  'const profile = {};',
  'const profile: any = {};'
);

code = code.replace(
  "app.get('*', async (req, res, next) => {",
  "app.get('*', async (req: any, res: any, next: any) => {"
);

fs.writeFileSync('server.ts', code);
