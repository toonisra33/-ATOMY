const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import if not present
if (!content.includes('PrivacyPolicyPage')) {
  const importStatement = "import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';\n";
  content = content.replace(/(import .* from '.*';\n)+/, match => match + importStatement);
}

// Add state for current path
if (!content.includes('const [currentPath,')) {
  const stateInsert = `
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);
`;
  content = content.replace('const [isLeadsModalOpen, setIsLeadsModalOpen] = useState<boolean>(false);', 'const [isLeadsModalOpen, setIsLeadsModalOpen] = useState<boolean>(false);' + stateInsert);
}

// Conditionally render PrivacyPolicyPage
const returnStatement = `  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">`;

const replaceReturn = `  if (currentPath === '/privacy') {
    return <PrivacyPolicyPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">`;
    
content = content.replace(returnStatement, replaceReturn);

fs.writeFileSync('src/App.tsx', content);
