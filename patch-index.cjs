const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

// Insert placeholders
code = code.replace('<meta property="og:type" content="website" />', 
  '<meta property="og:type" content="website" />\n' +
  '    <meta property="og:image" content="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80" />\n' +
  '    <meta name="twitter:title" content="Atomy Satellite Funnel" />\n' +
  '    <meta name="twitter:description" content="เว็บลูกข่ายพ่วงทราฟฟิกและสปอนเซอร์ผู้มุ่งหวังเข้าสู่ธุรกิจอะโทมี่" />\n' +
  '    <meta name="twitter:image" content="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80" />'
);

fs.writeFileSync('index.html', code);
