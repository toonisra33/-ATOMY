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

export default function App() {
  const [sponsor, setSponsor] = useState<SponsorProfile>(DEFAULT_SPONSOR);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState<boolean>(false);

  // Parse URL query parameters to support dynamic satellite replication
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

      if (ref || name || line) {
        setSponsor((prev) => ({
          ...prev,
          sponsorId: ref || prev.sponsorId,
          sponsorName: name || prev.sponsorName,
          sponsorPosition: pos || prev.sponsorPosition,
          lineId: line || prev.lineId,
          lineUrl: lineUrl || (line ? (line.startsWith('http') ? line : `https://line.me/ti/p/~${line}`) : prev.lineUrl),
          phoneNumber: phone || prev.phoneNumber,
          teamName: team || prev.teamName,
        }));
      }
    }
  }, []);

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
      />
    </div>
  );
}
