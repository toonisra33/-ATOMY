/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SponsorProfile } from "./types";
import { DEFAULT_SPONSOR } from "./data/atomyData";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { VideoSection } from "./components/VideoSection";
import { LineCtaSection } from "./components/LineCtaSection";
import { BusinessHighlights } from "./components/BusinessHighlights";
import { TrafficBridgeSection } from "./components/TrafficBridgeSection";
import { FaqSection } from "./components/FaqSection";
import { Footer } from "./components/Footer";
import { StickyBottomBar } from "./components/StickyBottomBar";
import { AffiliateModal } from "./components/AffiliateModal";
import { PixelStatusModal } from "./components/PixelStatusModal";
import { DeployGuideModal } from "./components/DeployGuideModal";
import { LeadsInboxModal } from "./components/LeadsInboxModal";
import { LoginModal } from "./components/LoginModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { setupAllPixels } from "./lib/pixel";
import { loadSponsorProfile } from "./lib/firebase";
import { watchAuthSession, logout } from "./lib/auth";
import { Target, Link as LinkIcon, QrCode, Copy, Check, Share2 } from "lucide-react";
import { AuthSession } from "./types";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);

  useEffect(() => {
    return watchAuthSession(setSession);
  }, []);

  const [sponsor, setSponsor] = useState<SponsorProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("atomy_custom_sponsor");
        if (saved) {
          return { ...DEFAULT_SPONSOR, ...JSON.parse(saved) };
        }
      } catch (err) {
        console.warn("Could not read cached sponsor:", err);
      }
    }
    return DEFAULT_SPONSOR;
  });
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] =
    useState<boolean>(false);
  const [isPixelModalOpen, setIsPixelModalOpen] = useState<boolean>(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState<boolean>(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

    const generatedAffiliateUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?ref=${sponsor.sponsorId}`
    : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(generatedAffiliateUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedAffiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

// Parse URL query parameters to support dynamic satellite replication & Pixel IDs
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      const name = params.get("name");
      const pos = params.get("pos");
      const line = params.get("line");
      const lineUrl = params.get("lineUrl");
      const phone = params.get("phone");
      const team = params.get("team");
      const avatar = params.get("img") || params.get("avatar");

      // Pixel parameters from affiliate URL or ad campaigns
      const fbp = params.get("fbp") || params.get("fb_pixel");
      const ttp = params.get("ttp") || params.get("tt_pixel");
      const ga = params.get("ga") || params.get("gtag");

      if (ref) {
        // For clean URLs (?ref=xxx), load everything from Firestore directly
        loadSponsorProfile(ref)
          .then((cloudProfile) => {
            if (cloudProfile) {
              setSponsor((prev) => ({
                ...prev,
                ...cloudProfile,
              }));
            } else {
              // Fallback to URL params if no profile found in Firestore yet
              setSponsor((prev) => ({
                ...prev,
                sponsorId: ref,
                sponsorName: name || prev.sponsorName,
                sponsorPosition: pos || prev.sponsorPosition,
                lineId: line || prev.lineId,
                lineUrl:
                  lineUrl ||
                  (line
                    ? line.startsWith("http")
                      ? line
                      : `https://line.me/ti/p/~${line}`
                    : prev.lineUrl),
                phoneNumber: phone || prev.phoneNumber,
                teamName: team || prev.teamName,
                avatarUrl: avatar || prev.avatarUrl,
                fbPixelId: fbp || prev.fbPixelId,
                tiktokPixelId: ttp || prev.tiktokPixelId,
                googleTagId: ga || prev.googleTagId,
              }));
            }
          })
          .catch((err) => {
            console.warn("Error loading cloud profile, using params:", err);
          });
      } else if (name || line || fbp || ttp || ga || avatar) {
        setSponsor((prev) => ({
          ...prev,
          sponsorName: name || prev.sponsorName,
          sponsorPosition: pos || prev.sponsorPosition,
          lineId: line || prev.lineId,
          lineUrl:
            lineUrl ||
            (line
              ? line.startsWith("http")
                ? line
                : `https://line.me/ti/p/~${line}`
              : prev.lineUrl),
          phoneNumber: phone || prev.phoneNumber,
          teamName: team || prev.teamName,
          avatarUrl: avatar || prev.avatarUrl,
          fbPixelId: fbp || prev.fbPixelId,
          tiktokPixelId: ttp || prev.tiktokPixelId,
          googleTagId: ga || prev.googleTagId,
        }));
      } else {
        // If no URL param, load saved sponsor config for default sponsor
        loadSponsorProfile(DEFAULT_SPONSOR.sponsorId)
          .then((cloudProfile) => {
            if (cloudProfile) {
              setSponsor((prev) => ({
                ...prev,
                ...cloudProfile,
                avatarUrl: cloudProfile.avatarUrl || prev.avatarUrl,
              }));
            }
          })
          .catch(() => {});
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
    const el = document.getElementById("video-15min");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToLineSection = () => {
    const el = document.getElementById("line-official");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (currentPath === "/privacy") {
    return <PrivacyPolicyPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation & Sponsor Ribbon */}
      <Navbar
        sponsor={sponsor}
        isAuthenticated={!!session}
        isAdmin={session?.isAdmin ?? false}
        isOwner={session?.uid === sponsor.ownerUid}
        accountEmail={session?.email}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={logout}
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
        <VideoSection sponsor={sponsor} onOpenLineModal={scrollToLineSection} />

        {/* Primary Line Official CTA Section */}
        <LineCtaSection
          sponsor={sponsor}
          onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
        />

        {/* Business Highlights (Why Atomy) */}
        <BusinessHighlights />

        {/* Traffic Bridge to Official Atomy Web & 3-Step Registration */}
        <TrafficBridgeSection sponsor={sponsor} />

        {/* FAQs */}
        <FaqSection sponsor={sponsor} />
      </main>

      
      {/* Affiliate Link Box for Owner */}
      {(session?.isAdmin || (session?.uid && session.uid === sponsor.ownerUid)) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">ลิงก์เว็บพ่วงส่วนตัวของคุณ</h3>
                  <p className="text-xs text-sky-400 font-medium">นำลิงก์นี้ไปใช้โปรโมทได้เลย</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>{showQr ? 'ซ่อน QR Code' : 'แสดง QR Code'}</span>
              </button>
            </div>

            <div className="relative z-10 bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm text-sky-200 break-all select-all flex items-center justify-between gap-4">
              <span className="flex-1 break-all select-all leading-relaxed">{generatedAffiliateUrl}</span>
            </div>

            <div className="relative z-10 mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="btn-copy-affiliate-url-main"
                onClick={handleCopyLink}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'คัดลอกลิงก์สำเร็จแล้ว!' : 'คัดลอกลิงก์เว็บพ่วงนี้'}</span>
              </button>
            </div>

            {showQr && (
              <div className="relative z-10 mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-center animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <img
                    src={qrCodeUrl}
                    alt="Generated Satellite QR"
                    className="w-40 h-40 object-contain"
                  />
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-4 font-sans font-medium text-pretty max-w-sm">
                  สแกนหรือบันทึกภาพ QR Code นี้ไปใส่ในป้ายประชาสัมพันธ์ หรือโพสต์ลง Social Media ได้ทันที
                </p>
              </div>
            )}

            {/* Social Share Preview Info Card */}
            <div className="relative z-10 mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>ภาพพรีวิวการแชร์ (Social Media Card: LINE, Facebook, TikTok)</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                  1200 x 630 HD Ready
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center gap-3 p-3">
                <div className="w-full sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0 border border-slate-700/60 relative">
                  <img
                    src="/og-image.jpg"
                    alt="Atomy Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-1.5">
                    <span className="text-[9px] font-bold text-sky-300">ATOMY SATELLITE</span>
                  </div>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-slate-400">SPONSOR-ATOMY.WEB.APP</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
                    {sponsor.sponsorName ? `${sponsor.sponsorName} - ที่ปรึกษาธุรกิจ Atomy` : 'Atomy Satellite Funnel - เว็บพ่วงสปอนเซอร์ผู้มุ่งหวัง'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {sponsor.welcomeNote || 'ระบบเว็บพ่วงส่งต่อสายงานและสปอนเซอร์ผู้มุ่งหวัง ธุรกิจอะโทมี่ พร้อมวิดีโอบรรยาย 15 นาที และช่องทางติดต่อ LINE Official'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer
        sponsor={sponsor}
        onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
      />

      {/* Mobile Sticky Action Bar */}
      <StickyBottomBar sponsor={sponsor} onScrollToVideo={scrollToVideo} />

      {/* Satellite & Affiliate Link Generator Modal */}
      <AffiliateModal
        isOpen={isAffiliateModalOpen}
        onClose={() => setIsAffiliateModalOpen(false)}
        currentSponsor={sponsor}
        ownerUid={session?.uid || ""}
        onApplySponsor={(newSponsor) => setSponsor(newSponsor)}
        onOpenPixelStatus={() => setIsPixelModalOpen(true)}
      />

      {/* Pixel Health & Live Event Inspector Modal */}
      <PixelStatusModal
        isOpen={isPixelModalOpen}
        onClose={() => setIsPixelModalOpen(false)}
        sponsor={sponsor}
        ownerUid={session?.uid || ""}
        onUpdatePixels={(pixels) => {
          setSponsor((prev) => ({ ...prev, ...pixels }));
        }}
      />

      {/* Leads Inbox Modal */}
      <LeadsInboxModal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        sponsor={sponsor}
        session={session}
      />

      {/* Firebase Hosting Deploy Guide Modal */}
      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

            <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {resetOobCode && (
        <ResetPasswordModal
          isOpen={!!resetOobCode}
          onClose={() => setResetOobCode(null)}
          oobCode={resetOobCode}
        />
      )}

      {(session?.isAdmin || (session?.uid && session.uid === sponsor.ownerUid)) && (
            <button
              type="button"
              id="btn-floating-pixel-status"
              onClick={() => setIsPixelModalOpen(true)}
              className="fixed bottom-20 left-4 z-40 bg-slate-950/95 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full border border-purple-500/30 hover:border-purple-400 shadow-xl flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all group active:scale-95"
              title="คลิกเพื่อติดตั้งหรือตรวจสอบ Pixel (Facebook / TikTok / GA4)"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  sponsor.fbPixelId || sponsor.tiktokPixelId || sponsor.googleTagId
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-amber-400"
                }`}
              />
              <Target className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
              <span className="font-semibold text-[11px] text-slate-200">
                {sponsor.fbPixelId || sponsor.tiktokPixelId
                  ? "Pixel ทำงานอยู่"
                  : "ติดตั้ง Pixel"}
              </span>
            </button>
      )}
    </div>
  );
}
