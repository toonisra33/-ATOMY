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
  pinHash?: string; // 4-6 digit PIN for sponsor authentication
  updatedAt?: string;
}

export interface LeadAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  campaign_id?: string;
  adgroup_id?: string;
  ad_id?: string;
  ttclid?: string; // TikTok Click ID
  fbclid?: string; // Meta Click ID
  gclid?: string;  // Google Click ID
  landing_page?: string;
  referrer?: string;
  eventId?: string;
  consentAt?: string;
  normalizedPhone?: string;
}

export interface PartnerSession {
  role: 'sponsor' | 'admin';
  sponsorId: string;
  sponsorName: string;
  authenticatedAt: string;
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
