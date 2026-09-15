/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SponsorProfile } from './types';
import { DEFAULT_SPONSOR } from './data/atomyData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VideoSection } from './components/VideoSection';
import { LineCtaSection } from './components/LineCtaSection';
import { BusinessHighlights } from './components/BusinessHighlights';
import { TrafficBridgeSection } from './components/TrafficBridgeSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { StickyBottomBar } from './components/StickyBottomBar';
import { AffiliateModal } from './components/AffiliateModal';
import { PixelStatusModal } from './components/PixelStatusModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { LeadsInboxModal } from './components/LeadsInboxModal';
import { setupAllPixels } from './lib/pixel';
import { loadSponsorProfile } from './lib/firebase';
import { Target } from 'lucide-react';

export default function App() {
  const [sponsor, setSponsor] = useState<SponsorProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('atomy_custom_sponsor');
        if (saved) {
          return { ...DEFAULT_SPONSOR, ...JSON.parse(saved) };
        }
      } catch (err) {
        console.warn('Could not read cached sponsor:', err);
      }
    }
    return DEFAULT_SPONSOR;
  });
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState<boolean>(false);
  const [isPixelModalOpen, setIsPixelModalOpen] = useState<boolean>(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState<boolean>(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState<boolean>(false);

  // Parse URL query parameters to support dynamic satellite replication & Pixel IDs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      const name = params.get('name');
      const pos = params.get('pos');
      const line = params.get('line');
      const lineUrl = params.get('lineUrl');
      const phone = params.get('phone');
      const team = params.get('team');
      const avatar = params.get('img') || params.get('avatar');
      
      // Pixel parameters from affiliate URL or ad campaigns
      const fbp = params.get('fbp') || params.get('fb_pixel');
      const ttp = params.get('ttp') || params.get('tt_pixel');
      const ga = params.get('ga') || params.get('gtag');

      if (ref) {
        // For clean URLs (?ref=xxx), load everything from Firestore directly
        loadSponsorProfile(ref).then((cloudProfile) => {
          if (cloudProfile) {
            setSponsor((prev) => ({
              ...prev,
              ...cloudProfile
            }));
          } else {
            // Fallback to URL params if no profile found in Firestore yet
            setSponsor((prev) => ({
              ...prev,
              sponsorId: ref,
              sponsorName: name || prev.sponsorName,
              sponsorPosition: pos || prev.sponsorPosition,
              lineId: line || prev.lineId,
              lineUrl: lineUrl || (line ? (line.startsWith('http') ? line : `https://line.me/ti/p/~${line}`) : prev.lineUrl),
              phoneNumber: phone || prev.phoneNumber,
              teamName: team || prev.teamName,
              avatarUrl: avatar || prev.avatarUrl,
              fbPixelId: fbp || prev.fbPixelId,
              tiktokPixelId: ttp || prev.tiktokPixelId,
              googleTagId: ga || prev.googleTagId,
            }));
          }
        }).catch(err => {
          console.warn('Error loading cloud profile, using params:', err);
        });
      } else if (name || line || fbp || ttp || ga || avatar) {
         setSponsor((prev) => ({
            ...prev,
            sponsorName: name || prev.sponsorName,
            sponsorPosition: pos || prev.sponsorPosition,
            lineId: line || prev.lineId,
            lineUrl: lineUrl || (line ? (line.startsWith('http') ? line : `https://line.me/ti/p/~${line}`) : prev.lineUrl),
            phoneNumber: phone || prev.phoneNumber,
            teamName: team || prev.teamName,
            avatarUrl: avatar || prev.avatarUrl,
            fbPixelId: fbp || prev.fbPixelId,
            tiktokPixelId: ttp || prev.tiktokPixelId,
            googleTagId: ga || prev.googleTagId,
          }));
      } else {
        // If no URL param, load saved sponsor config for default sponsor
        loadSponsorProfile(DEFAULT_SPONSOR.sponsorId).then((cloudProfile) => {
          if (cloudProfile) {
            setSponsor((prev) => ({
              ...prev,
              ...cloudProfile,
              avatarUrl: cloudProfile.avatarUrl || prev.avatarUrl,
            }));
          }
        }).catch(() => {});
      }
    }
  }, []);

  // Initialize and update pixels whenever sponsor pixel IDs change
  useEffect(() => {
    setupAllPixels({
      fbPixelId: sponsor.fbPixelId,
      tiktokPixelId: sponsor.tiktokPixelId,
      googleTagId: sponsor.googleTagId,
    });
  }, [sponsor.fbPixelId, sponsor.tiktokPixelId, sponsor.googleTagId]);

  const scrollToVideo = () => {
    const el = document.getElementById('video-15min');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToLineSection = () => {
    const el = document.getElementById('line-official');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation & Sponsor Ribbon */}
      <Navbar
        sponsor={sponsor}
        onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenPixelModal={() => setIsPixelModalOpen(true)}
        onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero
          sponsor={sponsor}
          onScrollToVideo={scrollToVideo}
          onOpenLineModal={scrollToLineSection}
          onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
        />

        {/* 15-Minute Video Presentation Hub */}
        <VideoSection
          sponsor={sponsor}
          onOpenLineModal={scrollToLineSection}
        />

        {/* Primary Line Official CTA Section */}
        <LineCtaSection
          sponsor={sponsor}
          onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
        />

        {/* Business Highlights (Why Atomy) */}
        <BusinessHighlights />

        {/* Traffic Bridge to Official Atomy Web & 3-Step Registration */}
        <TrafficBridgeSection
          sponsor={sponsor}
        />

        {/* FAQs */}
        <FaqSection
          sponsor={sponsor}
        />
      </main>

      {/* Footer */}
      <Footer
        sponsor={sponsor}
        onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
      />

      {/* Mobile Sticky Action Bar */}
      <StickyBottomBar
        sponsor={sponsor}
        onScrollToVideo={scrollToVideo}
      />

      {/* Satellite & Affiliate Link Generator Modal */}
      <AffiliateModal
        isOpen={isAffiliateModalOpen}
        onClose={() => setIsAffiliateModalOpen(false)}
        currentSponsor={sponsor}
        onApplySponsor={(newSponsor) => setSponsor(newSponsor)}
        onOpenPixelStatus={() => setIsPixelModalOpen(true)}
      />

      {/* Pixel Health & Live Event Inspector Modal */}
      <PixelStatusModal
        isOpen={isPixelModalOpen}
        onClose={() => setIsPixelModalOpen(false)}
        sponsor={sponsor}
        onUpdatePixels={(pixels) => {
          setSponsor((prev) => ({ ...prev, ...pixels }));
        }}
      />

      {/* Leads Inbox Modal */}
      <LeadsInboxModal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        sponsor={sponsor}
      />

      {/* Firebase Hosting Deploy Guide Modal */}
      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      {/* Floating Pixel & Tracking Quick Badge */}
      <button
        type="button"
        id="btn-floating-pixel-status"
        onClick={() => setIsPixelModalOpen(true)}
        className="fixed bottom-20 left-4 z-40 bg-slate-950/95 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full border border-purple-500/30 hover:border-purple-400 shadow-xl flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all group active:scale-95"
        title="คลิกเพื่อติดตั้งหรือตรวจสอบ Pixel (Facebook / TikTok / GA4)"
      >
        <span className={`w-2 h-2 rounded-full ${
          sponsor.fbPixelId || sponsor.tiktokPixelId || sponsor.googleTagId
            ? 'bg-emerald-400 animate-pulse'
            : 'bg-amber-400'
        }`} />
        <Target className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
        <span className="font-semibold text-[11px] text-slate-200">
          {sponsor.fbPixelId || sponsor.tiktokPixelId ? 'Pixel ทำงานอยู่' : 'ติดตั้ง Pixel'}
        </span>
      </button>
    </div>
  );
}
