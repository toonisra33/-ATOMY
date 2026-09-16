import { JSDOM } from 'jsdom';
import fs from 'fs';
const html = fs.readFileSync('dist/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
dom.window.addEventListener("error", (event) => {
  console.error("DOM ERROR:", event.error);
});
setTimeout(() => {
  console.log("App rendered HTML length:", dom.window.document.body.innerHTML.length);
  process.exit(0);
}, 2000);
