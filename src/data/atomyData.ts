import { SponsorProfile, VideoChapter, VideoPreset, BenefitItem, FaqItem } from '../types';

export const DEFAULT_SPONSOR: SponsorProfile = {
  sponsorId: '39823016',
  sponsorName: 'อิศราวัฒน์ ปวินทกานต์ (คุณทูน)',
  sponsorPosition: 'ที่ปรึกษาธุรกิจ Atomy Thailand',
  lineId: 'sj7FVdJ',
  lineUrl: 'https://lin.ee/sj7FVdJ',
  phoneNumber: '093-065-2881',
  teamName: 'Atomy Thailand Team freedomlife',
  welcomeNote: 'ยินดีต้อนรับทุกท่านที่กำลังมองหาโอกาสธุรกิจระดับโลก สมัครฟรี ไม่มีค่าใช้จ่าย พร้อมที่ปรึกษามืออาชีพดูแลตลอด 24 ชม.',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
};

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'atomy-15min-intro',
    title: 'เจาะลึกธุรกิจ Atomy ใน 15 นาที: แผนการตลาด และโมเดล Masstige',
    subtitle: 'คลิปบรรยายพิเศษฉบับกระชับสำหรับผู้มุ่งหวังและผู้สนใจเริ่มต้นธุรกิจ',
    durationLabel: '15 นาที',
    youtubeId: 'h9eRrJ0V5N8', // https://www.youtube.com/watch?v=h9eRrJ0V5N8
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    speaker: 'บรรยายโดย อิศราวัฒน์ ปวินทกานต์ (คุณทูน)',
    description: 'ภาพรวมของธุรกิจอะโทมี่ แหล่งที่มาของรายได้ ระบบไบนารีระดับโลก และความมั่นคงของบริษัทระดับโลกจากเกาหลีใต้',
  },
];

export const VIDEO_CHAPTERS: VideoChapter[] = [
  {
    id: 1,
    timeSeconds: 0,
    timestamp: '00:00',
    title: 'บทนำ: บริษัท อะโทมี่ (Atomy) มหาอำนาจธุรกิจระดับโลก',
    description: 'ก่อตั้งขึ้นที่เกาหลีใต้ เติบโตสู่ 26+ ประเทศทั่วโลกด้วยปรัชญาเคารพจิตวิญญาณ',
    highlight: 'ยอดขายหมื่นล้านบาทต่อปี ติดอันดับโลก DSN Global 100',
  },
  {
    id: 2,
    timeSeconds: 180, // 3:00
    timestamp: '03:00',
    title: 'กลยุทธ์ Masstige (Absolute Quality, Absolute Price)',
    description: 'คุณภาพสูงสุดในราคาที่ทุกคนจับต้องได้ ทำให้เกิดการซื้อซ้ำจากผู้บริโภคจริง 100%',
    highlight: 'ไม่ต้องตื๊อขาย ลูกค้าซื้อใช้เพราะสินค้าดีจริงในชีวิตประจำวัน',
  },
  {
    id: 3,
    timeSeconds: 390, // 6:30
    timestamp: '06:30',
    title: 'แผนการตลาดแบบ Global One Market (Binary System)',
    description: 'เชื่อมโยงเครือข่ายทั่วโลกในรหัสเดียว รหัสเดียวต่อสายงานได้ทุกประเทศทั่วโลก',
    highlight: 'ไม่มีจำกัดชั้นลึก (Unlimited Depth) ขยายได้ทั่วโลกแบบไร้พรมแดน',
  },
  {
    id: 4,
    timeSeconds: 600, // 10:00
    timestamp: '10:00',
    title: 'คะแนน PV ไม่มีวันหมดอายุ & รายได้ Passive Income',
    description: 'คะแนนสะสมส่วนตัว (Personal PV) อยู่ตลอดชีพ ไม่มีการตัดทิ้ง ไม่ต้องรักษายอดรายเดือน',
    highlight: 'ไม่มีค่าแรกเข้ารายปี ไม่มีค่าธรรมเนียมสมัครสมาชิกใดๆ ทั้งสิ้น',
  },
  {
    id: 5,
    timeSeconds: 780, // 13:00
    timestamp: '13:00',
    title: 'ก้าวแรกในการสมัคร & รับรหัสสปอนเซอร์เพื่อเริ่มต้นฟรี',
    description: 'วิธีเข้าร่วมทีม รับสิทธิ์การเป็นหุ้นส่วนธุรกิจ และแนวทางการทำงานร่วมกับโค้ชพี่เลี้ยง',
    highlight: 'แอด Line Official เพื่อขอรับรหัสสปอนเซอร์และสิทธิ์เข้ากลุ่มเรียนรู้ฟรี',
  },
];

export const BUSINESS_BENEFITS: BenefitItem[] = [
  {
    iconName: 'ShieldCheck',
    title: 'สมัครฟรี 100% ไม่มีค่าแรกเข้า',
    description: 'ไม่ต้องจ่ายค่าธรรมเนียมแรกเข้า ไม่มีค่าต่ออายุรายปี สมัครแล้วเป็นสมาชิกได้ตลอดชีพเพียงซื้อสินค้าอย่างน้อย 1 ชิ้นต่อปี',
    tag: 'Free Membership',
  },
  {
    iconName: 'TrendingUp',
    title: 'ไม่ต้องสต็อกสินค้า ไม่บังคับรักษายอด',
    description: 'ไม่ต้องสต็อกของไว้เต็มบ้าน ไม่ต้องกลัวเงินจม ระบบไม่มีการบังคับซื้อรายเดือนเพื่อรักษาสิทธิ์ ซื้อเมื่อต้องการใช้จริง',
    tag: 'Zero Risk',
  },
  {
    iconName: 'Globe2',
    title: 'Global One Server (รหัสเดียวทั่วโลก)',
    description: 'ขยายองค์กรได้มากกว่า 26 ประเทศทั่วโลก เช่น อเมริกา เกาหลี ญี่ปุ่น ไต้หวัน ออสเตรเลีย ยุโรป ฯลฯ ด้วยรหัสเดียว',
    tag: 'One Market',
  },
  {
    iconName: 'Sparkles',
    title: 'สินค้าคุณภาพระดับโลก Masstige',
    description: 'สินค้าพรีเมียมมาตรฐานเดียวกับเคาน์เตอร์แบรนด์ แต่จำหน่ายในราคาประหยัดที่ทุกคนจับต้องได้ ลูกค้าจึงซื้อซ้ำอย่างต่อเนื่อง',
    tag: 'Absolute Quality',
  },
  {
    iconName: 'Users',
    title: 'สายงาน Binary ช่วยเหลือกันสองสาย',
    description: 'ติดตัวได้เพียง 2 สายงาน ซ้าย-ขวา ผู้มาก่อนสามารถส่งต่อทีมงานลงไปช่วยด้านล่างได้อย่างแท้จริง คำนวณยอดลึกไม่จำกัดชั้น',
    tag: 'Unlimited Depth',
  },
  {
    iconName: 'Award',
    title: 'ส่งต่อมรดกได้ถึง 3 ชั่วอายุคน',
    description: 'รหัสสมาชิกและรายได้ Passive Income ที่สร้างไว้ สามารถส่งต่อเป็นมรดกให้ลูกและหลานได้ตามกฎหมายของบริษัท',
    tag: 'Legacy Income',
  },
];

export const ATOMY_OFFICIAL_LINKS = [
  {
    title: 'เว็บไซต์หลัก Atomy ประเทศไทย',
    url: 'https://www.atomy.com/th/Home',
    description: 'พอร์ทัลหลักของบริษัท ช้อปปิ้งมอลล์ออนไลน์ และระบบสมาชิกทางการ',
    badge: 'Official Portal',
  },
  {
    title: 'Channel Atomy Thailand',
    url: 'https://ch.atomy.com/th',
    description: 'คลังวิดีโอสัมมนา วิสัยทัศน์ประธานปาร์คฮันกิล และการบรรยายจากผู้นำระดับโลก',
    badge: 'Education & VOD',
  },
  {
    title: 'Atomy Shopping Mall Thailand',
    url: 'https://www.atomy.com/th/Home/Product/MallMain',
    description: 'ระบบสั่งซื้อสินค้าออนไลน์ จัดส่งตรงถึงบ้านฟรีเมื่อสั่งซื้อครบตามยอด',
    badge: 'Online Store',
  },
  {
    title: 'Atomy Ticket System',
    url: 'https://ticket.atomy.com',
    description: 'ระบบจองตั๋วเข้าร่วมงานสัมมนา One Day Seminar และ Success Academy',
    badge: 'Seminars & Events',
  },
];

export const FAQ_LIST: FaqItem[] = [
  {
    question: 'การสมัครสมาชิก Atomy มีค่าใช้จ่ายหรือไม่?',
    answer: 'ไม่มีค่าใช้จ่ายใดๆ ทั้งสิ้น การสมัครเป็นสมาชิก Atomy ฟรี 100% ไม่มีค่าแรกเข้า ไม่มีค่าแพ็กเกจ และไม่มีค่าต่ออายุรายปี เพียงซื้อสินค้าอะไรก็ได้ 1 ชิ้นในรอบ 12 เดือน รหัสสมาชิกก็จะคงอยู่ตลอดไป',
  },
  {
    question: 'ทำไมการสมัครถึงจำเป็นต้องมี "รหัสสปอนเซอร์"?',
    answer: 'Atomy ใช้ระบบการตลาดแบบบอกต่อ (Word of Mouth) และเครือข่ายสัมพันธ์ จึงต้องระบุรหัสสปอนเซอร์ (ผู้แนะนำ) ในการเปิดรหัสสมาชิก เพื่อให้มีพี่เลี้ยงและทีมงานคอยให้คำแนะนำ ดูแลวิธีการสั่งซื้อ และช่วยวางแผนความสำเร็จในการสร้างรายได้',
  },
  {
    question: 'ต้องบังคับซื้อของหรือรักษายอดรายเดือนเพื่อรับเงินปันผลไหม?',
    answer: 'ไม่มีการบังคับรักษายอดรายเดือนใดๆ ทั้งสิ้น คะแนนส่วนตัว (Personal PV) ที่สะสมจากการซื้อกินซื้อใช้จะอยู่ถาวรตลอดชีพ ไม่มีการตัดยอดทิ้ง เมื่อมีคะแนนจากทีมงานทั้งสองข้างเกิดขึ้น ระบบจะคำนวณจ่ายเงินปันผลเข้าบัญชีธนาคารของคุณตามรอบ',
  },
  {
    question: 'ดูวิดีโอ 15 นาทีนี้แล้ว ทำอย่างไรต่อ?',
    answer: 'หลังจากดูวิดีโอเข้าใจภาพรวมแล้ว ให้กดปุ่ม "ติดต่อผ่าน LINE Official" ของสปอนเซอร์ด้านล่างเพื่อขอรับรหัสสปอนเซอร์ล่าสุด และทีมงานจะส่งลิงก์หน้าสมัครทางการของ Atomy พร้อมจับมือพาคุณทำทีละขั้นตอนอย่างรวดเร็วครับ',
  },
];
