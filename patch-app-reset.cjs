const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert import
code = code.replace(
  'import { LoginModal } from "./components/LoginModal";',
  'import { LoginModal } from "./components/LoginModal";\nimport { ResetPasswordModal } from "./components/ResetPasswordModal";'
);

// Insert state for reset password modal
code = code.replace(
  'const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);',
  'const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);\n  const [resetOobCode, setResetOobCode] = useState<string | null>(null);'
);

// Parse query params for reset password
const parseOobCodeStr = `
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");
      
      if (mode === "resetPassword" && oobCode) {
        setResetOobCode(oobCode);
      }
`;

code = code.replace(
  '// Ensure ?ref= only works if not an admin or owner',
  parseOobCodeStr + '\n      // Ensure ?ref= only works if not an admin or owner'
);

// Insert the ResetPasswordModal component
const modalStr = `      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {resetOobCode && (
        <ResetPasswordModal
          isOpen={!!resetOobCode}
          onClose={() => setResetOobCode(null)}
          oobCode={resetOobCode}
        />
      )}`;

code = code.replace(
  '<LoginModal\n        isOpen={isLoginModalOpen}\n        onClose={() => setIsLoginModalOpen(false)}\n      />',
  modalStr
);

fs.writeFileSync('src/App.tsx', code);
