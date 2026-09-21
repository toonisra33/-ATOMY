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
import { LeadsPage } from "./components/LeadsPage";
import { TrainingDay1Page } from "./components/TrainingDay1Page";
import { TrainingAccessGate } from "./components/TrainingAccessGate";
import { getProspectLearnerSession } from "./lib/trainingProgress";
import { LoginModal } from "./components/LoginModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { setupAllPixels } from "./lib/pixel";
import { loadSponsorProfile } from "./lib/firebase";
import { watchAuthSession, logout } from "./lib/auth";
import { Target, Link as LinkIcon, QrCode, Copy, Check, Share2, Monitor, Smartphone, Download, Upload, Image as ImageIcon, RefreshCw, SmartphoneNfc, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { AuthSession } from "./types";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { detectDeviceType } from "./lib/device";
import { uploadBanner, getCustomBanner, clearCustomBanner } from "./lib/imageUtils";

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
  const [detectedDevice, setDetectedDevice] = useState<'desktop' | 'mobile'>(detectDeviceType);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(detectDeviceType);
  const [bannerKey, setBannerKey] = useState(Date.now());
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronize banner across components
  useEffect(() => {
    const handleBannerSync = () => {
      setBannerKey(Date.now());
    };
    window.addEventListener('atomy-banner-updated', handleBannerSync);
    return () => window.removeEventListener('atomy-banner-updated', handleBannerSync);
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploadingBanner(true);
    setBannerMessage(null);
    try {
      const result = await uploadBanner(file, type);
      setBannerKey(Date.now());
      setBannerMessage({ type: 'success', text: result.message });
      setTimeout(() => setBannerMessage(null), 4000);
    } catch (err: any) {
      console.error('Banner upload failed:', err);
      setBannerMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการอัปโหลดภาพแบนเนอร์' });
    } finally {
      setIsUploadingBanner(false);
    }
  };
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    const handleResize = () => {
      const dev = detectDeviceType();
      setDetectedDevice(dev);
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("resize", handleResize);
    };
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

  // Parse URL query parameters to support dynamic satellite replication, Pixel IDs & welcome preview shortcut
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

      // Check if user requested shortcut to preview welcome view (Restricted to logged-in members)
      const preview = params.get("preview");
      const cachedAuth = localStorage.getItem("atomy_user_session");
      if (cachedAuth && (preview === "welcome" || window.location.hash === "#welcome")) {
        setCtaStep("welcome");
        setTimeout(() => {
          const el = document.getElementById("line-official");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }

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
      window.dispatchEvent(new CustomEvent('atomy-unmute-video'));
    }
  };

  // Step for LineCtaSection (allows external buttons & shortcuts to switch to Welcome view)
  const [ctaStep, setCtaStep] = useState<'form' | 'welcome'>('form');

  const scrollToWelcomeSection = () => {
    setCtaStep('welcome');
    const el = document.getElementById("line-official");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToLineSection = () => {
    setCtaStep('form');
    const el = document.getElementById("line-official");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (currentPath === "/privacy") {
    return <PrivacyPolicyPage />;
  }

  let targetDay = 1;
  if (typeof window !== "undefined") {
    const dayParam = new URLSearchParams(window.location.search).get("day");
    if (dayParam && !isNaN(Number(dayParam))) {
      const parsed = Number(dayParam);
      if (parsed >= 1 && parsed <= 7) targetDay = parsed;
    } else {
      const match = currentPath.match(/\/day([1-7])/);
      if (match) targetDay = Number(match[1]);
    }
  }

  const isTrainingPage =
    currentPath.startsWith("/day") ||
    currentPath.startsWith("/training") ||
    (typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("view")?.startsWith("day") ||
        !!new URLSearchParams(window.location.search).get("day") ||
        window.location.hash.startsWith("#day")));

  const prospectSession = getProspectLearnerSession();
  const isAdminDevMode =
    session?.isAdmin === true ||
    (session?.email ? session.email.toLowerCase() === 'toonisra33@gmail.com' : false) ||
    (typeof window !== "undefined" && (
      new URLSearchParams(window.location.search).get("admin") === "1" ||
      new URLSearchParams(window.location.search).get("dev") === "1" ||
      localStorage.getItem("atomy_admin_dev_mode") === "true"
    ));
  const isAuthorizedForTraining = !!session || !!prospectSession || isAdminDevMode;

  if (isTrainingPage) {
    if (!isAuthorizedForTraining) {
      return (
        <>
          <TrainingAccessGate
            sponsor={sponsor}
            onAuthenticated={() => {
              setCurrentPath(window.location.pathname);
            }}
            onOpenSponsorLogin={() => setIsLoginModalOpen(true)}
            onBackToHome={() => {
              window.history.pushState({}, "", "/");
              setCurrentPath("/");
            }}
          />
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        </>
      );
    }

    return (
      <TrainingDay1Page
        sponsor={sponsor}
        initialDay={targetDay}
        session={session}
        isAdmin={isAdminDevMode}
        onBackToHome={() => {
          window.history.pushState({}, "", "/");
          setCurrentPath("/");
        }}
      />
    );
  }

  const isLeadsPage =
    currentPath === "/leads" ||
    (typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("view") === "leads" ||
        window.location.hash === "#leads"));

  if (isLeadsPage) {
    return (
      <>
        <LeadsPage
          sponsor={sponsor}
          session={session}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    );
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
        onOpenLineModal={scrollToLineSection}
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
          isAuthenticated={!!session}
          onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
          externalStep={ctaStep}
          onStepChange={setCtaStep}
        />

        {/* Business Highlights (Why Atomy) */}
        <BusinessHighlights />

        {/* Traffic Bridge to Official Atomy Web & 3-Step Registration */}
        <TrafficBridgeSection
          sponsor={sponsor}
          onOpenLineModal={scrollToLineSection}
        />

        {/* FAQs */}
        <FaqSection
          sponsor={sponsor}
          onOpenLineModal={scrollToLineSection}
        />
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-sky-400" />
                    <span>ภาพพรีวิวการแชร์ (Social Media Card: LINE, Facebook, TikTok)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ระบบตรวจพบ: {detectedDevice === 'mobile' ? 'มือถือ (ปรับใช้ภาพ Mobile อัตโนมัติ)' : 'Desktop (ปรับใช้ภาพ Desktop อัตโนมัติ)'}
                  </span>
                </div>
                
                {/* Switcher between Desktop (16:9) and Mobile Safe Zone */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      previewMode === 'desktop'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop (16:9)</span>
                    {detectedDevice === 'desktop' && (
                      <span className="text-[9px] bg-blue-700/80 px-1 py-0.2 rounded text-blue-200">คุณใช้อันนี้</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      previewMode === 'mobile'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (เซฟโซน)</span>
                    {detectedDevice === 'mobile' && (
                      <span className="text-[9px] bg-blue-700/80 px-1 py-0.2 rounded text-blue-200">คุณใช้อันนี้</span>
                    )}
                  </button>
                </div>
              </div>

              {bannerMessage && (
                <div className={`text-xs px-3 py-2 rounded-xl flex items-center gap-2 mb-2 ${
                  bannerMessage.type === 'success' 
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80' 
                    : 'bg-red-950/80 text-red-300 border border-red-700/80'
                }`}>
                  {bannerMessage.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{bannerMessage.text}</span>
                </div>
              )}

              {/* Preview Box */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 flex flex-col md:flex-row items-center gap-4 p-3.5">
                <div className={`w-full ${previewMode === 'desktop' ? 'md:w-56 aspect-video' : 'md:w-44 aspect-[4/3]'} rounded-lg overflow-hidden shrink-0 border border-slate-700/60 relative bg-slate-900 shadow-md`}>
                  <img
                    key={`${previewMode}-${bannerKey}`}
                    src={getCustomBanner(previewMode) || (previewMode === 'mobile' ? `/og-image-mobile.jpg?v=${bannerKey}` : `/og-image.jpg?v=${bannerKey}`)}
                    alt="Atomy Social Share Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.src.includes('/og-image.jpg')) {
                        img.src = `/og-image.jpg?v=${Date.now()}`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[9px] font-bold text-sky-300">
                      {previewMode === 'desktop' ? 'DESKTOP 1200x630' : 'MOBILE SAFE-ZONE'}
                      {getCustomBanner(previewMode) && ' • (ภาพของคุณ)'}
                    </span>
                  </div>
                </div>

                <div className="text-left flex-1 min-w-0">
                  <div className="text-[10px] font-bold tracking-wider text-sky-400 uppercase">
                    SPONSOR-ATOMY.WEB.APP
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
                    โอกาสสร้างรายได้เสริมควบคู่กับงานประจำ/และโอกาสที่แสนเรียบง่าย
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    ระบบเรียนรู้ออนไลน์ ดูฟรี 20 นาที พร้อมที่ปรึกษาคอยดูแล
                  </p>

                  {/* Actions for All Users & Admin */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer">
                      {isUploadingBanner ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingBanner ? 'กำลังอัปโหลด...' : `อัปโหลดเปลี่ยนรูป (${previewMode === 'mobile' ? 'Mobile' : 'Desktop'})`}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingBanner}
                        onChange={(e) => handleBannerUpload(e, previewMode)}
                      />
                    </label>

                    <a
                      href={getCustomBanner(previewMode) || (previewMode === 'mobile' ? '/og-image-mobile.jpg' : '/og-image.jpg')}
                      download={previewMode === 'mobile' ? 'atomy-banner-mobile.jpg' : 'atomy-banner-desktop.jpg'}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>ดาวน์โหลดรูป {previewMode === 'mobile' ? 'Mobile' : 'Desktop'}</span>
                    </a>

                    {getCustomBanner(previewMode) && (
                      <button
                        type="button"
                        onClick={() => {
                          clearCustomBanner(previewMode);
                          setBannerKey(Date.now());
                          setBannerMessage({ type: 'success', text: 'คืนค่ารูปแบนเนอร์เป็นภาพมาตรฐานแล้ว' });
                          setTimeout(() => setBannerMessage(null), 3000);
                        }}
                        className="px-2 py-1.5 text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 rounded-lg border border-amber-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>รีเซ็ตเป็นรูปมาตรฐาน</span>
                      </button>
                    )}
                  </div>
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
      <StickyBottomBar
        sponsor={sponsor}
        onScrollToVideo={scrollToVideo}
        onOpenLineModal={scrollToLineSection}
      />

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
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenWelcomePreview={scrollToWelcomeSection}
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
