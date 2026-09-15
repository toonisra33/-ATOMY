export interface SponsorProfile {
  sponsorId: string;
  sponsorName: string;
  sponsorPosition: string;
  lineId: string;
  lineUrl: string;
  phoneNumber: string;
  teamName: string;
  welcomeNote?: string;
  avatarUrl?: string;
  fbPixelId?: string;
  tiktokPixelId?: string;
  googleTagId?: string;
  ownerUid?: string;
  isActive?: boolean;
}

export interface AuthSession {
  uid: string;
  email: string;
  isAdmin: boolean;
  role: 'admin' | 'partner';
}

export interface LeadAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  ttclid?: string;
  landingPage: string;
  referrer?: string;
  eventId: string;
}

export interface VideoChapter {
  id: number;
  timeSeconds: number;
  timestamp: string;
  title: string;
  description: string;
  highlight: string;
}

export interface VideoPreset {
  id: string;
  title: string;
  subtitle: string;
  durationLabel: string;
  youtubeId: string;
  thumbnailUrl: string;
  speaker: string;
  description: string;
}

export interface BenefitItem {
  iconName: string;
  title: string;
  description: string;
  tag: string;
  imageUrl?: string;
  keyHighlight?: string;
  statLabel?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
