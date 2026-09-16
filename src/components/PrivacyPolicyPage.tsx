import React from "react";
import { Shield, ArrowLeft } from "lucide-react";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </a>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              นโยบายความเป็นส่วนตัว (Privacy Policy)
            </h1>
          </div>

          <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 leading-relaxed">
            <p className="mb-4">
              <strong>อัปเดตล่าสุด:</strong>{" "}
              {new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">
              1. ข้อมูลที่เราเก็บรวบรวม
            </h3>
            <p className="mb-4">
              เมื่อคุณใช้งานเว็บไซต์ <strong>Atomy Satellite Funnel</strong>{" "}
              (เว็บพ่วงสปอนเซอร์) นี้
              เราอาจเก็บรวบรวมข้อมูลส่วนบุคคลของคุณเท่าที่จำเป็น ได้แก่:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              <li>
                <strong>ชื่อ-นามสกุล</strong>{" "}
                (ที่คุณยินยอมกรอกในแบบฟอร์มให้ติดต่อกลับ)
              </li>
              <li>
                <strong>หมายเลขโทรศัพท์</strong>{" "}
                (ที่คุณยินยอมกรอกในแบบฟอร์มให้ติดต่อกลับ)
              </li>
              <li>
                <strong>LINE ID</strong> (หากคุณระบุเพื่อให้ติดต่อกลับ)
              </li>
              <li>
                <strong>ข้อมูลการใช้งาน</strong> ผ่านเครื่องมือวิเคราะห์ (เช่น
                Facebook Pixel, Google Analytics, หรือ TikTok Pixel)
                ซึ่งอาจเก็บข้อมูลคุกกี้, IP Address,
                และพฤติกรรมการเรียกดูหน้าเว็บไซต์
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">
              2. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล
            </h3>
            <p className="mb-4">
              ข้อมูลของคุณจะถูกใช้เพื่อวัตถุประสงค์ดังต่อไปนี้เท่านั้น:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              <li>
                เพื่อให้สปอนเซอร์หรือที่ปรึกษาธุรกิจ Atomy ที่ดูแลหน้าเว็บนี้
                ติดต่อกลับเพื่อให้ข้อมูล แนะนำการสมัครสมาชิก
                หรือส่งต่อเครื่องมือการทำงาน
              </li>
              <li>
                เพื่อวิเคราะห์และปรับปรุงประสิทธิภาพของเว็บไซต์และการทำการตลาด
                (ผ่าน Pixel)
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">
              3. การเก็บรักษาและปกป้องข้อมูล
            </h3>
            <p className="mb-6">
              เราตระหนักถึงความสำคัญของข้อมูลส่วนบุคคลของคุณ
              ข้อมูลที่ส่งผ่านฟอร์มบนเว็บไซต์นี้จะถูกจัดเก็บไว้ในฐานข้อมูลที่มีความปลอดภัย
              (Firebase Firestore)
              และจะถูกจำกัดการเข้าถึงเฉพาะสปอนเซอร์หรือเจ้าของลิงก์แอฟฟิลิเอตนั้นๆ
              เพื่อใช้ติดต่อคุณโดยตรงเท่านั้น เราจะไม่มีการนำข้อมูลของคุณไปขาย
              แจกจ่าย หรือส่งต่อให้แก่บุคคลที่สามที่ไม่เกี่ยวข้อง
            </p>

            <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">
              4. การใช้คุกกี้ (Cookies) และ Tracking Pixels
            </h3>
            <p className="mb-6">
              เว็บไซต์นี้อาจมีการใช้งานคุกกี้และเทคโนโลยีการติดตาม (Tracking
              Pixels) เพื่อมอบประสบการณ์การใช้งานที่ดีขึ้น
              และช่วยให้เจ้าของเว็บไซต์สามารถวัดผลแคมเปญโฆษณาได้
              หากคุณไม่ต้องการให้เบราว์เซอร์จัดเก็บคุกกี้
              คุณสามารถตั้งค่าในเบราว์เซอร์ของคุณเพื่อปฏิเสธการใช้คุกกี้ได้
            </p>

            <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">
              5. สิทธิของเจ้าของข้อมูล
            </h3>
            <p className="mb-6">
              ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)
              คุณมีสิทธิ์ที่จะขอเข้าถึง, ขอแก้ไข, ขอระงับการใช้,
              หรือขอลบข้อมูลส่วนบุคคลของคุณออกจากระบบของเรา
              หากคุณต้องการใช้สิทธิ์ดังกล่าว สามารถติดต่อเรา
              (หรือสปอนเซอร์ของคุณ) ได้โดยตรงผ่านช่องทาง LINE
              หรือเบอร์โทรศัพท์ที่ระบุไว้ในหน้าหลัก
            </p>

            <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">
              6. ข้อสงวนสิทธิ์ (Disclaimer)
            </h3>
            <p className="mb-6">
              เว็บไซต์นี้จัดทำขึ้นโดย <strong>นักธุรกิจอิสระอะโทมี่</strong>{" "}
              (Atomy Independent Business Owner) เพื่อประโยชน์ในการแนะนำสายงาน
              ไม่ใช่เว็บไซต์อย่างเป็นทางการของบริษัท อะโทมี่ (ประเทศไทย) จำกัด
              แต่อย่างใด
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
