const fs = require('fs');

// Patch Navbar
let nav = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');
nav = nav.replace(/รหัส: {sponsor\.sponsorId}/, '');
fs.writeFileSync('src/components/Navbar.tsx', nav);

// Patch Hero
let hero = fs.readFileSync('src/components/Hero.tsx', 'utf-8');
hero = hero.replace(/<span className="text-slate-500 font-sans font-normal text-\[11px\]">รหัส:<\/span>\s*<span className="text-slate-700 font-mono font-bold text-xs sm:text-sm">\{sponsor\.sponsorId\}<\/span>/, '');
hero = hero.replace(/แอด Line เพื่อขอรับรหัสฟรี/g, 'แอด Line เพื่อสมัครสมาชิกฟรี');
fs.writeFileSync('src/components/Hero.tsx', hero);

// Patch LineCtaSection
let cta = fs.readFileSync('src/components/LineCtaSection.tsx', 'utf-8');
cta = cta.replace(/รับรหัสสปอนเซอร์ \$\{sponsor\.sponsorId\}/g, 'รับลิงก์สมัครสมาชิก');
cta = cta.replace(/เพื่อรับรหัสฟรี/g, 'เพื่อสมัครฟรี');
cta = cta.replace(/การเปิดรหัสสมาชิก Atomy จำเป็นต้องใช้/g, 'การสมัครสมาชิก Atomy จำเป็นต้องมีผู้แนะนำ');
cta = cta.replace(/รหัสสปอนเซอร์/g, 'ลิงก์สมัครสมาชิก');
cta = cta.replace(/แนะนำการเปิดรหัสสมาชิกโดยเร็วที่สุด/g, 'แนะนำการสมัครสมาชิกโดยเร็วที่สุด');
fs.writeFileSync('src/components/LineCtaSection.tsx', cta);

