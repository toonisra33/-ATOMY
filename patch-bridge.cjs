const fs = require('fs');
let code = fs.readFileSync('src/components/TrafficBridgeSection.tsx', 'utf-8');

code = code.replace(/3 ขั้นตอนการเปิดรหัสสมาชิกฟรีสู่เว็บหลัก Atomy/g, '3 ขั้นตอนการสมัครสมาชิกฟรีสู่เว็บหลัก Atomy');
code = code.replace(/ทัก LINE รับรหัสสปอนเซอร์/g, 'ทัก LINE ติดต่อที่ปรึกษา');
code = code.replace(/ติดต่อสปอนเซอร์ผ่าน LINE Official เพื่อรับรหัสสปอนเซอร์ล่าสุด และสอบถามข้อมูลเบื้องต้น/g, 'ติดต่อที่ปรึกษาผ่าน LINE Official เพื่อรับลิงก์สมัครสมาชิกและสอบถามข้อมูลเบื้องต้น');
code = code.replace(/กรอกรหัสสปอนเซอร์ \& รับรหัสสมาชิก/g, 'สมัครสมาชิก \& รับรหัสส่วนตัว');
code = code.replace(/ระบุรหัสสปอนเซอร์ในระบบ ระบบจะออกรหัสสมาชิกส่วนตัวให้ทันที สามารถเริ่มสั่งซื้อสินค้าและเริ่มสร้างรายได้ได้เลย/g, 'สมัครสมาชิกผ่านลิงก์ของที่ปรึกษา ระบบจะออกรหัสสมาชิกให้ทันที เริ่มสั่งซื้อและสร้างรายได้ได้เลย');
code = code.replace(/<div className="mt-2 bg-blue-50[\s\S]*?<\/div>/g, '');

fs.writeFileSync('src/components/TrafficBridgeSection.tsx', code);
