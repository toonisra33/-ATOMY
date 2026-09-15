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
}

export interface FaqItem {
  question: string;
  answer: string;
}
