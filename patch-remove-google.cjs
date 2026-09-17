const fs = require('fs');
let code = fs.readFileSync('src/components/LoginModal.tsx', 'utf-8');

// Remove import
code = code.replace(', loginWithGoogle ', ' ');

// Remove handleGoogleLogin function
code = code.replace(/const handleGoogleLogin = async \(\) => \{[\s\S]*?\};\s*const handleLogin/g, 'const handleLogin');

// Remove button and separator UI
code = code.replace(/<div className="relative my-4">[\s\S]*?<\/button>\s*<\/form>/g, '</form>');

fs.writeFileSync('src/components/LoginModal.tsx', code);
