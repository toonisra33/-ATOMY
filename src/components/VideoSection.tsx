import React, { useState, useEffect, useRef } from 'react';
import { SponsorProfile, VideoChapter, VideoPreset } from '../types';
import { VIDEO_PRESETS, VIDEO_CHAPTERS } from '../data/atomyData';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Sparkles,
  MessageCircle,
  BookmarkCheck,
  Trophy,
  Volume2,
  VolumeX,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

interface VideoSectionProps {
  sponsor: SponsorProfile;
  onOpenLineModal: () => void;
}

// Extract standard YouTube ID from URL or return raw ID
function extractYouTubeId(urlOrId?: string): string {
  if (!urlOrId || urlOrId.includes('h9eRrJ0V5N8')) return VIDEO_PRESETS[0].youtubeId;
  const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : (urlOrId.length === 11 ? urlOrId : VIDEO_PRESETS[0].youtubeId);
}

export const VideoSection: React.FC<VideoSectionProps> = ({ sponsor, onOpenLineModal }) => {
  // 20 minutes = 1200 seconds (or custom sponsor preference)
  const DURATION_MINUTES = sponsor.customVideoMinutes || 20;
  const TOTAL_DURATION_SECONDS = DURATION_MINUTES * 60;

  // Active YouTube ID (from sponsor custom link or default)
  const activeYoutubeId = extractYouTubeId(sponsor.customVideoUrl);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showSkipWarning, setShowSkipWarning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerWrapperRef = useRef<HTMLDivElement | null>(null);

  // Helper to send commands to the YouTube iframe via postMessage
  const postToPlayer = (command: string, args: any[] = []) => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: command, args }),
          '*'
        );
      }
    } catch (e) {
      console.warn('Could not communicate with video player', e);
    }
  };

  // Fullscreen Handlers
  const enterFullscreen = () => {
    setIsFullscreen(true);
    try {
      if (playerWrapperRef.current && !document.fullscreenElement) {
        if (playerWrapperRef.current.requestFullscreen) {
          playerWrapperRef.current.requestFullscreen().catch(() => {});
        } else if ((playerWrapperRef.current as any).webkitRequestFullscreen) {
          (playerWrapperRef.current as any).webkitRequestFullscreen();
        }
      }
    } catch (e) {
      // Gracefully fall back to CSS fixed overlay
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (e) {}
  };

  // Sync native fullscreen changes (e.g. user pressed Esc on keyboard)
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Handle ESC key in CSS overlay fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Lock background body scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Condition 1 & 2: After user clicks to unmute, restart video from second 0 and expand to fullscreen immediately
  const handleUnmuteAndRestart = () => {
    // 1. Restart playback from the very first second (00:00)
    setSecondsElapsed(0);
    postToPlayer('seekTo', [0, true]);

    // 2. Unmute and set volume to 100%
    postToPlayer('unMute');
    postToPlayer('setVolume', [100]);
    postToPlayer('playVideo');
    setIsMuted(false);
    setIsPlaying(true);

    // 3. Expand to fullscreen immediately
    enterFullscreen();
  };

  const handleToggleMute = () => {
    if (isMuted) {
      handleUnmuteAndRestart();
    } else {
      postToPlayer('mute');
      setIsMuted(true);
    }
  };

  // Condition 2: After user clicks to play, play and expand to fullscreen immediately
  const handleTogglePlay = () => {
    if (isPlaying) {
      postToPlayer('pauseVideo');
      setIsPlaying(false);
    } else {
      postToPlayer('playVideo');
      setIsPlaying(true);
      enterFullscreen();
    }
  };

  // Sync Timer directly with YouTube iframe player state & enforce NO SEEK
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // Player ready
        if (data.event === 'onReady') {
          postToPlayer('playVideo');
        }

        // On state change: 1 = playing, 2 = paused, 0 = ended
        if (data.event === 'onStateChange') {
          if (data.info === 1) {
            setIsPlaying(true);
          } else if (data.info === 2) {
            setIsPlaying(false);
          } else if (data.info === 0) {
            setIsPlaying(false);
            // End of video reached
            setSecondsElapsed(TOTAL_DURATION_SECONDS);
            setIsCompleted(true);
          }
        }

        // Info delivery includes currentTime
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.playerState === 'number') {
            if (data.info.playerState === 1) setIsPlaying(true);
            else if (data.info.playerState === 2) setIsPlaying(false);
            else if (data.info.playerState === 0) {
              setIsPlaying(false);
              setSecondsElapsed(TOTAL_DURATION_SECONDS);
              setIsCompleted(true);
            }
          }

          // Anti-Seek enforcement: If user tries to seek ahead of actual elapsed time, snap back!
          if (typeof data.info.currentTime === 'number') {
            const ytCurrentTime = Math.floor(data.info.currentTime);
            // Allow only small jitter (±3s), if jumped > 4s ahead of secondsElapsed, pull them back!
            if (ytCurrentTime > secondsElapsed + 4 && !isCompleted) {
              setShowSkipWarning(true);
              postToPlayer('seekTo', [secondsElapsed, true]);
              setTimeout(() => setShowSkipWarning(false), 3500);
            }
          }
        }
      } catch (err) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [secondsElapsed, isCompleted, TOTAL_DURATION_SECONDS]);

  // Autoplay kickstart
  useEffect(() => {
    const startPlayback = () => {
      postToPlayer('playVideo');
      try {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'listening' }),
            '*'
          );
        }
      } catch (e) {}
    };

    const t1 = setTimeout(startPlayback, 400);
    const t2 = setTimeout(startPlayback, 1200);

    const userGestureEvents = ['click', 'touchstart', 'pointerdown'];
    const handleFirstGesture = () => {
      postToPlayer('playVideo');
      userGestureEvents.forEach((evt) => window.removeEventListener(evt, handleFirstGesture));
    };

    userGestureEvents.forEach((evt) =>
      window.addEventListener(evt, handleFirstGesture, { passive: true, once: true })
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      userGestureEvents.forEach((evt) => window.removeEventListener(evt, handleFirstGesture));
    };
  }, [activeYoutubeId]);

  // Listen for unmute event from Hero CTA: starts from second 0 and opens fullscreen
  useEffect(() => {
    const handleTriggerUnmute = () => {
      handleUnmuteAndRestart();
    };
    window.addEventListener('atomy-unmute-video', handleTriggerUnmute);
    return () => window.removeEventListener('atomy-unmute-video', handleTriggerUnmute);
  }, []);

  // Countdown / Elapsed timer (only ticks during playback)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;
          if (next >= TOTAL_DURATION_SECONDS) {
            setIsCompleted(true);
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
  }, [isPlaying, TOTAL_DURATION_SECONDS]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((secondsElapsed / TOTAL_DURATION_SECONDS) * 100));

  const handleResetTimer = () => {
    setSecondsElapsed(0);
    setIsCompleted(false);
    setIsPlaying(true);
    postToPlayer('seekTo', [0, true]);
    postToPlayer('playVideo');
  };

  const originParam =
    typeof window !== 'undefined' && window.location.origin
      ? `&origin=${encodeURIComponent(window.location.origin)}`
      : '';

  // Get active chapter
  const activeChapter =
    [...VIDEO_CHAPTERS].reverse().find((ch) => secondsElapsed >= ch.timeSeconds) || VIDEO_CHAPTERS[0];

  return (
    <section id="video-15min" className="py-10 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-sky-400 text-xs sm:text-sm font-medium mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>วิดีโอเจาะลึก 20 นาทีเปลี่ยนชีวิต (ระบบป้องกันการเลื่อนข้าม)</span>
          </div>

          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-snug">
            <span className="inline-block">ทำความรู้จักธุรกิจ อะโทมี่ (Atomy)</span>{' '}
            <span className="text-sky-400 inline-block">ใน 20 นาที</span>
          </h2>
          <p className="mt-2.5 sm:mt-3 text-slate-300 text-xs sm:text-base leading-relaxed text-pretty">
            รับชมวิดีโอนี้ให้ครบ 20 นาทีเพื่อทำความเข้าใจโมเดลธุรกิจ แหล่งที่มาของรายได้ และความมั่นคงของบริษัทระดับโลก ก่อนกรอกแบบฟอร์มรับรหัสผู้แนะนำ
          </p>

          {/* No Seek Rule Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>ระบบกำหนดให้รับชมต่อเนื่องครบ 20 นาที ไม่อนุญาตให้กดข้ามเพื่อความเข้าใจในธุรกิจอย่างสมบูรณ์</span>
          </div>
        </div>

        {/* Main Video & Chapters Grid */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left / Center: Video Player + 20-Minute Countdown Bar */}
          <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-4">
            {/* The Video Container */}
            <div
              ref={playerWrapperRef}
              className={
                isFullscreen
                  ? 'fixed inset-0 z-[99999] w-screen h-screen bg-black overflow-hidden select-none flex items-center justify-center'
                  : 'relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700/80 group'
              }
            >
              {/* YouTube Video iframe (Fills 100% of screen in fullscreen) */}
              <iframe
                ref={iframeRef}
                key={activeYoutubeId}
                className="w-full h-full border-0 absolute inset-0"
                src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=1&mute=1&playsinline=1&controls=0&disablekb=1&fs=1&modestbranding=1&enablejsapi=1&rel=0${originParam}&start=0`}
                title="Atomy Business Overview 20 Minutes"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen={true}
              />

              {/* Anti-Seek Warning Overlay */}
              {showSkipWarning && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-rose-600/95 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 border border-rose-400 animate-bounce max-w-[90%] text-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>ไม่อนุญาตให้เลื่อนข้าม! กรุณารับชมเนื้อหาให้ครบ 20 นาทีครับ</span>
                </div>
              )}

              {/* Floating Unmute Banner if currently muted (Condition 1 & 2: opens sound, restarts from second 0, expands to fullscreen) */}
              {isMuted && (
                <button
                  type="button"
                  onClick={handleUnmuteAndRestart}
                  className={`absolute ${
                    isFullscreen ? 'top-16 left-3 sm:left-6' : 'top-3 left-3 sm:top-4 sm:left-4'
                  } z-30 bg-blue-600/95 hover:bg-blue-600 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all animate-bounce cursor-pointer border border-blue-400`}
                  title="แตะเพื่อเปิดเสียงและเริ่มรับชมใหม่ตั้งแต่ต้น"
                >
                  <Volume2 className="w-4 h-4 text-sky-200 shrink-0" />
                  <span>แตะเพื่อเปิดเสียง (เริ่มใหม่ 00:00) 🔊</span>
                </button>
              )}

              {/* Tap to play prompt if video is paused initially in normal view */}
              {!isFullscreen && !isPlaying && secondsElapsed === 0 && (
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>กดเพื่อเริ่มเล่น (ขยายเต็มจอ)</span>
                </button>
              )}

              {/* --- FULLSCREEN FLOATING OVERLAYS (Floating HUD on top of pure video) --- */}
              {isFullscreen && (
                <>
                  {/* Top Floating Controls Bar */}
                  <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-5 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto min-w-0">
                      <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/50 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shrink-0">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-mono">{formatTime(secondsElapsed)} / {DURATION_MINUTES}:00</span>
                      </span>
                      <span className="hidden sm:inline-block text-xs font-medium text-slate-200/90 truncate max-w-xs drop-shadow-md">
                        {activeChapter.title}
                      </span>
                    </div>

                    {/* Prominent Minimize Button (ปุ่มย่อหน้าจอปกติ) */}
                    <button
                      type="button"
                      onClick={exitFullscreen}
                      className="pointer-events-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 border border-amber-300 shrink-0"
                      title="ย่อกลับสู่หน้าจอปกติ"
                    >
                      <Minimize2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                      <span>ย่อหน้าจอปกติ</span>
                    </button>
                  </div>

                  {/* Bottom Floating Controls Bar (Sleek overlay directly on video) */}
                  <div className="absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2 pointer-events-none">
                    {/* Floating Progress Bar */}
                    <div className="w-full h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden pointer-events-auto">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Floating Controls Row */}
                    <div className="flex items-center justify-between gap-2 pointer-events-auto mt-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Play/Pause */}
                        <button
                          type="button"
                          onClick={handleTogglePlay}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg cursor-pointer transition-all active:scale-95 shrink-0"
                          title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5 fill-slate-950" />
                          )}
                        </button>

                        {/* Mute/Unmute */}
                        <button
                          type="button"
                          onClick={handleToggleMute}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold shadow-lg cursor-pointer transition-all active:scale-95 shrink-0 border ${
                            isMuted
                              ? 'bg-black/70 hover:bg-black/90 text-amber-300 border-amber-500/50'
                              : 'bg-black/70 hover:bg-black/90 text-sky-300 border-white/30'
                          }`}
                          title={isMuted ? 'เปิดเสียงบรรยาย (เริ่มใหม่ 00:00)' : 'ปิดเสียง'}
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5 text-amber-400" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-sky-400" />
                          )}
                        </button>

                        <div className="text-white text-xs sm:text-sm drop-shadow-md">
                          <span className="font-mono font-bold text-sky-400">{formatTime(secondsElapsed)}</span>
                          <span className="text-white/60 text-[11px] sm:text-xs"> / {DURATION_MINUTES}:00 น.</span>
                          <p className="text-[11px] sm:text-xs text-slate-300 truncate max-w-[180px] sm:max-w-xs">
                            {activeChapter.title}
                          </p>
                        </div>
                      </div>

                      {/* Right side in bottom bar: Secondary Minimize button for thumb reach */}
                      <button
                        type="button"
                        onClick={exitFullscreen}
                        className="px-3 py-2 rounded-xl bg-black/70 hover:bg-black text-amber-300 hover:text-white border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95 shrink-0"
                        title="ย่อหน้าจอปกติ"
                      >
                        <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>ย่อจอ</span>
                      </button>
                    </div>
                  </div>

                  {/* Congratulations Overlay when Completed in Fullscreen */}
                  {isCompleted && (
                    <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                      <div className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-6 text-center shadow-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 mx-auto mb-3">
                          <Trophy className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
                          <span>ยินดีด้วย! รับชมครบ 20 นาทีแล้ว</span>
                          <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </h3>
                        <p className="text-xs sm:text-sm text-emerald-200 mt-1 mb-4">
                          คุณได้รับสิทธิ์เข้าสู่แบบฟอร์มเพื่อรับรหัสสปอนเซอร์และเปิดรหัสสมาชิกฟรี
                        </p>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              exitFullscreen();
                              onOpenLineModal();
                            }}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg cursor-pointer active:scale-95"
                          >
                            ไปที่แบบฟอร์มรับรหัสฟรี
                          </button>
                          <button
                            type="button"
                            onClick={exitFullscreen}
                            className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
                          >
                            ย่อหน้าจอปกติ
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* In-Page 20-Minute Live Interactive Tracker Bar (Always available on normal page) */}
            <div className="bg-slate-800/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-700 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* Play/Pause Button */}
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                        isPlaying
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                      title={isPlaying ? 'หยุดชั่วคราว' : 'เริ่มเล่น / ขยายเต็มจอ'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-white" />
                      )}
                    </button>

                    {/* Mute/Unmute Button */}
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer shrink-0 border ${
                        isMuted
                          ? 'bg-slate-700/90 hover:bg-slate-600 text-amber-300 border-amber-500/40'
                          : 'bg-slate-700/80 hover:bg-slate-600 text-sky-300 border-slate-600'
                      }`}
                      title={isMuted ? 'เปิดเสียงบรรยาย (เริ่มใหม่ 00:00)' : 'ปิดเสียง (Mute)'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-mono text-base sm:text-lg font-bold text-sky-400">
                          {formatTime(secondsElapsed)}
                        </span>
                        <span className="text-slate-400 text-xs font-mono">/ {DURATION_MINUTES}:00 น.</span>
                        {isPlaying ? (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            กำลังเล่น
                          </span>
                        ) : (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-700/60 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            หยุดชั่วคราว
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 break-words">
                        <BookmarkCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{activeChapter.title}</span>
                      </p>
                    </div>
                  </div>

                  {/* Reset button next to time on mobile */}
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-xs flex items-center gap-1 cursor-pointer sm:hidden shrink-0"
                    title="เริ่มนับเวลาใหม่ตั้งแต่ต้น"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Actions: Fullscreen/Minimize + Reset + Lock Status */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  {/* Fullscreen Toggle Button */}
                  <button
                    type="button"
                    onClick={enterFullscreen}
                    className="px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                    title="ขยายวิดีโอเต็มหน้าจอ"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>ขยายเต็มจอ</span>
                  </button>

                  <button
                    onClick={handleResetTimer}
                    className="hidden sm:flex p-2 text-slate-400 hover:text-white rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-xs items-center gap-1 cursor-pointer"
                    title="เริ่มนับเวลาใหม่"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>เริ่มดูใหม่</span>
                  </button>

                  {!isCompleted ? (
                    <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-900/80 border border-slate-700 px-3 py-2 sm:py-1.5 rounded-lg">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>ต้องดูครบ {DURATION_MINUTES} นาที ({Math.floor(secondsElapsed / 60)}/{DURATION_MINUTES})</span>
                    </span>
                  ) : (
                    <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-700 px-2.5 py-1.5 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>ดูครบ {DURATION_MINUTES} นาทีแล้ว</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Percentage Bar */}
              <div className="mt-3 sm:mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                  <span>ความคืบหน้า: {progressPercent}%</span>
                  <span>
                    {Math.max(0, DURATION_MINUTES - Math.floor(secondsElapsed / 60))} นาทีคงเหลือ
                  </span>
                </div>
                <div className="w-full h-2 sm:h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* UNLOCKED SUCCESS BANNER in page (Appears when 20 mins finished) */}
            {isCompleted && (
              <div className="w-full bg-gradient-to-r from-emerald-900/90 via-slate-800 to-emerald-900/90 border-2 border-emerald-500/70 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 shrink-0">
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                      <span>ยินดีด้วย! คุณรับชมข้อมูลครบ 20 นาทีแล้ว</span>
                      <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                      ปลดล็อกสิทธิ์: กรอกแบบฟอร์มด้านล่างเพื่อรับรหัสสปอนเซอร์และคำแนะนำเปิดรหัสฟรี
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenLineModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-600/40 transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>ไปที่แบบฟอร์มรับรหัสฟรี</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: 20-Minute Chapters & Highlights (View Only, No Skip) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>ในวิดีโอนี้คุณจะได้เรียนรู้:</span>
                </h3>
                <span className="text-[10px] sm:text-[11px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>ห้ามเลื่อนข้าม</span>
                </span>
              </div>

              {/* Chapters List (Strictly View Only) */}
              <div className="mt-3 space-y-2 sm:space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {VIDEO_CHAPTERS.map((ch) => {
                  const isCurrent = activeChapter.id === ch.id;
                  const isPast = secondsElapsed >= ch.timeSeconds;
                  return (
                    <div
                      key={ch.id}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        isCurrent
                          ? 'bg-blue-600/30 border-blue-500 shadow-md shadow-blue-500/20'
                          : isPast
                          ? 'bg-slate-900/80 border-slate-700/80'
                          : 'bg-slate-900/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                            isCurrent
                              ? 'bg-blue-500 text-white'
                              : isPast
                              ? 'bg-emerald-900/60 text-emerald-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {ch.timestamp}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] text-sky-300 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                            ช่วงปัจจุบัน
                          </span>
                        )}
                        {isPast && !isCurrent && (
                          <span className="text-[10px] text-emerald-400 font-medium">✓ ผ่านแล้ว</span>
                        )}
                      </div>

                      <h4
                        className={`text-xs sm:text-sm font-semibold mt-2 ${
                          isCurrent ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {ch.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {ch.description}
                      </p>
                      
                      <div className="mt-2 text-[11px] text-sky-300 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-900/60">
                        ⚡ {ch.highlight}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Step Callout */}
              <div className="mt-5 p-3.5 bg-gradient-to-r from-blue-950 to-slate-900 rounded-xl border border-blue-800/60 text-center">
                <p className="text-xs text-slate-300">
                  ต้องการเปิดรหัสสมาชิกทันทีโดยไม่ต้องรอจบ?
                </p>
                <button
                  onClick={onOpenLineModal}
                  className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>ไปกรอกแบบฟอร์มขอรหัสสมาชิก</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
