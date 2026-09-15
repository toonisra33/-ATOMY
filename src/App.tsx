/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { AuthSession, SponsorProfile } from './types';
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
import { LoginModal } from './components/LoginModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { setupAllPixels } from './lib/pixel';
import { loadOwnedSponsorProfile, loadSponsorProfile } from './lib/firebase';
import { logout, watchAuthSession } from './lib/auth';

export default function App() {
  const [sponsor, setSponsor] = useState<SponsorProfile>(DEFAULT_SPONSOR);
  const [ownedSponsor, setOwnedSponsor] = useState<SponsorProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [isPixelModalOpen, setIsPixelModalOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);

  useEffect(() => watchAuthSession(setSession, () => setIsAuthReady(true)), []);

  // A public satellite URL trusts only ?ref=XXXX. Every displayed field is loaded
  // from the verified Firestore sponsor document.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref')?.trim() || DEFAULT_SPONSOR.sponsorId;
    loadSponsorProfile(ref)
      .then((cloudProfile) => setSponsor(cloudProfile ? { ...DEFAULT_SPONSOR, ...cloudProfile } : DEFAULT_SPONSOR))
      .catch(() => setSponsor(DEFAULT_SPONSOR));
  }, []);

  useEffect(() => {
    if (!session) {
      setOwnedSponsor(null);
      return;
    }
    loadOwnedSponsorProfile(session.uid)
      .then((profile) => {
        setOwnedSponsor(profile);
        if (profile && !new URLSearchParams(window.location.search).has('ref')) {
          setSponsor({ ...DEFAULT_SPONSOR, ...profile });
        }
      })
      .catch((error) => console.warn('Unable to load authenticated sponsor profile:', error));
  }, [session]);

  useEffect(() => {
    setupAllPixels({
      fbPixelId: sponsor.fbPixelId,
      tiktokPixelId: sponsor.tiktokPixelId,
      googleTagId: sponsor.googleTagId,
    });
  }, [sponsor.fbPixelId, sponsor.tiktokPixelId, sponsor.googleTagId]);

  if (window.location.pathname === '/privacy') {
    return <PrivacyPolicy />;
  }

  const managementSponsor = ownedSponsor || sponsor;
  const canEditSponsor = Boolean(session);
  const canViewPrivateData = Boolean(session && (session.isAdmin || ownedSponsor));

  const openProtected = (action: () => void) => {
    if (!session) {
      setIsLoginOpen(true);
      return;
    }
    action();
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Navbar
        sponsor={sponsor}
        isAuthenticated={Boolean(session)}
        isAdmin={Boolean(session?.isAdmin)}
        accountEmail={session?.email}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => logout()}
        onOpenAffiliateModal={canEditSponsor ? () => openProtected(() => setIsAffiliateModalOpen(true)) : undefined}
        onOpenDeployGuide={session?.isAdmin ? () => setIsDeployGuideOpen(true) : undefined}
        onOpenPixelModal={canViewPrivateData ? () => openProtected(() => setIsPixelModalOpen(true)) : undefined}
        onOpenLeadsModal={canViewPrivateData ? () => openProtected(() => setIsLeadsModalOpen(true)) : undefined}
      />

      <main className="flex-grow">
        <Hero
          sponsor={sponsor}
          onScrollToVideo={() => scrollTo('video-15min')}
          onOpenLineModal={() => scrollTo('line-official')}
          onOpenAffiliateModal={() => openProtected(() => setIsAffiliateModalOpen(true))}
        />
        <VideoSection sponsor={sponsor} onOpenLineModal={() => scrollTo('line-official')} />
        <LineCtaSection
          sponsor={sponsor}
          onOpenLeadsModal={canViewPrivateData ? () => setIsLeadsModalOpen(true) : undefined}
        />
        <BusinessHighlights />
        <TrafficBridgeSection sponsor={sponsor} />
        <FaqSection sponsor={sponsor} />
      </main>

      <Footer
        sponsor={sponsor}
        onOpenAffiliateModal={canEditSponsor ? () => setIsAffiliateModalOpen(true) : undefined}
      />
      <StickyBottomBar sponsor={sponsor} onScrollToVideo={() => scrollTo('video-15min')} />

      {session && (
        <>
          <AffiliateModal
            isOpen={isAffiliateModalOpen}
            onClose={() => setIsAffiliateModalOpen(false)}
            currentSponsor={managementSponsor}
            ownerUid={session.uid}
            onApplySponsor={(newSponsor) => {
              setSponsor(newSponsor);
              setOwnedSponsor(newSponsor);
            }}
            onOpenPixelStatus={() => setIsPixelModalOpen(true)}
          />
          <PixelStatusModal
            isOpen={isPixelModalOpen}
            onClose={() => setIsPixelModalOpen(false)}
            sponsor={managementSponsor}
            ownerUid={session.uid}
            onUpdatePixels={(pixels) => {
              setSponsor((previous) => ({ ...previous, ...pixels }));
              setOwnedSponsor((previous) => previous ? ({ ...previous, ...pixels }) : previous);
            }}
          />
          <LeadsInboxModal
            isOpen={isLeadsModalOpen}
            onClose={() => setIsLeadsModalOpen(false)}
            sponsor={managementSponsor}
            isAdmin={session.isAdmin}
          />
        </>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <DeployGuideModal isOpen={isDeployGuideOpen} onClose={() => setIsDeployGuideOpen(false)} />

      {canViewPrivateData && (
        <button
          type="button"
          id="btn-floating-pixel-status"
          onClick={() => setIsPixelModalOpen(true)}
          className="fixed bottom-20 left-4 z-40 bg-slate-950/95 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full border border-purple-500/30 hover:border-purple-400 shadow-xl flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all group active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Target className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold text-[11px]">จัดการ Pixel</span>
        </button>
      )}

      {!isAuthReady && <span className="sr-only">กำลังตรวจสอบสิทธิ์บัญชี</span>}
    </div>
  );
}
