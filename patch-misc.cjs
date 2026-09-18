const fs = require('fs');
let footer = fs.readFileSync('src/components/Footer.tsx', 'utf-8');
footer = footer.replace(/<p><strong className="text-white">รหัสสปอนเซอร์:<\/strong> \{sponsor\.sponsorId\}<\/p>/g, '');
fs.writeFileSync('src/components/Footer.tsx', footer);

let biz = fs.readFileSync('src/components/BusinessHighlights.tsx', 'utf-8');
biz = biz.replace(/แอด LINE ขอรับรหัสสปอนเซอร์ฟรี/g, 'แอด LINE ขอลิงก์สมัครสมาชิกฟรี');
fs.writeFileSync('src/components/BusinessHighlights.tsx', biz);

let vid = fs.readFileSync('src/components/VideoSection.tsx', 'utf-8');
vid = vid.replace(/รับรหัสสปอนเซอร์ และคู่มือเริ่มต้นธุรกิจฟรี/g, 'รับลิงก์สมัครสมาชิก และคู่มือเริ่มต้นธุรกิจฟรี');
fs.writeFileSync('src/components/VideoSection.tsx', vid);
