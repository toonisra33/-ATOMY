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
import { TrainingEmailHubModal } from "./components/TrainingEmailHubModal";
import { ImageGalleryAlbum } from "./components/ImageGalleryAlbum";
import { TrainingAccessGate } from "./components/TrainingAccessGate";
import { AdminDashboardPage } from "./components/AdminDashboardPage";
import { getProspectLearnerSession, clearProspectLearnerSession, ProspectLearnerSession } from "./lib/trainingProgress";
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
          const parsed = JSON.parse(saved);
          if (!parsed.customVideoUrl || parsed.customVideoUrl.includes('h9eRrJ0V5N8')) {
            parsed.customVideoUrl = DEFAULT_SPONSOR.customVideoUrl;
          }
          return { ...DEFAULT_SPONSOR, ...parsed };
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
  const [isAdminEmailHubOpen, setIsAdminEmailHubOpen] = useState<boolean>(false);
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

  const [prospectLearner, setProspectLearner] = useState<ProspectLearnerSession | null>(getProspectLearnerSession);

  useEffect(() => {
    setProspectLearner(getProspectLearnerSession());
  }, [currentPath]);

  const isAdminDevMode =
    session?.isAdmin === true ||
    (session?.email ? session.email.toLowerCase() === 'toonisra33@gmail.com' : false) ||
    (typeof window !== "undefined" && (
      new URLSearchParams(window.location.search).get("admin") === "1" ||
      new URLSearchParams(window.location.search).get("dev") === "1" ||
      localStorage.getItem("atomy_admin_dev_mode") === "true"
    ));

  const isAuthorizedForTraining = !!session || !!prospectLearner || isAdminDevMode;

  if (isTrainingPage) {
    if (!isAuthorizedForTraining) {
      const modeParam = typeof window !== 'undefined'
        ? (new URLSearchParams(window.location.search).get('mode') as 'register' | 'login' | null)
        : null;

      return (
        <>
          <TrainingAccessGate
            sponsor={sponsor}
            targetDay={targetDay}
            initialMode={modeParam || (targetDay === 1 ? 'register' : 'login')}
            onAuthenticated={() => {
              setProspectLearner(getProspectLearnerSession());
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
        learnerSession={prospectLearner}
        onLearnerLogout={() => {
          clearProspectLearnerSession();
          setProspectLearner(null);
        }}
        onBackToHome={() => {
          window.history.pushState({}, "", "/");
          setCurrentPath("/");
        }}
      />
    );
  }

  const isAdminPage =
    currentPath === "/admin" ||
    currentPath.startsWith("/admin/") ||
    (typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("view") === "admin" ||
        window.location.hash === "#admin"));

  if (isAdminPage) {
    return (
      <AdminDashboardPage
        sponsor={sponsor}
        session={session}
        onUpdateSponsor={(updated) => setSponsor(updated)}
        onLogout={logout}
        onNavigateHome={() => {
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
        isAdmin={isAdminDevMode}
        isOwner={session?.uid === sponsor.ownerUid}
        accountEmail={session?.email}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={logout}
        onNavigateAdmin={() => {
          window.history.pushState({}, "", "/admin");
          setCurrentPath("/admin");
        }}
        onOpenLineModal={scrollToLineSection}
        onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenPixelModal={() => setIsPixelModalOpen(true)}
        onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
        onOpenEmailHub={() => setIsAdminEmailHubOpen(true)}
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

        {/* Interactive Image Gallery Album */}
        <ImageGalleryAlbum
          sponsor={sponsor}
          onOpenLineModal={scrollToLineSection}
          isAdmin={isAdminDevMode}
        />

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

      {/* 7-Day Email Hub Modal */}
      <TrainingEmailHubModal
        isOpen={isAdminEmailHubOpen}
        onClose={() => setIsAdminEmailHubOpen(false)}
        sponsor={sponsor}
        currentDay={1}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          window.history.pushState({}, '', '/admin');
          setCurrentPath('/admin');
        }}
      />

      {resetOobCode && (
        <ResetPasswordModal
          isOpen={!!resetOobCode}
          onClose={() => setResetOobCode(null)}
          oobCode={resetOobCode}
        />
      )}
    </div>
  );
}
