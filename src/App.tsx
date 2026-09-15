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

      if (ref || name || line || fbp || ttp || ga || avatar) {
        setSponsor((prev) => {
          const updated = {
            ...prev,
            sponsorId: ref || prev.sponsorId,
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
          };
          return updated;
        });
      } else {
        // If no URL param, attempt to check Firebase for saved sponsor config
        loadSponsorProfile(DEFAULT_SPONSOR.sponsorId).then((cloudProfile) => {
          if (cloudProfile && cloudProfile.avatarUrl) {
            setSponsor((prev) => ({ ...prev, ...cloudProfile }));
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
      />

      {/* Floating Pixel & Tracking Quick Badge */}
      <button
        type="button"
        id="btn-floating-pixel-status"
        onClick={() => setIsPixelModalOpen(true)}
        className="fixed bottom-20 left-4 z-40 bg-slate-950/90 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full border border-slate-800 shadow-xl flex items-center gap-1.5 backdrop-blur-md cursor-pointer hover:border-purple-500/60 transition-all group"
        title="เช็คการทำงานของ Facebook / TikTok Pixel"
      >
        <span className={`w-2 h-2 rounded-full ${
          sponsor.fbPixelId || sponsor.tiktokPixelId || sponsor.googleTagId
            ? 'bg-emerald-400 animate-pulse'
            : 'bg-slate-500'
        }`} />
        <Target className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
        <span className="font-medium text-[11px] text-slate-200">
          {sponsor.fbPixelId || sponsor.tiktokPixelId ? 'Pixel กำลังทำงาน' : 'สถานะ Pixel'}
        </span>
      </button>
    </div>
  );
}
