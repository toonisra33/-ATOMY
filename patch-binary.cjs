const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessHighlights.tsx', 'utf-8');

// Remove the import
content = content.replace("import { BinaryNetworkGraphicOverlay } from './BinaryNetworkGraphicOverlay';\n", "");

// Remove the conditional rendering logic:
// Replace this block:
/*
                  {/* If Binary Card: Render Professional 2-Leg Binary Network Graphic Overlay *\/}
                  {item.title.includes('Binary') && (
                    <BinaryNetworkGraphicOverlay />
                  )}

                  {/* If NOT Binary: Render Standard Floating Badges *\/}
                  {!item.title.includes('Binary') && (
                    <>
...
                    </>
                  )}
*/

content = content.replace(/\{\/\* If Binary Card:[^]*?{!item\.title\.includes\('Binary'\) && \(/, '');
content = content.replace(/<>\s*\{\/\* Top Floating Badges/, '{/* Top Floating Badges');

// Find the last closing `</>` and `)}` that matched the !item.title.includes condition
// It's right before `</div>\n\n                {/* Card Content */}`
content = content.replace(/<\/>\s*\)\}\s*<\/div>\s*\{\/\* Card Content \*\/\}/, '</div>\n\n                {/* Card Content */}');

fs.writeFileSync('src/components/BusinessHighlights.tsx', content);
