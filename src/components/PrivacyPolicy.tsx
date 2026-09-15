import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => (
  <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
    <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> กลับหน้าเว็บไซต์
      </a>
      <div className="mt-6 flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><ShieldCheck className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-sm text-slate-500">ปรับปรุงล่าสุด 15 กันยายน 2569</p>
        </div>
      </div>
      <div className="mt-8 space-y-6 text-sm leading-7">
        <section><h2 className="font-bold text-slate-950">ข้อมูลที่เก็บ</h2><p>เมื่อคุณขอให้ติดต่อกลับ ระบบจะเก็บชื่อ เบอร์โทรศัพท์ LINE ID (ถ้ามี) วันเวลาที่ให้ความยินยอม แหล่งที่มาของแคมเปญ และรหัสสปอนเซอร์ที่ดูแลคุณ</p></section>
        <section><h2 className="font-bold text-slate-950">วัตถุประสงค์</h2><p>ใช้เพื่อติดต่อให้ข้อมูลเกี่ยวกับผลิตภัณฑ์ การสมัครสมาชิก และโอกาสทางธุรกิจ ATOMY รวมถึงวัดผลหน้าเว็บไซต์และโฆษณา ระบบจะไม่ขายข้อมูลส่วนบุคคลของคุณ</p></section>
        <section><h2 className="font-bold text-slate-950">ผู้ที่เข้าถึงข้อมูล</h2><p>สปอนเซอร์เจ้าของลิงก์จะเห็นเฉพาะผู้สนใจที่ส่งข้อมูลผ่านลิงก์ของตน ผู้ดูแลระบบที่ได้รับอนุญาตอาจเข้าถึงข้อมูลเพื่อดูแลระบบและแก้ไขปัญหา</p></section>
        <section><h2 className="font-bold text-slate-950">ระยะเวลาจัดเก็บและความปลอดภัย</h2><p>ข้อมูลถูกจัดเก็บใน Firebase โดยจำกัดสิทธิ์ด้วยบัญชีผู้ใช้และกฎความปลอดภัย เก็บไว้เท่าที่จำเป็นต่อการติดตามคำขอหรือจนกว่าคุณจะขอลบ</p></section>
        <section><h2 className="font-bold text-slate-950">สิทธิ์ของคุณ</h2><p>คุณสามารถขอเข้าถึง แก้ไข ถอนความยินยอม หรือลบข้อมูลได้ โดยติดต่อผู้ดูแลผ่าน LINE ที่แสดงบนหน้าเว็บไซต์ซึ่งคุณใช้ส่งข้อมูล</p></section>
        <section><h2 className="font-bold text-slate-950">คุกกี้และระบบวัดผล</h2><p>เว็บไซต์อาจใช้ Meta Pixel, TikTok Pixel และ Google Analytics เพื่อวัดการเข้าชมและผลลัพธ์โฆษณา ข้อมูลแคมเปญ เช่น UTM และ TikTok Click ID อาจถูกบันทึกพร้อมคำขอของคุณ</p></section>
      </div>
    </article>
  </main>
);
