const fs = require('fs');

// We need to create or update .firebaserc to map the target to the site
let rc = {};
if (fs.existsSync('.firebaserc')) {
  rc = JSON.parse(fs.readFileSync('.firebaserc', 'utf-8'));
}

if (!rc.projects) {
  rc.projects = { default: "localhub-69fbe" };
}

if (!rc.targets) {
  rc.targets = {};
}
if (!rc.targets["localhub-69fbe"]) {
  rc.targets["localhub-69fbe"] = {};
}
if (!rc.targets["localhub-69fbe"].hosting) {
  rc.targets["localhub-69fbe"].hosting = {};
}

// Map the target name to the actual site ID
rc.targets["localhub-69fbe"].hosting["sponsor-atomy"] = [
  "sponsor-atomy"
];

fs.writeFileSync('.firebaserc', JSON.stringify(rc, null, 2));
