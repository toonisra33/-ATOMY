const fs = require('fs');
let content = fs.readFileSync('src/components/LineCtaSection.tsx', 'utf-8');

// The goal is to wrap the content after the header in a grid.
// First, find the end of the header
const headerEnd = `          </div>

          {/* Sponsor Profile & Quick Contact Summary */}`;

const replaceWith = `          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* Sponsor Profile & Quick Contact Summary */}`;
              
content = content.replace(headerEnd, replaceWith);

// Now wrap the form in the second column
const formStart = `          {/* Quick Consultation Request Form (Firebase Firestore Integration) */}`;
const formWrap = `            </div>
            
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* Quick Consultation Request Form (Firebase Firestore Integration) */}`;

content = content.replace(formStart, formWrap);

// Now close the grid before Guarantees
const guaranteesStart = `          {/* Guarantees */}`;
const guaranteesWrap = `            </div>
          </div>
          
          {/* Guarantees */}`;
          
content = content.replace(guaranteesStart, guaranteesWrap);

fs.writeFileSync('src/components/LineCtaSection.tsx', content);
