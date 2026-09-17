import React, { useState } from 'react';
import { KeyRound, Loader2, LockKeyhole, Mail, X } from 'lucide-react';
import { loginWithEmail, resetPassword, registerWithEmail } from '../lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isOpen) return null;

  
    const handleLogin = async (event: React.FormEvent) => {
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
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setMessage('กรุณากรอกอีเมลก่อนขอเปลี่ยนรหัสผ่าน');
      return;
    }
    try {
      await resetPassword(email);
      setMessage('ส่งลิงก์เปลี่ยนรหัสผ่านไปยังอีเมลแล้ว');
    } catch {
      setMessage('ยังไม่สามารถส่งลิงก์ได้ กรุณาตรวจสอบอีเมล');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700" aria-label="ปิด">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><LockKeyhole className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{isRegistering ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ Partner / Admin'}</h2>
            <p className="text-xs text-slate-500">ข้อมูล Lead เปิดได้เฉพาะบัญชีที่ได้รับอนุญาต</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            อีเมล
            <span className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-11 w-full outline-none" autoComplete="email" />
            </span>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            รหัสผ่าน
            <span className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3">
              <KeyRound className="h-4 w-4 text-slate-400" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-11 w-full outline-none" autoComplete="current-password" />
            </span>
          </label>
          {message && <p className="rounded-xl bg-slate-100 p-3 text-xs text-slate-700">{message}</p>}
          
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


          </form>
      </div>
    </div>
  );
};
