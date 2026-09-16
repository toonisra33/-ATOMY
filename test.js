import pkg from 'jsdom';
const { JSDOM } = pkg;
import fs from 'fs';

const html = fs.readFileSync('dist/index.html', 'utf8');
const jsFiles = fs.readdirSync('dist/assets').filter(f => f.endsWith('.js'));
let scriptContent = '';
for (const file of jsFiles) {
  scriptContent += fs.readFileSync(`dist/assets/${file}`, 'utf8') + '\n';
}

const dom = new JSDOM(html.replace(/<script[^>]*><\/script>/g, '') + `<script>${scriptContent}</script>`, { 
  runScripts: "dangerously",
  url: "http://localhost/"
});

dom.window.addEventListener("error", (event) => {
  console.error("DOM ERROR CAUGHT:", event.error ? event.error.message : event.message);
});

dom.window.addEventListener("unhandledrejection", (event) => {
  console.error("UNHANDLED REJECTION:", event.reason);
});

setTimeout(() => {
  console.log("HTML length:", dom.window.document.body.innerHTML.length);
  process.exit(0);
}, 2000);
