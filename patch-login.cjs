const fs = require('fs');
let code = fs.readFileSync('src/components/LoginModal.tsx', 'utf-8');

// Replace the imports to include createUserWithEmailAndPassword
code = code.replace(
  "import { loginWithEmail, resetPassword } from '../lib/auth';",
  "import { loginWithEmail, resetPassword, registerWithEmail } from '../lib/auth';"
);

// Add state for isRegistering
code = code.replace(
  "const [message, setMessage] = useState('');",
  "const [message, setMessage] = useState('');\n  const [isRegistering, setIsRegistering] = useState(false);"
);

// Update handleLogin to handle registration as well
const handleLoginBlock = `  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
        setMessage('สร้างบัญชีสำเร็จ! (หากเป็นแอดมิน กรุณารอระบบอัปเดตสิทธิ์)');
        // Auto close after success?
        setTimeout(() => { onClose(); }, 2000);
      } else {
        await loginWithEmail(email, password);
        onClose();
      }
    } catch (error: any) {
      if (isRegistering) {
         setMessage(error.message?.includes('email-already') ? 'อีเมลนี้มีในระบบแล้ว' : 'ไม่สามารถสร้างบัญชีได้ รหัสผ่านต้อง 6 ตัวขึ้นไป');
      } else {
         setMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชียังไม่ได้รับสิทธิ์');
      }
    } finally {
      setLoading(false);
    }
  };`;

code = code.replace(/const handleLogin = async.*?finally {\s*setLoading\(false\);\s*}\s*};/s, handleLoginBlock);

// Update UI to toggle Register/Login
const toggleBlock = `
          <button disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRegistering ? 'สร้างบัญชี (สมัครสมาชิก)' : 'เข้าสู่ระบบ'}
          </button>
          <div className="flex justify-between w-full mt-2">
            <button type="button" onClick={handleReset} className="text-xs font-medium text-slate-500 hover:text-blue-600">ลืมรหัสผ่าน?</button>
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setMessage(''); }} className="text-xs font-medium text-slate-500 hover:text-blue-600">
              {isRegistering ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'เพิ่มบัญชีใหม่ (สำหรับแอดมิน/ลูกทีม)'}
            </button>
          </div>
`;

code = code.replace(/<button disabled=\{loading\}.*?ลืมรหัสผ่าน<\/button>/s, toggleBlock);

// Also change the title
code = code.replace(
  "<h2 className=\"text-xl font-bold text-slate-900\">เข้าสู่ระบบ Partner / Admin</h2>",
  "<h2 className=\"text-xl font-bold text-slate-900\">{isRegistering ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ Partner / Admin'}</h2>"
);

fs.writeFileSync('src/components/LoginModal.tsx', code);
