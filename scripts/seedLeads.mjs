// scripts/seedLeads.mjs
const projectId = 'atomy-sponserweb';
const databaseId = '(default)';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/leads`;

const sampleLeads = [
  {
    fullName: 'คุณสมชาย มีสุข (คุณก้อง)',
    phoneNumber: '0812345678',
    email: 'kong.somchai@gmail.com',
    lineId: 'kong_somchai',
    age: '35',
    occupation: 'พนักงานบริษัทเอกชน (ไอที)',
    status: 'new',
    notes: 'สนใจสร้างรายได้เสริมควบคู่กับงานประจำ มีเวลาช่วงค่ำและวันหยุด ไม่ชอบตื๊อขายของ อยากศึกษาโมเดลเว็บไซต์ช่วยทำงานอัตโนมัติ',
    hasConsent: true,
    sponsorId: '39823016',
    sponsorName: 'อิศราวัฒน์ ปวินทกานต์',
  },
  {
    fullName: 'คุณวรัญญา สุวรรณรัตน์ (คุณน้ำ)',
    phoneNumber: '0898765432',
    email: 'nam.waranya@hotmail.com',
    lineId: 'nam_waranya',
    age: '42',
    occupation: 'ธุรกิจส่วนตัว / ค้าขายออนไลน์',
    status: 'new',
    notes: 'เคยขายของออนไลน์แต่เหนื่อยกับการสต็อกของและแพ็คส่งเอง ชอบคอนเซ็ปต์สินค้าเกาหลีระดับพรีเมียม ซื้อกินซื้อใช้สร้างเครือข่าย',
    hasConsent: true,
    sponsorId: '39823016',
    sponsorName: 'อิศราวัฒน์ ปวินทกานต์',
  },
  {
    fullName: 'คุณธนพล ศรีวิชัย (คุณบอม)',
    phoneNumber: '0923456789',
    email: 'thanapol.bom@gmail.com',
    lineId: 'bomb_eng99',
    age: '29',
    occupation: 'วิศวกรไฟฟ้า',
    status: 'contacted',
    notes: 'ดูคลิปบรรยาย 20 นาทีจบแล้ว สนใจเรื่องโมเดลไบนารี่ 2 สายงาน และระบบ Global สะสมคะแนน PV ไม่จำกัดชั้นลึก',
    hasConsent: true,
    sponsorId: '39823016',
    sponsorName: 'อิศราวัฒน์ ปวินทกานต์',
  },
  {
    fullName: 'คุณพัชรินทร์ เจริญสุข (คุณปุ๊ก)',
    phoneNumber: '0619876543',
    email: 'pook.family@yahoo.com',
    lineId: 'pook_patcha',
    age: '38',
    occupation: 'แม่บ้าน / ดูแลครอบครัว',
    status: 'new',
    notes: 'อยากหารายได้เสริมระหว่างดูแลลูกที่บ้าน ใช้สกินแคร์และของใช้ในบ้านอยู่แล้ว พร้อมเริ่มเรียนรู้งานผ่านระบบมือถือ',
    hasConsent: true,
    sponsorId: '39823016',
    sponsorName: 'อิศราวัฒน์ ปวินทกานต์',
  },
  {
    fullName: 'คุณกิตติศักดิ์ พงษ์ไพศาล (คุณเอ็ม)',
    phoneNumber: '0865554321',
    email: 'kittisak.m@outlook.com',
    lineId: 'kru_m_atomy',
    age: '46',
    occupation: 'ข้าราชการครู',
    status: 'completed',
    notes: 'มองหาโอกาสเกษียณล่วงหน้า อยากสร้าง Passive Income ระยะยาว ชอบที่ไม่บังคับรักษายอดรายเดือน และสมัครสมาชิกฟรี',
    hasConsent: true,
    sponsorId: '39823016',
    sponsorName: 'อิศราวัฒน์ ปวินทกานต์',
  },
  {
    fullName: 'คุณชลธิชา มณีรัตน์ (คุณฟ้า)',
    phoneNumber: '0958881234',
    email: 'fah.marketing@gmail.com',
    lineId: 'fah_chonthicha',
    age: '27',
    occupation: 'ฟรีแลนซ์การตลาดออนไลน์',
    status: 'contacted',
    notes: 'ชอบระบบการตลาดดิจิทัล อยากใช้ลิงก์และระบบเว็บพ่วงสปอนเซอร์ของทีม Atomy Freedomlife ขยายสายงานต่อ',
    hasConsent: true,
    sponsorId: '39823016',
    sponsorName: 'อิศราวัฒน์ ปวินทกานต์',
  },
];

async function run() {
  console.log('Seeding sample leads into Firestore...');
  const now = Date.now();

  for (let i = 0; i < sampleLeads.length; i++) {
    const lead = sampleLeads[i];
    const createdAt = new Date(now - (i * 3600 * 1000 * 3 + i * 18 * 60 * 1000)).toISOString();
    
    const body = {
      fields: {
        fullName: { stringValue: lead.fullName },
        phoneNumber: { stringValue: lead.phoneNumber },
        email: { stringValue: lead.email },
        lineId: { stringValue: lead.lineId },
        age: { stringValue: lead.age },
        occupation: { stringValue: lead.occupation },
        status: { stringValue: lead.status },
        notes: { stringValue: lead.notes },
        hasConsent: { booleanValue: lead.hasConsent },
        sponsorId: { stringValue: lead.sponsorId },
        sponsorName: { stringValue: lead.sponsorName },
        createdAt: { stringValue: createdAt },
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const created = await res.json();
      console.log(`Created lead [${i + 1}/${sampleLeads.length}]: ${lead.fullName} -> ${created.name}`);
    } else {
      const err = await res.text();
      console.error(`Failed to create lead ${lead.fullName}:`, err);
    }
  }
}

run();
