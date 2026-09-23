/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { SponsorProfile } from "../types";
import { DAY_1_DATA, QuizQuestion } from "../data/trainingDay1Data";
import { TRAINING_DAYS_DATA } from "../data/trainingDaysData";
import {
  getStoredTrainingProgress,
  saveDayProgress,
  getDayLockInfo,
  simulateFastForwardDay,
  resetAllTrainingProgress,
  SEVEN_DAYS_OVERVIEW,
  DayLockInfo,
  recordEmailDispatch,
  getProspectLearnerSession,
  clearProspectLearnerSession,
  ProspectLearnerSession,
} from "../lib/trainingProgress";
import { TrainingDayModal } from "./TrainingDayModal";
import { TrainingEmailHubModal } from "./TrainingEmailHubModal";
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  Share2,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Check,
  Send,
  Calendar,
  Award,
  Video,
  Edit3,
  FileCheck2,
  FastForward,
  Hourglass,
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  KeyRound,
  X,
  Mail,
} from "lucide-react";
import { AuthSession } from "../types";
import { ADMIN_EMAILS } from "../lib/auth";

interface TrainingDay1PageProps {
  sponsor: SponsorProfile;
  onBackToHome: () => void;
  initialDay?: number;
  session?: AuthSession | null;
  isAdmin?: boolean;
  learnerSession?: ProspectLearnerSession | null;
  onLearnerLogout?: () => void;
}

export function TrainingDay1Page({
  sponsor,
  onBackToHome,
  initialDay,
  session,
  isAdmin: propIsAdmin = false,
  learnerSession,
  onLearnerLogout,
}: TrainingDay1PageProps) {
  // Check if current user is an Admin / Web Developer
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get("admin") === "1" ||
        urlParams.get("admin") === "true" ||
        urlParams.get("dev") === "1" ||
        urlParams.get("mode") === "admin"
      ) {
        return true;
      }
      if (localStorage.getItem("atomy_admin_dev_mode") === "true") {
        return true;
      }
    }
    if (
      propIsAdmin === true ||
      session?.isAdmin === true ||
      (session?.email && ADMIN_EMAILS.includes(session.email.toLowerCase()))
    ) {
      return true;
    }
    return false;
  });

  const [showAdminAuthModal, setShowAdminAuthModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [adminPinError, setAdminPinError] = useState<string>("");

  useEffect(() => {
    if (
      propIsAdmin === true ||
      session?.isAdmin === true ||
      (session?.email && ADMIN_EMAILS.includes(session.email.toLowerCase()))
    ) {
      setIsAdminMode(true);
    }
  }, [propIsAdmin, session]);

  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPinInput.trim();
    if (
      pin === "8888" ||
      pin === "1234" ||
      pin.toLowerCase() === "admin" ||
      (sponsor.pinHash && pin === sponsor.pinHash)
    ) {
      setIsAdminMode(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("atomy_admin_dev_mode", "true");
      }
      setShowAdminAuthModal(false);
      setAdminPinInput("");
      setAdminPinError("");
    } else {
      setAdminPinError("รหัสผ่านผู้พัฒนาไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Learner Session State
  const [learner, setLearner] = useState<ProspectLearnerSession | null>(() => {
    return learnerSession || getProspectLearnerSession();
  });

  useEffect(() => {
    if (learnerSession !== undefined) {
      setLearner(learnerSession);
    } else {
      setLearner(getProspectLearnerSession());
    }
  }, [learnerSession]);

  // Active Day state (1 to 7)
  const [activeDay, setActiveDay] = useState<number>(() => {
    if (initialDay && initialDay >= 1 && initialDay <= 7) return initialDay;
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const dayParam = urlParams.get("day");
      if (dayParam && !isNaN(Number(dayParam))) {
        const num = Number(dayParam);
        if (num >= 1 && num <= 7) return num;
      }
      const match = window.location.pathname.match(/\/day([1-7])/);
      if (match) return Number(match[1]);
    }
    return 1;
  });

  useEffect(() => {
    if (initialDay && initialDay >= 1 && initialDay <= 7) {
      setActiveDay(initialDay);
    }
  }, [initialDay]);

  const lessonData = TRAINING_DAYS_DATA[activeDay] || TRAINING_DAYS_DATA[1];

  // Custom YouTube video support per day
  const [customYoutubeId, setCustomYoutubeId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`atomy_training_day${activeDay}_yt`);
      if (saved) return saved;
      const paramYt = new URLSearchParams(window.location.search).get("yt");
      if (paramYt) return paramYt;
    }
    return lessonData.defaultYoutubeId;
  });

  const [isEditingVideoUrl, setIsEditingVideoUrl] = useState(false);
  const [tempVideoInput, setTempVideoInput] = useState(customYoutubeId);

  // Video playback & timer state
  const TOTAL_DURATION_SECONDS = lessonData.durationMinutes * 60; // 3600 seconds
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);
  const [showSkipWarning, setShowSkipWarning] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<number | null>(null);
  const quizSectionRef = useRef<HTMLDivElement>(null);

  // Training progress & real-time clock for 24-hour countdown
  const [trainingProgress, setTrainingProgress] = useState(getStoredTrainingProgress);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [selectedDayForModal, setSelectedDayForModal] = useState<number | null>(null);

  // Interactive Key Takeaways Checklist for Days 2-7
  const [checkedTakeaways, setCheckedTakeaways] = useState<Record<number, boolean>>({});

  // Sync state when activeDay changes
  useEffect(() => {
    const saved = localStorage.getItem(`atomy_training_day${activeDay}_yt`);
    const defaultYt = lessonData.defaultYoutubeId;
    const currentYt = saved || defaultYt;
    setCustomYoutubeId(currentYt);
    setTempVideoInput(currentYt);
    setSecondsElapsed(0);
    setIsPlaying(false);
    setIsVideoFinished(false);
    setUserAnswers({});
    setIsSubmitted(false);
    setShowSuccessModal(false);
    setCheckedTakeaways({});
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("day", activeDay.toString());
      window.history.replaceState({}, "", url.toString());
    }
  }, [activeDay]);

  // Interval to update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute lock status of the active day
  const activeDayLock = getDayLockInfo(activeDay, trainingProgress, currentTime);

  // Next Day (for gated 24-hour unlock after current day is completed)
  const nextDay = activeDay < 7 ? activeDay + 1 : null;
  const nextDayLockInfo = nextDay ? getDayLockInfo(nextDay, trainingProgress, currentTime) : null;

  // Day 2 Lock Info for backward compatibility
  const day2LockInfo = getDayLockInfo(2, trainingProgress, currentTime);

  // Current day passed status
  const isPassed = trainingProgress[activeDay]?.isQuizPassed === true;

  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, 'a' | 'b' | 'c' | 'd'>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [isEmailHubOpen, setIsEmailHubOpen] = useState<boolean>(false);

  // Helper to post messages to YouTube iframe API
  const postToPlayer = (command: string, args: any[] = []) => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: command, args }),
          '*'
        );
      }
    } catch (e) {
      console.warn("Could not communicate with video iframe", e);
    }
  };

  const handleUnmuteOnly = () => {
    postToPlayer('unMute');
    postToPlayer('setVolume', [100]);
    postToPlayer('playVideo');
    setIsMuted(false);
    setIsPlaying(true);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      handleUnmuteOnly();
    } else {
      postToPlayer('mute');
      setIsMuted(true);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      postToPlayer('pauseVideo');
      setIsPlaying(false);
    } else {
      postToPlayer('playVideo');
      setIsPlaying(true);
    }
  };

  // Listen for postMessages from YouTube API
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        if (data.event === 'onReady') {
          postToPlayer('playVideo');
        }

        if (data.event === 'onStateChange') {
          if (data.info === 1) setIsPlaying(true);
          else if (data.info === 2) setIsPlaying(false);
          else if (data.info === 0) {
            setIsPlaying(false);
            // Strictly enforce 60 minutes: Only Admin or users who watched >= TOTAL_DURATION_SECONDS can finish!
            if (isAdminMode || secondsElapsed >= TOTAL_DURATION_SECONDS) {
              setSecondsElapsed(TOTAL_DURATION_SECONDS);
              setIsVideoFinished(true);
            } else {
              // If video ends before 60 minutes, restart video so prospect continues watching
              postToPlayer('seekTo', [0, true]);
              postToPlayer('playVideo');
            }
          }
        }

        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.playerState === 'number') {
            if (data.info.playerState === 1) setIsPlaying(true);
            else if (data.info.playerState === 2) setIsPlaying(false);
            else if (data.info.playerState === 0) {
              setIsPlaying(false);
              if (isAdminMode || secondsElapsed >= TOTAL_DURATION_SECONDS) {
                setSecondsElapsed(TOTAL_DURATION_SECONDS);
                setIsVideoFinished(true);
              }
            }
          }

          // Anti-Seek enforcement: General prospects CANNOT skip forward!
          if (typeof data.info.currentTime === 'number') {
            const ytCurrent = Math.floor(data.info.currentTime);
            if (!isAdminMode && ytCurrent > secondsElapsed + 5 && !isVideoFinished) {
              setShowSkipWarning(true);
              postToPlayer('seekTo', [secondsElapsed, true]);
              setTimeout(() => setShowSkipWarning(false), 3500);
            }
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [secondsElapsed, isVideoFinished, TOTAL_DURATION_SECONDS, isAdminMode]);

  // Elapsed timer tick
  useEffect(() => {
    if (isPlaying && !isVideoFinished) {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;
          if (next >= TOTAL_DURATION_SECONDS) {
            setIsVideoFinished(true);
            setIsPlaying(false);
            return TOTAL_DURATION_SECONDS;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isVideoFinished, TOTAL_DURATION_SECONDS]);

  // When video completes, auto scroll gently to quiz
  useEffect(() => {
    if (isVideoFinished && !isPassed) {
      setTimeout(() => {
        quizSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 800);
    }
  }, [isVideoFinished, isPassed]);

  // Test mode bypass for sponsor/evaluator
  const handleBypassToFinish = () => {
    setSecondsElapsed(TOTAL_DURATION_SECONDS);
    setIsVideoFinished(true);
    setIsPlaying(false);
    postToPlayer('pauseVideo');
  };

  // Reset video progress
  const handleResetProgress = () => {
    setSecondsElapsed(0);
    setIsVideoFinished(false);
    setIsPlaying(true);
    postToPlayer('seekTo', [0, true]);
    postToPlayer('playVideo');
  };

  // Save new YouTube URL / ID
  const handleSaveVideoUrl = () => {
    let cleanId = tempVideoInput.trim();
    if (cleanId.includes("v=")) {
      const match = cleanId.match(/v=([a-zA-Z0-9_-]+)/);
      if (match) cleanId = match[1];
    } else if (cleanId.includes("youtu.be/")) {
      const match = cleanId.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match) cleanId = match[1];
    }
    setCustomYoutubeId(cleanId);
    localStorage.setItem(`atomy_training_day${activeDay}_yt`, cleanId);
    setIsEditingVideoUrl(false);
    handleResetProgress();
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle quiz option selection
  const handleSelectOption = (questionId: number, optionId: 'a' | 'b' | 'c' | 'd') => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Evaluate quiz submission (for Day 1 or any day with questions)
  const handleSubmitQuiz = () => {
    const questions = lessonData.questions || [];
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);

    if (correctCount === questions.length) {
      const updated = saveDayProgress(activeDay, {
        isVideoCompleted: true,
        isQuizPassed: true,
        quizScore: questions.length,
        quizPassedAt: Date.now(),
      });
      setTrainingProgress(updated);

      // Trigger email dispatch for next day's 24h drip campaign
      if (activeDay < 7) {
        const learner = getProspectLearnerSession();
        recordEmailDispatch(
          activeDay + 1,
          learner?.fullName || "คุณผู้มุ่งหวังคนพิเศษ",
          learner?.email || "",
          'day_completion'
        );
      }

      setShowSuccessModal(true);
    } else {
      // Scroll to first wrong answer
      const firstWrong = questions.find((q) => userAnswers[q.id] !== q.correctAnswer);
      if (firstWrong) {
        const el = document.getElementById(`quiz-q-${firstWrong.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Complete Day Lesson (for Days 2-7 where quizzes are not yet created)
  const handleCompleteDayLesson = () => {
    const updated = saveDayProgress(activeDay, {
      isVideoCompleted: true,
      isQuizPassed: true,
      quizScore: 10,
      quizPassedAt: Date.now(),
    });
    setTrainingProgress(updated);

    if (activeDay < 7) {
      const learner = getProspectLearnerSession();
      recordEmailDispatch(
        activeDay + 1,
        learner?.fullName || "คุณผู้มุ่งหวังคนพิเศษ",
        learner?.email || "",
        'day_completion'
      );
    }

    setShowSuccessModal(true);
  };

  // Fast forward 24h helper for testing
  const handleFastForward24h = (dayNum?: number) => {
    const target = typeof dayNum === 'number' ? dayNum : activeDay;
    simulateFastForwardDay(target);
    const updated = getStoredTrainingProgress();
    setTrainingProgress(updated);
    if (target === activeDay) {
      setIsVideoFinished(true);
      setSecondsElapsed(TOTAL_DURATION_SECONDS);
    }
  };

  // Reset helper for testing
  const handleResetProgressAll = () => {
    resetAllTrainingProgress();
    setTrainingProgress({});
    setIsVideoFinished(false);
    setSecondsElapsed(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setShowSuccessModal(false);
    setCheckedTakeaways({});
    postToPlayer('seekTo', [0, true]);
    postToPlayer('pauseVideo');
    setIsPlaying(false);
  };

  // Generate copy text for LINE report to sponsor
  const getLineReportText = () => {
    const isQuiz = lessonData.questions && lessonData.questions.length > 0;
    const learnerName = learner ? (learner.fullName || learner.name || "ผู้เรียน") : "";
    const learnerLines = learner
      ? [
          `👤 ผู้เรียน: คุณ${learnerName}${learner.nickname ? ` (${learner.nickname})` : ""}`,
          `📧 อีเมล: ${learner.email}`,
        ]
      : [];

    return [
      `🎓 รายงานผลการเรียนรู้: 7-Day Training Funnel`,
      `━━━━━━━━━━━━━━━━`,
      ...learnerLines,
      `✅ บทเรียนวันที่ ${activeDay}: ${lessonData.title}`,
      `📌 หัวข้อ: "${lessonData.subtitle}"`,
      `⏱️ สถานะ: ศึกษาเนื้อหาและคลิปบรรยายครบถ้วนแล้ว`,
      isQuiz
        ? `📝 ผลแบบทดสอบ: ผ่านเกณฑ์ 10/10 คะแนนเต็ม! 🎉`
        : `💡 สรุปแก่นคิด: บันทึกความเข้าใจ 4 ประเด็นสำคัญเรียบร้อยแล้ว`,
      nextDay
        ? `📅 ระบบเริ่มนับถอยหลัง 24 ชม. สู่บทเรียนวันที่ ${nextDay} ครับ/ค่ะ`
        : `🏆 สำเร็จหลักสูตรพัฒนาผู้นำ 7 วันครบถ้วนสมบูรณ์แล้ว! พร้อมวางแผนงานกับทีมครับ/ค่ะ`,
      `━━━━━━━━━━━━━━━━`,
      `🤝 สปอนเซอร์ผู้ดูแล: ${sponsor.sponsorName} (${sponsor.sponsorId})`
    ].join('\n');
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(getLineReportText());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const originParam =
    typeof window !== 'undefined' && window.location.origin
      ? `&origin=${encodeURIComponent(window.location.origin)}`
      : '';

  const progressPercent = Math.min(
    100,
    Math.round((secondsElapsed / TOTAL_DURATION_SECONDS) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Admin / Developer Control Banner (Admin-only bypass tools) */}
      {isAdminMode && (
        <aside aria-label="Admin Tools" className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 sticky top-0 z-50 shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                ADMIN / DEV
              </span>
              <span className="font-bold text-white text-xs">
                โหมดผู้พัฒนาเว็บ
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                (ผู้มุ่งหวังทั่วไปจะไม่เห็นแถบนี้และถูกบังคับดูวิดีโอ 60 นาที)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {!isVideoFinished && (
                <button
                  type="button"
                  id="admin-top-btn-skip-video"
                  onClick={handleBypassToFinish}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow"
                  title="ข้ามเวลาวิดีโอ 60 นาที เพื่อทดสอบเปิดแบบทดสอบทันที"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ ข้ามวิดีโอ 60 น.</span>
                </button>
              )}

              <button
                type="button"
                id="admin-top-btn-skip-24h"
                onClick={() => handleFastForward24h()}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow"
                title="ข้ามเวลานับถอยหลัง 24 ชม. เพื่อปลดล็อกวันถัดไปทันที"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>⚡ ข้าม 24 ชม.</span>
              </button>

              <button
                type="button"
                id="admin-top-btn-edit-yt"
                onClick={() => setIsEditingVideoUrl(!isEditingVideoUrl)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้คลิป</span>
              </button>

              <button
                type="button"
                id="admin-top-btn-reset-all"
                onClick={handleResetProgressAll}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] flex items-center gap-1 cursor-pointer"
                title="รีเซ็ตความคืบหน้าทั้งหมด"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>

              <button
                type="button"
                id="admin-top-btn-switch-prospect"
                onClick={() => {
                  setIsAdminMode(false);
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("atomy_admin_dev_mode");
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/40 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="สลับไปดูมุมมองผู้มุ่งหวังทั่วไป เพื่อตรวจเช็กการล็อกจริง"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>มุมมองผู้มุ่งหวัง</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Top Header & Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-back-to-home"
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
              title="กลับสู่หน้าหลัก"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">หน้าหลัก</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>7-Day Training</span>
              </span>
              <span className="text-xs font-medium text-slate-400 hidden md:inline">
                • บทเรียนที่ {activeDay} / 7
              </span>
            </div>
          </div>

          {/* Sponsor Tag & Status & Email Hub */}
          <div className="flex items-center gap-2 sm:gap-3 text-right">
            {isAdminMode && (
              <button
                type="button"
                id="btn-open-email-hub"
                onClick={() => setIsEmailHubOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
                title="ศูนย์จัดการอีเมล 7 วัน (แสดงเฉพาะ Admin ผู้ดูแลระบบ)"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">อีเมล 7 วัน (Admin)</span>
              </button>
            )}

            {learner && (
              <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700/80 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="text-left hidden xs:block">
                  <div className="text-[10px] text-slate-400 leading-tight">ผู้เรียน:</div>
                  <div className="font-bold text-white text-xs leading-tight truncate max-w-[120px]">
                    {learner.fullName || learner.name} {learner.nickname ? `(${learner.nickname})` : ""}
                  </div>
                </div>
                {onLearnerLogout && (
                  <button
                    type="button"
                    onClick={onLearnerLogout}
                    className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer ml-1"
                    title="ออกจากระบบผู้เรียน"
                  >
                    ออก
                  </button>
                )}
              </div>
            )}

            <div className="hidden sm:flex flex-col text-xs">
              <span className="text-slate-400">สปอนเซอร์ผู้ดูแล:</span>
              <span className="font-bold text-sky-400">{sponsor.sponsorName}</span>
            </div>
            {isPassed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ผ่าน Day {activeDay} แล้ว</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Progress Stepper Bar (Days 1 to 7 with 24-hour lock status) */}
      <div className="bg-slate-900 border-b border-slate-800/80 py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 shrink-0">
            <span className="font-bold text-white">ขั้นตอนการพัฒนา 7 วัน:</span>
            <span className="text-sky-400 font-semibold">
              {isPassed
                ? `Day ${activeDay} ผ่านแล้ว • ` + (nextDay ? `กำลังนับถอยหลังสู่ Day ${nextDay}` : `สำเร็จครบ 7 วันแล้ว!`)
                : `วันที่ ${activeDay}: ${lessonData.title}`}
            </span>
          </div>

          {/* 7-Day Interactive Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 lg:pb-0">
            {SEVEN_DAYS_OVERVIEW.map((item) => {
              const day = item.dayNumber;
              const lock = getDayLockInfo(day, trainingProgress, currentTime);
              const isCurrentActive = day === activeDay;
              const dayPassed = trainingProgress[day]?.isQuizPassed === true;

              let pillClasses = "bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:border-slate-500";
              let icon = <Lock className="w-3 h-3 text-slate-500" />;
              let label = `วันที่ ${day}`;

              if (dayPassed) {
                pillClasses = "bg-emerald-950/90 text-emerald-300 font-bold border border-emerald-500/60 hover:bg-emerald-900";
                icon = <Check className="w-3 h-3 text-emerald-300" />;
                label = `วันที่ ${day} (ผ่านแล้ว)`;
              } else if (lock.isUnlocked) {
                pillClasses = "bg-blue-900/60 text-sky-200 font-bold border border-blue-500/50 hover:bg-blue-800/60";
                icon = <Unlock className="w-3 h-3 text-sky-300" />;
                label = `วันที่ ${day} (เปิดแล้ว)`;
              } else if (lock.status === "COUNTDOWN_RUNNING") {
                pillClasses = "bg-blue-950/90 text-sky-300 font-bold border border-sky-500/60 hover:bg-blue-900 shadow-sm shadow-sky-500/20";
                icon = <Clock className="w-3 h-3 text-sky-400 animate-spin" />;
                label = `วันที่ ${day} (อีก ${lock.formattedCountdown})`;
              } else {
                label = `วันที่ ${day}`;
              }

              if (isCurrentActive) {
                pillClasses += " ring-2 ring-sky-400 shadow-lg shadow-sky-500/30 scale-[1.02]";
              }

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    if (lock.isUnlocked || dayPassed) {
                      setActiveDay(day);
                    } else {
                      setSelectedDayForModal(day);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${pillClasses}`}
                  title={
                    lock.isUnlocked || dayPassed
                      ? `คลิกเพื่อเข้าสู่บทเรียนวันที่ ${day}`
                      : `คลิกเพื่อดูเวลานับถอยหลังและเงื่อนไขการปลดล็อกวันที่ ${day}`
                  }
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* If active day is locked, show prominent lock screen */}
        {!activeDayLock.isUnlocked ? (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/70 rounded-3xl p-8 sm:p-12 border border-blue-500/30 text-center max-w-2xl mx-auto mb-12 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/10">
              <Lock className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/40 mb-3">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>บทเรียนวันที่ {activeDay} ยังไม่ถึงเวลาเปิดเรียน</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {lessonData.title}
            </h2>
            <p className="text-sky-300 text-sm mb-6 font-medium">
              "{lessonData.subtitle}"
            </p>

            {activeDayLock.status === "COUNTDOWN_RUNNING" ? (
              <div className="bg-slate-950/90 border border-blue-500/40 rounded-2xl p-6 mb-6">
                <div className="text-xs text-slate-400 mb-2 font-medium">
                  {activeDay === 1
                    ? "ระบบกำลังนับถอยหลัง 24 ชั่วโมง สู่บทเรียนวันที่ 1:"
                    : "ระบบกำลังนับถอยหลัง 24 ชั่วโมงเพื่อปลดล็อกบทเรียนนี้:"}
                </div>
                <div className="font-mono text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-sky-400 to-blue-400 tracking-widest mb-2">
                  {activeDayLock.formattedCountdown}
                </div>
                <div className="text-xs text-slate-400">
                  {activeDay === 1
                    ? "คุณได้ลงทะเบียนเข้าร่วมระบบแล้ว ระบบจะส่งอีเมลบทเรียนฉบับแรกพร้อมปลดล็อกห้องเรียน Day 1 เมื่อครบ 24 ชั่วโมงหลังส่งแบบฟอร์ม"
                    : `คุณผ่านบทเรียนวันที่ ${activeDayLock.requiredDayNumber} เรียบร้อยแล้ว ระบบกำลังจับเวลาตามกติกา 24 ชั่วโมง`}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-6 mb-6 text-left space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>เงื่อนไขการปลดล็อก:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeDay === 1
                    ? "บทเรียนวันที่ 1 จะเปิดให้อัตโนมัติเมื่อครบกำหนด 24 ชั่วโมงหลังการส่งแบบฟอร์มลงทะเบียน โดยระบบจะจัดส่งอีเมลพร้อมลิงก์เข้าสู่ห้องเรียนให้คุณครับ"
                    : `คุณต้องผ่านบทเรียนและทำแบบทดสอบวันที่ ${activeDayLock.requiredDayNumber} ให้สำเร็จก่อน ระบบจึงจะเริ่มนับถอยหลัง 24 ชั่วโมงเพื่อปลดล็อกบทเรียนวันที่ ${activeDay} ครับ`}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {activeDay > 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveDay(activeDayLock.requiredDayNumber || 1)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  ไปเรียนบทเรียนวันที่ {activeDayLock.requiredDayNumber || 1}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer border border-slate-700 transition-colors"
                >
                  กลับสู่หน้าหลัก
                </button>
              )}

              {isAdminMode && (
                <button
                  type="button"
                  id="btn-fast-forward-locked-day"
                  onClick={() => handleFastForward24h(activeDay === 1 ? 1 : (activeDayLock.requiredDayNumber || 1))}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/40 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  title="ปุ่มนี้แสดงเฉพาะ Admin ผู้พัฒนาเพื่อทดสอบระบบ"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ โหมดทดสอบ (Admin): ข้าม 24 ชม. เปิดทันที</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Intro Banner & Hook */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>บทเรียนวันที่ {activeDay} จาก 7 วัน • ระบบคัดกรองและพัฒนาผู้มุ่งหวังอัตโนมัติ</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug sm:leading-tight mb-3">
                  {lessonData.title} <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
                    "{lessonData.subtitle}"
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-6 font-normal">
                  {lessonData.leadInHook}
                </p>

                {/* Structured Lead-In Paragraphs */}
                <div className="space-y-3 bg-slate-950/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <div className="font-bold text-sky-400 text-sm sm:text-base flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    <span>{lessonData.leadInTitle}</span>
                  </div>
                  {lessonData.leadInContent.map((paragraph, idx) => (
                    <p key={idx} className="text-slate-300">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Learning Rules & Highlights */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
                  <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">ความยาวบทเรียน</div>
                      <div className="text-xs sm:text-sm font-bold text-white">{lessonData.durationMinutes} นาที (1 ชั่วโมงเต็ม)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">ระบบป้องกันการเลื่อน</div>
                      <div className="text-xs sm:text-sm font-bold text-amber-300">รับชมต่อเนื่องห้ามกดข้าม</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">เป้าหมายประจำวัน</div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-300">
                        {lessonData.questions && lessonData.questions.length > 0
                          ? "ต้องตอบถูกครบ 10 / 10 ข้อ"
                          : "ซึมซับ 4 แก่นคิดสำคัญประจำวัน"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Video Player Section */}
            <section className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    คลิปบรรยายวันที่ {activeDay} ({lessonData.durationMinutes} นาที)
                  </h2>
                </div>

                {/* Video Action Toolbar: Only Admin / Developer sees bypass buttons */}
                {isAdminMode ? (
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      id="btn-edit-video-url"
                      onClick={() => setIsEditingVideoUrl(!isEditingVideoUrl)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="ตั้งค่าหรือเปลี่ยนลิงก์คลิปวิดีโอ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>เปลี่ยนลิงก์คลิป</span>
                    </button>

                    <button
                      type="button"
                      id="btn-test-mode-bypass"
                      onClick={handleBypassToFinish}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="คลิกเพื่อจำลองการรับชมครบ 60 นาที เพื่อทดสอบทำแบบทดสอบทันที"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>⚡ ข้ามวิดีโอ 60 น.</span>
                    </button>

                    <button
                      type="button"
                      id="btn-fast-forward-24h"
                      onClick={() => handleFastForward24h()}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-600/50 flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="คลิกเพื่อจำลองเวลาผ่านไป 24 ชั่วโมง เพื่อทดสอบการปลดล็อกวันถัดไปทันที"
                    >
                      <FastForward className="w-3.5 h-3.5 text-sky-400" />
                      <span className="hidden sm:inline">⚡ ข้าม 24 ชม.</span>
                      <span className="sm:hidden">⚡ 24 ชม.</span>
                    </button>

                    <button
                      type="button"
                      id="btn-reset-training-all"
                      onClick={handleResetProgressAll}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="คลิกเพื่อรีเซ็ตความคืบหน้าทั้งหมด"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>รีเซ็ต</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>ดูให้ครบ 60 นาที แบบทดสอบถึงจะเปิด</span>
                    </span>
                  </div>
                )}
              </div>

          {/* Video URL edit form if opened */}
          {isEditingVideoUrl && (
            <div className="mb-4 p-4 rounded-xl bg-slate-900 border border-blue-500/40 shadow-lg animate-in fade-in">
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                ใส่ YouTube Video URL หรือ Video ID สำหรับคลิปบทเรียนวันที่ 1:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={tempVideoInput}
                  onChange={(e) => setTempVideoInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... หรือ Video ID"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSaveVideoUrl}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  บันทึกวิดีโอใหม่
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                ระบบจะบันทึกคีย์วิดีโอนี้ไว้ในเบราว์เซอร์ของคุณ และใช้สำหรับแสดงผลบทเรียนวันที่ 1 ทันที
              </p>
            </div>
          )}

          {/* Video Iframe Container (16:9) */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 group">
            <iframe
              ref={iframeRef}
              key={customYoutubeId}
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${customYoutubeId}?autoplay=1&mute=1&playsinline=1&controls=0&disablekb=1&fs=0&modestbranding=1&enablejsapi=1&rel=0${originParam}&start=0`}
              title="Training Day 1 Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen={false}
            />

            {/* Anti-Seek Warning Overlay */}
            {showSkipWarning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-600 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 border border-rose-400 animate-bounce">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>ไม่อนุญาตให้เลื่อนข้าม! กรุณารับชมเนื้อหาให้ครบ 60 นาทีครับ</span>
              </div>
            )}

            {/* Floating Unmute Banner */}
            {isMuted && (
              <button
                type="button"
                onClick={handleUnmuteOnly}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-blue-600/95 hover:bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all animate-bounce cursor-pointer border border-blue-400"
                title="แตะเพื่อเปิดเสียง"
              >
                <Volume2 className="w-4 h-4 text-sky-200 shrink-0" />
                <span>แตะเพื่อเปิดเสียง 🔊</span>
              </button>
            )}

            {/* Initial play prompt if paused */}
            {!isPlaying && secondsElapsed === 0 && (
              <button
                type="button"
                onClick={handleTogglePlay}
                className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>กดเพื่อเริ่มเล่น</span>
              </button>
            )}
          </div>

          {/* 60-Minute Interactive Controller Bar */}
          <div className="mt-3 bg-slate-900/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                    isPlaying
                      ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                  title={isPlaying ? "หยุดชั่วคราว" : "เริ่มเล่น"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                  title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-bold text-sky-400">
                      {formatTime(secondsElapsed)}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">/ 60:00 น.</span>
                    {isPlaying && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        กำลังเรียน
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {isVideoFinished
                      ? "✅ คุณรับชมครบ 60 นาทีแล้ว! แบบทดสอบปลดล็อกเรียบร้อย"
                      : `ต้องรับชมครบ 60 นาที (คงเหลืออีก ${formatTime(TOTAL_DURATION_SECONDS - secondsElapsed)} น.)`}
                  </p>
                </div>
              </div>

              {isVideoFinished && (
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>เริ่มดูใหม่</span>
                </button>
              )}
            </div>

            {/* Progress Track */}
            <div className="mt-3 w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isVideoFinished ? "bg-emerald-500" : "bg-gradient-to-r from-blue-600 to-sky-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Evaluation / Quiz / Reflection Section */}
        <section ref={quizSectionRef} id="day-evaluation" className="mt-12">
          {/* Header of Evaluation with Lock / Unlock state */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>
                    {lessonData.questions && lessonData.questions.length > 0
                      ? `แบบทดสอบท้ายบทเรียนที่ ${activeDay}`
                      : `สรุปแก่นคิดสำคัญท้ายบทเรียนที่ ${activeDay}`}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {lessonData.questions && lessonData.questions.length > 0
                    ? `แบบทดสอบ 10 ข้อ: ${lessonData.title}`
                    : `สรุป 4 ประเด็นสำคัญ: ${lessonData.title}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {lessonData.questions && lessonData.questions.length > 0
                    ? `ทดสอบความเข้าใจเกี่ยวกับ "${lessonData.subtitle}"`
                    : `ซึมซับและทบทวนแก่นคิดประจำวันเพื่อเตรียมความพร้อมสู่บทเรียนถัดไป`}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {isVideoFinished ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold">
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span>
                      {lessonData.questions && lessonData.questions.length > 0
                        ? "แบบทดสอบปลดล็อกแล้ว พร้อมทำข้อสอบ"
                        : "การประเมินปลดล็อกแล้ว พร้อมบันทึกผล"}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-600/50 text-amber-300 text-xs sm:text-sm font-bold">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>ปลดล็อกเมื่อรับชมครบ {lessonData.durationMinutes} นาที</span>
                  </div>
                )}
              </div>
            </div>

            {/* If video is NOT finished yet, show strict locked banner (Prospect cannot take the quiz) */}
            {!isVideoFinished ? (
              <div className="my-8 p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-600/40 mb-3">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>แบบทดสอบถูกล็อก (จะเด้งขึ้นมาให้เห็นอัตโนมัติเมื่อดูคลิปครบ 60 นาที)</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 max-w-xl">
                  {lessonData.questions && lessonData.questions.length > 0
                    ? `แบบทดสอบ 10 ข้อจะเด้งขึ้นมาให้ทำอัตโนมัติเมื่อดูคลิปครบ 60 นาที`
                    : `ส่วนสรุปบันทึกการเรียนรู้จะเด้งขึ้นมาเมื่อดูคลิปครบ 60 นาที`}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mb-6 leading-relaxed">
                  สำหรับผู้มุ่งหวังทั่วไป <strong>ไม่สามารถกดข้ามได้ในทุกขั้นตอน</strong> และถูกบังคับให้รับชมคลิปวิดีโอการบรรยายนี้ให้ครบ 1 ชั่วโมง (60 นาที) ขึ้นไปเท่านั้น แบบทดสอบถึงจะเด้งขึ้นมาให้เห็น หากยังดูไม่จบจะไม่สามารถทำแบบทดสอบได้ครับ
                </p>

                {/* Real-time Watch Progress Counter */}
                <div className="w-full max-w-md bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6">
                  <div className="flex justify-between text-xs text-slate-300 mb-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>เวลาที่รับชมไปแล้ว:</span>
                    </span>
                    <span className="font-mono font-bold text-sky-400">
                      {formatTime(secondsElapsed)} / 60:00 น.
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                    <span>ความคืบหน้า: {progressPercent}%</span>
                    <span className="text-amber-300 font-medium">
                      คงเหลืออีก {formatTime(Math.max(0, TOTAL_DURATION_SECONDS - secondsElapsed))} น.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 300, behavior: "smooth" });
                      handleTogglePlay();
                    }}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>กลับไปดูวิดีโอต่อ ({formatTime(Math.max(0, TOTAL_DURATION_SECONDS - secondsElapsed))} น. ที่เหลือ)</span>
                  </button>

                  {/* ONLY ADMIN / DEVELOPER CAN SEE AND CLICK THE BYPASS BUTTON */}
                  {isAdminMode && (
                    <button
                      type="button"
                      id="btn-admin-bypass-quiz"
                      onClick={handleBypassToFinish}
                      className="px-4 py-3 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow"
                      title="ปุ่มนี้แสดงเฉพาะ Admin ผู้พัฒนาเพื่อทดสอบระบบ"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>⚡ ข้ามไปวินาทีสุดท้าย (เฉพาะ Admin)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* When isVideoFinished is TRUE: The Quiz / Evaluation section POPS UP into view! */
              <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border border-emerald-500/60 flex items-center gap-3.5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>🎉 คุณรับชมครบ 60 นาทีแล้ว! แบบทดสอบปลดล็อกเรียบร้อยแล้ว</span>
                  </h4>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    {lessonData.questions && lessonData.questions.length > 0
                      ? "แบบทดสอบ 10 ข้อเด้งขึ้นมาแล้ว เชิญทำแบบทดสอบด้านล่างได้เลยครับ"
                      : "ส่วนทบทวนและบันทึกผลเด้งขึ้นมาแล้ว เชิญบันทึกความเข้าใจด้านล่างได้เลยครับ"}
                  </p>
                </div>
              </div>
            )}

            {/* Questions List (Rendered when unlocked & has questions) */}
            {isVideoFinished && lessonData.questions && lessonData.questions.length > 0 && (
              <div className="mt-8 space-y-6">
                {lessonData.questions.map((q, qIndex) => {
                  const selected = userAnswers[q.id];
                  const isWrong = isSubmitted && selected !== q.correctAnswer;
                  const isCorrect = isSubmitted && selected === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      id={`quiz-q-${q.id}`}
                      className={`p-4 sm:p-6 rounded-2xl transition-all border ${
                        isWrong
                          ? "bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-950/30"
                          : isCorrect
                          ? "bg-emerald-950/20 border-emerald-500/50"
                          : "bg-slate-950/60 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {qIndex + 1}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                            {q.question}
                          </h4>
                        </div>
                        {isSubmitted && (
                          <span className="shrink-0">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-rose-400" />
                            )}
                          </span>
                        )}
                      </div>

                      {/* Choices */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {q.options.map((opt) => {
                          const isOptSelected = selected === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt.id)}
                              className={`w-full text-left p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                                isOptSelected
                                  ? "bg-blue-600/20 border-blue-500 text-white shadow-sm"
                                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white"
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors uppercase ${
                                  isOptSelected
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span className="flex-1 leading-relaxed">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Incorrect Feedback hint */}
                      {isWrong && (
                        <div className="mt-3.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">ยังไม่ถูกต้องในข้อนี้:</span> กรุณาทบทวนเนื้อหาแล้วเลือกคำตอบใหม่อีกครั้งครับ
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Score and Submit Controls */}
                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    {isSubmitted ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">คะแนนของคุณ:</span>
                        <span
                          className={`font-black text-xl sm:text-2xl ${
                            score === lessonData.questions.length ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {score} / {lessonData.questions.length} คะแนน
                        </span>
                        {score === lessonData.questions.length ? (
                          <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded-full font-bold">
                            ผ่านเกณฑ์ 100% 🎉
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-500/50 rounded-full font-bold">
                            ยังไม่ผ่าน (ต้องได้ {lessonData.questions.length}/{lessonData.questions.length})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>ตอบครบ {Object.keys(userAnswers).length} จาก {lessonData.questions.length} ข้อ (ต้องตอบถูกทั้งหมดเพื่อเริ่มนับถอยหลัง 24 ชม.)</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    id="btn-submit-day-quiz"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length < lessonData.questions.length}
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                      Object.keys(userAnswers).length === lessonData.questions.length
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer active:scale-95 shadow-blue-600/30"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitted ? "ตรวจคำตอบใหม่อีกครั้ง" : "ส่งคำตอบและตรวจผลสอบ"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Key Takeaways Interactive Checklist (When Day does NOT have quiz questions yet) */}
            {isVideoFinished && (!lessonData.questions || lessonData.questions.length === 0) && (
              <div className="mt-8 space-y-6">
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-sky-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">การทบทวนแก่นคิดประจำวัน:</span> เพื่อให้มั่นใจว่าท่านได้รับประโยชน์สูงสุดจากบทเรียนนี้ กรุณาติ๊กทำเครื่องหมาย 4 ประเด็นสำคัญที่ท่านได้เรียนรู้และตกผลึก จากนั้นกดปุ่มยืนยันด้านล่างเพื่อเริ่มนับถอยหลัง 24 ชม. สู่บทเรียนถัดไป
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {lessonData.keyTakeaways.map((takeaway, idx) => {
                    const isChecked = checkedTakeaways[idx] === true;
                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          setCheckedTakeaways((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isChecked
                            ? "bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/30"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                            isChecked
                              ? "bg-emerald-500 text-slate-950 font-bold"
                              : "bg-slate-800 border border-slate-700 text-slate-500"
                          }`}
                        >
                          {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs">{idx + 1}</span>}
                        </div>
                        <div className="flex-1 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                          {takeaway}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Complete Lesson Confirmation Button */}
                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {isPassed
                        ? "คุณบันทึกการเรียนรู้วันนี้เรียบร้อยแล้ว!"
                        : `ทบทวนครบ ${Object.values(checkedTakeaways).filter(Boolean).length} จาก 4 ข้อ`}
                    </span>
                  </div>

                  <button
                    type="button"
                    id="btn-confirm-day-takeaways"
                    onClick={handleCompleteDayLesson}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 cursor-pointer active:scale-95 shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isPassed
                        ? "บันทึกผลอีกครั้ง"
                        : `บันทึกความเข้าใจ Day ${activeDay} และเริ่มนับถอยหลัง 24 ชม.`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Next Day 24-Hour Gated Unlock Status Card */}
        {nextDay !== null && nextDayLockInfo && (
          <section className="mt-8 rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl transition-all">
            {nextDayLockInfo.status === "UNLOCKED" ? (
              <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/50 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                      <Unlock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        ครบกำหนด 24 ชั่วโมงแล้ว
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        บทเรียนวันที่ {nextDay} ปลดล็อกเรียบร้อยแล้ว! 🎉
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-200/90 mt-0.5">
                        หัวข้อ: "{TRAINING_DAYS_DATA[nextDay]?.title}: {TRAINING_DAYS_DATA[nextDay]?.subtitle}"
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDay(nextDay)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>เข้าสู่บทเรียนวันที่ {nextDay} ทันที</span>
                  </button>
                </div>
              </div>
            ) : nextDayLockInfo.status === "COUNTDOWN_RUNNING" ? (
              <div className="bg-gradient-to-br from-blue-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/50 p-6 sm:p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-500/40">
                      <Clock className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>ระบบกำลังนับถอยหลัง 24 ชั่วโมงแบบ Real-time</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      บทเรียนวันที่ {nextDay} จะปลดล็อกในอีก
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                      คุณผ่านบทเรียนวันที่ {activeDay} เรียบร้อยแล้ว ระบบจึงเริ่มนับถอยหลัง 24 ชั่วโมง เพื่อให้คุณมีเวลาตกผลึกและพร้อมสำหรับบทเรียนถัดไป
                    </p>
                  </div>

                  {/* Live Countdown Digits */}
                  <div className="bg-slate-950/90 border border-sky-500/40 rounded-2xl p-4 sm:p-5 text-center min-w-[240px] shadow-xl shadow-sky-500/10">
                    <div className="font-mono text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-sky-400 to-blue-400 tracking-widest">
                      {nextDayLockInfo.formattedCountdown}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-2 mt-1 uppercase">
                      <span>ชั่วโมง</span>
                      <span>นาที</span>
                      <span>วินาที</span>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-sky-300/80">
                      หัวข้อถัดไป: "{TRAINING_DAYS_DATA[nextDay]?.title}"
                    </div>
                  </div>
                </div>

                {/* Progress bar of 24 hours */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                    <span>ความคืบหน้าการนับถอยหลัง (24 ชม.)</span>
                    <span className="text-sky-400 font-semibold">
                      เหลืออีก {nextDayLockInfo.remainingHours} ชม. {nextDayLockInfo.remainingMinutes} นาที
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, ((86400000 - nextDayLockInfo.remainingMs) / 86400000) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* LOCKED_WAITING_PREVIOUS_QUIZ */
              <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                      <Hourglass className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 mb-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>สถานะ: ระบบยังไม่เริ่มนับถอยหลัง 24 ชั่วโมง</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        บทเรียนวันที่ {nextDay} ถูกล็อก (รอผ่านบทเรียน Day {activeDay} ก่อน)
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-200/90 mt-1 max-w-2xl leading-relaxed">
                        <strong>เงื่อนไขของระบบ:</strong> ถ้าคุณยังดูคลิปวิดีโอ Day {activeDay} ไม่จบ หรือยังไม่ผ่านการประเมิน <strong>ระบบจะไม่นับถอยหลัง 24 ชั่วโมงเพื่อปลดล็อกวันที่ {nextDay}</strong> คุณต้องผ่านบทเรียนนี้ก่อนเท่านั้นระบบถึงจะเริ่มนับเวลาครับ
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDayForModal(nextDay)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>ดูรายละเอียดวันที่ {nextDay}</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Graduation celebration if Day 7 is completed */}
        {activeDay === 7 && isPassed && (
          <section className="mt-8 bg-gradient-to-br from-amber-950/80 via-slate-900 to-yellow-950/80 border border-amber-500/60 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-4 font-black shadow-xl shadow-amber-500/20">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              🏆 สำเร็จหลักสูตรพัฒนาผู้นำ 7 วันครบถ้วนสมบูรณ์!
            </h3>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed mb-6">
              ขอแสดงความยินดีด้วยอย่างยิ่ง! คุณได้พิสูจน์ความมุ่งมั่นและผ่านระบบคัดกรอง 7 วันเรียบร้อยแล้ว ก้าวต่อไปคือการนัดหมายวางแผนงานกับสปอนเซอร์ของคุณเพื่อเริ่มสร้างระบบคานผ่อนแรงอย่างแท้จริง
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {copiedReport ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>ส่งรายงานจบหลักสูตร 7 วันให้สปอนเซอร์</span>
              </button>
              <a
                href={`https://line.me/ti/p/~${sponsor.lineId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 flex items-center gap-2"
              >
                <span>เปิด LINE เพื่อคุยแผนงาน</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </section>
        )}

        {/* Passed Banner for activeDay */}
        {isPassed && (
          <section className="mt-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-emerald-500/40 shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-2xl shadow-xl shadow-emerald-500/20">
                  <Award className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ผ่านการประเมินเรียบร้อย
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    คุณผ่านบทเรียนวันที่ {activeDay} เรียบร้อยแล้ว! 🎉
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
                    {nextDay && nextDayLockInfo ? (
                      nextDayLockInfo.isUnlocked ? (
                        <span className="text-emerald-300 font-bold">บทเรียนวันที่ {nextDay} ปลดล็อกแล้ว สามารถเริ่มเรียนรู้ได้ทันที!</span>
                      ) : (
                        <span>
                          ระบบกำลังนับถอยหลัง 24 ชม. บทเรียนวันที่ {nextDay} จะเปิดในอีก{" "}
                          <strong className="text-sky-300 font-mono">{nextDayLockInfo.formattedCountdown} ชม.</strong>
                        </span>
                      )
                    ) : (
                      <span className="text-amber-300 font-bold">สำเร็จหลักสูตร 7 วันครบถ้วนสมบูรณ์!</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  id="btn-notify-sponsor-line"
                  onClick={handleCopyReport}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {copiedReport ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>{copiedReport ? "คัดลอกผลแล้ว! แตะวางใน LINE ได้เลย" : "แจ้งสปอนเซอร์ผ่าน LINE"}</span>
                </button>

                <a
                  href={`https://line.me/ti/p/~${sponsor.lineId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <span>เปิด LINE สปอนเซอร์</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          </section>
        )}
          </>
        )}
      </main>

      {/* Success Modal Pop-up */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
              <Award className="w-10 h-10" />
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>สำเร็จบทเรียนวันที่ {activeDay}</span>
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              ยินดีด้วยครับ! 🎉
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              คุณได้ศึกษาและตกผลึกในหัวข้อ <strong>"{lessonData.title}: {lessonData.subtitle}"</strong> ครบถ้วน
            </p>

            {/* Countdown notice inside modal if nextDay exists */}
            {nextDay && nextDayLockInfo && (
              <div className="bg-blue-950/60 border border-blue-500/40 rounded-2xl p-4 mb-4 text-center">
                <div className="text-[11px] font-bold text-sky-400 flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>ระบบเริ่มนับถอยหลัง 24 ชั่วโมงแล้ว!</span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white tracking-widest">
                  {nextDayLockInfo.formattedCountdown}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  บทเรียนวันที่ {nextDay} จะปลดล็อกอัตโนมัติเมื่อครบ 24 ชม.
                </div>
              </div>
            )}

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6 text-left text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">บทเรียนวันที่ {activeDay}:</span>
                <strong className="text-emerald-400 font-bold">สำเร็จเรียบร้อย</strong>
              </div>
              {nextDay && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">บทเรียนวันที่ {nextDay}:</span>
                  <span className="text-sky-300 font-semibold">เริ่มนับถอยหลัง 24 ชม.</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">สปอนเซอร์:</span>
                <span className="text-white">{sponsor.sponsorName}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                id="btn-modal-notify-sponsor"
                onClick={() => {
                  handleCopyReport();
                  window.open(`https://line.me/ti/p/~${sponsor.lineId}`, '_blank');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ส่งผลการเรียนรู้ให้สปอนเซอร์ทาง LINE</span>
              </button>

              {isAdminMode && (
                <button
                  type="button"
                  id="btn-modal-preview-email"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setIsEmailHubOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>ดูตัวอย่างอีเมลบทเรียนวันที่ {nextDay || activeDay} ที่ระบบเตรียมส่ง (Admin)</span>
                </button>
              )}

              <button
                type="button"
                id="btn-close-success-modal"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                ปิดหน้าต่างนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Day Details & Status Modal for Days 1 to 7 */}
      {selectedDayForModal !== null && (
        <TrainingDayModal
          selectedDay={selectedDayForModal}
          lockInfo={getDayLockInfo(selectedDayForModal, trainingProgress, currentTime)}
          isOpen={true}
          isAdmin={isAdminMode}
          onClose={() => setSelectedDayForModal(null)}
          onSelectDay={(day) => {
            setActiveDay(day);
            setSelectedDayForModal(null);
          }}
          onRefresh={() => {
            const updated = getStoredTrainingProgress();
            setTrainingProgress(updated);
          }}
        />
      )}

      {/* 7-Day Automated Email Curriculum Hub Modal (Admin Only) */}
      {isAdminMode && (
        <TrainingEmailHubModal
          isOpen={isEmailHubOpen}
          onClose={() => setIsEmailHubOpen(false)}
          sponsor={sponsor}
          currentDay={activeDay}
        />
      )}

      {/* Subtle Developer / Admin Mode Toggle in Footer */}
      <footer className="mt-16 text-center text-xs text-slate-500 pb-10">
        <div className="flex items-center justify-center gap-3">
          {isAdminMode ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>โหมดผู้พัฒนาเว็บ (Admin Mode เปิดใช้งานอยู่)</span>
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(false);
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("atomy_admin_dev_mode");
                  }
                }}
                className="ml-2 text-rose-400 hover:text-rose-300 underline cursor-pointer text-[11px]"
              >
                ปิดโหมด Admin
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="btn-open-admin-auth"
              onClick={() => {
                if (propIsAdmin || session?.isAdmin || (session?.email && ADMIN_EMAILS.includes(session.email.toLowerCase()))) {
                  setIsAdminMode(true);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("atomy_admin_dev_mode", "true");
                  }
                } else {
                  setShowAdminAuthModal(true);
                }
              }}
              className="text-slate-600 hover:text-slate-400 underline cursor-pointer text-[11px] inline-flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3 h-3" />
              <span>โหมดผู้พัฒนาเว็บ (Admin / Developer Bypass)</span>
            </button>
          )}
        </div>
      </footer>

      {/* Admin / Developer Authentication Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                setShowAdminAuthModal(false);
                setAdminPinError("");
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-white text-center mb-1">
              ยืนยันสิทธิ์ผู้พัฒนาเว็บ (Admin)
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5 leading-relaxed">
              กรุณากรอกรหัสผ่านผู้ดูแลระบบ (Admin PIN) เพื่อเปิดใช้งานเครื่องมือข้ามวิดีโอและจำลองการนับเวลา 24 ชั่วโมง
            </p>

            <form onSubmit={handleVerifyAdminPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  รหัสผ่าน / PIN ผู้พัฒนา:
                </label>
                <input
                  type="password"
                  id="input-admin-pin"
                  value={adminPinInput}
                  onChange={(e) => {
                    setAdminPinInput(e.target.value);
                    setAdminPinError("");
                  }}
                  placeholder="กรอกรหัส PIN (เช่น 8888)"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
                {adminPinError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{adminPinError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminAuthModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  id="btn-submit-admin-pin"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                >
                  เข้าสู่โหมด Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
