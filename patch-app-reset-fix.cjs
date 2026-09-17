const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  'const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);',
  'const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);\n  const [resetOobCode, setResetOobCode] = useState<string | null>(null);'
);

fs.writeFileSync('src/App.tsx', code);
