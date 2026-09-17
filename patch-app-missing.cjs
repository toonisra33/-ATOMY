const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  'const [isLeadsModalOpen, setIsLeadsModalOpen] = useState<boolean>(false);',
  `const [isLeadsModalOpen, setIsLeadsModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);`
);

const generatedUrlStr = `  const generatedAffiliateUrl = typeof window !== 'undefined' 
    ? \`\${window.location.origin}\${window.location.pathname}?ref=\${sponsor.sponsorId}\`
    : '';
  const qrCodeUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=\${encodeURIComponent(generatedAffiliateUrl)}\`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedAffiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };\n\n`;

code = code.replace(
  '// Parse URL query parameters',
  generatedUrlStr + '// Parse URL query parameters'
);

fs.writeFileSync('src/App.tsx', code);
