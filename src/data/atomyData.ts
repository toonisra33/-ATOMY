import { SponsorProfile, VideoChapter, VideoPreset, BenefitItem, FaqItem } from '../types';
import toonProfileImg from '../assets/profile.jpg';
import atomyMasstigeImg from '../assets/atomy-masstige-products.png';

export const DEFAULT_SPONSOR: SponsorProfile = {
  sponsorId: '39823016',
  sponsorName: 'อิศราวัฒน์ ปวินทกานต์ (คุณทูน)',
  sponsorPosition: 'ที่ปรึกษาธุรกิจ Atomy Thailand',
  lineId: 'sj7FVdJ',
  lineUrl: 'https://lin.ee/sj7FVdJ',
  phoneNumber: '093-065-2881',
  teamName: 'Atomy Thailand Team freedomlife',
  welcomeNote: 'ยินดีต้อนรับทุกท่านที่กำลังมองหาโอกาสธุรกิจระดับโลก สมัครฟรี ไม่มีค่าใช้จ่าย พร้อมที่ปรึกษามืออาชีพดูแลตลอด 24 ชม.',
  avatarUrl: toonProfileImg,
  fbPixelId: '1673256503238517',
  tiktokPixelId: 'CRIJ9QBC77UDCNKERUHG',
  googleTagId: '377178012',
};

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'atomy-20min-intro',
    title: 'เจาะลึกธุรกิจ Atomy ใน 20 นาที: แผนการตลาด โมเดล Masstige และการสร้าง Passive Income',
    subtitle: 'คลิปบรรยายพิเศษเจาะลึกสำหรับผู้มุ่งหวังและผู้สนใจเริ่มต้นธุรกิจแบบไม่มีค่าแรกเข้า',
    durationLabel: '20 นาที',
    youtubeId: 'h9eRrJ0V5N8', // Default YouTube video ID or custom link
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
    timeSeconds: 240, // 4:00
    timestamp: '04:00',
    title: 'กลยุทธ์ Masstige (Absolute Quality, Absolute Price)',
    description: 'คุณภาพสูงสุดในราคาที่ทุกคนจับต้องได้ ทำให้เกิดการซื้อซ้ำจากผู้บริโภคจริง 100%',
    highlight: 'ไม่ต้องตื๊อขาย ลูกค้าซื้อใช้เพราะสินค้าดีจริงในชีวิตประจำวัน',
  },
  {
    id: 3,
    timeSeconds: 540, // 9:00
    timestamp: '09:00',
    title: 'แผนการตลาดแบบ Global One Market (Binary System)',
    description: 'เชื่อมโยงเครือข่ายทั่วโลกในรหัสเดียว รหัสเดียวต่อสายงานได้ทุกประเทศทั่วโลก',
    highlight: 'ไม่มีจำกัดชั้นลึก (Unlimited Depth) ขยายได้ทั่วโลกแบบไร้พรมแดน',
  },
  {
    id: 4,
    timeSeconds: 840, // 14:00
    timestamp: '14:00',
    title: 'คะแนน PV ไม่มีวันหมดอายุ & รายได้ Passive Income',
    description: 'คะแนนสะสมส่วนตัว (Personal PV) อยู่ตลอดชีพ ไม่มีการตัดทิ้ง ไม่ต้องรักษายอดรายเดือน',
    highlight: 'ไม่มีค่าแรกเข้ารายปี ไม่มีค่าธรรมเนียมสมัครสมาชิกใดๆ ทั้งสิ้น',
  },
  {
    id: 5,
    timeSeconds: 1080, // 18:00
    timestamp: '18:00',
    title: 'ก้าวแรกในการสมัคร & กรอกแบบฟอร์มเพื่อรับรหัสสปอนเซอร์',
    description: 'วิธีเข้าร่วมทีม รับสิทธิ์การเป็นหุ้นส่วนธุรกิจ และแนวทางการทำงานร่วมกับโค้ชพี่เลี้ยง',
    highlight: 'กรอกแบบฟอร์มฝากข้อมูลเพื่อรับรหัสสปอนเซอร์และสิทธิ์เข้ากลุ่มเรียนรู้ฟรี',
  },
];

export const BUSINESS_BENEFITS: BenefitItem[] = [
  {
    iconName: 'ShieldCheck',
    title: 'สมัครฟรี 100% ไม่มีค่าแรกเข้า',
    description: 'ไม่ต้องจ่ายค่าธรรมเนียมแรกเข้า ไม่มีค่าต่ออายุรายปี สมัครแล้วเป็นสมาชิกได้ตลอดชีพเพียงซื้อสินค้าอย่างน้อย 1 ชิ้นต่อปี',
    tag: 'Free Membership',
    statLabel: 'ค่าแรกเข้า 0 บาท',
    keyHighlight: 'รับสิทธิ์สมาชิกและระบบธุรกิจออนไลน์ทันที',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
  },
  {
    iconName: 'TrendingUp',
    title: 'ไม่ต้องสต็อกสินค้า ไม่บังคับรักษายอด',
    description: 'ไม่ต้องสต็อกของไว้เต็มบ้าน ไม่ต้องกลัวเงินจม ระบบไม่มีการบังคับซื้อรายเดือนเพื่อรักษาสิทธิ์ ช้อปปิ้งเมื่อต้องการใช้จริง',
    tag: 'Zero Risk',
    statLabel: 'ความเสี่ยง 0%',
    keyHighlight: 'บริษัทจัดการคลังสินค้าและการจัดส่งทั่วประเทศให้ทั้งหมด',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
  },
  {
    iconName: 'Globe2',
    title: 'Global One Server (รหัสเดียวทั่วโลก)',
    description: 'ขยายองค์กรได้มากกว่า 26 ประเทศทั่วโลก เช่น อเมริกา เกาหลี ญี่ปุ่น ไต้หวัน ออสเตรเลีย ยุโรป ฯลฯ ด้วยรหัสสมาชิกเดียว',
    tag: 'One Market',
    statLabel: '26+ ประเทศทั่วโลก',
    keyHighlight: 'ไร้พรมแดน เครือข่ายเชื่อมต่อทั่วโลกแบบเรียลไทม์',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  },
  {
    iconName: 'Sparkles',
    title: 'สินค้าคุณภาพระดับโลก Masstige',
    description: 'สินค้าพรีเมียมเกรดเดียวกับเคาน์เตอร์แบรนด์ แต่จำหน่ายในราคาที่ทุกคนจับต้องได้ ลูกค้าจึงซื้อซ้ำอย่างต่อเนื่องเป็นธรรมชาติ',
    tag: 'Absolute Quality',
    statLabel: 'อัตราซื้อซ้ำสูง',
    keyHighlight: 'สินค้าสุขภาพ HemoHIM และสกินแคร์ระดับโลกการันตีรางวัล',
    imageUrl: atomyMasstigeImg,
  },
  {
    iconName: 'Users',
    title: 'สายงาน Binary ช่วยเหลือกันสองสาย',
    description: 'ติดตัวได้เพียง 2 สายงาน ซ้าย-ขวา ผู้มาก่อนสามารถส่งต่อทีมงานลงไปช่วยด้านล่างได้อย่างแท้จริง คำนวณยอดลึกไม่จำกัดชั้น',
    tag: 'Unlimited Depth',
    statLabel: 'ลึกไม่จำกัดชั้น',
    keyHighlight: 'ทำงานเป็นทีม ส่งต่อพลังเครือข่ายเติบโตไปด้วยกัน',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
  },
  {
    iconName: 'Award',
    title: 'ส่งต่อมรดกได้ถึง 3 ชั่วอายุคน',
    description: 'รหัสสมาชิกและรายได้ Passive Income ที่สร้างไว้ สามารถส่งต่อเป็นมรดกให้ลูกและหลานได้ตามกฎหมายของบริษัทอย่างถูกต้อง',
    tag: 'Legacy Income',
    statLabel: 'สืบทอด 3 รุ่น',
    keyHighlight: 'สร้างครั้งเดียว เป็นมรดกความมั่งคั่งให้ครอบครัวตลอดชีพ',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80',
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
