import React, { useState, useEffect, useRef } from 'react';
import { SponsorProfile, VideoChapter, VideoPreset } from '../types';
import { VIDEO_PRESETS, VIDEO_CHAPTERS } from '../data/atomyData';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Sparkles, MessageCircle, ChevronRight, ExternalLink, BookmarkCheck, Trophy } from 'lucide-react';

interface VideoSectionProps {
  sponsor: SponsorProfile;
  onOpenLineModal: () => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ sponsor, onOpenLineModal }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoPreset>(VIDEO_PRESETS[0]);
  const [activeChapter, setActiveChapter] = useState<VideoChapter>(VIDEO_CHAPTERS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [videoTimestamp, setVideoTimestamp] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const TOTAL_DURATION_SECONDS = 15 * 60; // 15 minutes = 900 seconds

  // Handle Timer ticking
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying]);

  // Sync active chapter based on elapsed seconds or manual jump
  useEffect(() => {
    const current = [...VIDEO_CHAPTERS].reverse().find(ch => secondsElapsed >= ch.timeSeconds);
    if (current) {
      setActiveChapter(current);
    }
  }, [secondsElapsed]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((secondsElapsed / TOTAL_DURATION_SECONDS) * 100));

  const handleSelectChapter = (chapter: VideoChapter) => {
    setActiveChapter(chapter);
    setVideoTimestamp(chapter.timeSeconds);
    setSecondsElapsed(chapter.timeSeconds);
    setIsPlaying(true);
  };

  const handleFastForwardComplete = () => {
    setSecondsElapsed(TOTAL_DURATION_SECONDS);
    setIsCompleted(true);
    setIsPlaying(false);
  };

  const handleResetTimer = () => {
    setSecondsElapsed(0);
    setVideoTimestamp(0);
    setIsCompleted(false);
    setIsPlaying(false);
  };

  return (
    <section id="video-15min" className="py-14 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/50 text-sky-400 text-xs sm:text-sm font-medium mb-3">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>วิดีโอเจาะลึก 15 นาทีเปลี่ยนชีวิต</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            ทำความรู้จักธุรกิจ อะโทมี่ (Atomy) <span className="text-sky-400">ใน 15 นาที</span>
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            รับชมวิดีโอนี้เพื่อทำความเข้าใจโมเดลธุรกิจ แหล่งที่มาของรายได้ และความมั่นคงของบริษัทระดับโลก ก่อนตัดสินใจเริ่มต้นร่วมทีม
          </p>
        </div>

        {/* Video Selector Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {VIDEO_PRESETS.map((vid) => {
            const isCurrent = vid.id === selectedVideo.id;
            return (
              <button
                key={vid.id}
                onClick={() => {
                  setSelectedVideo(vid);
                  setVideoTimestamp(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
                }`}
              >
                <span>{vid.title.length > 28 ? vid.title.slice(0, 28) + '...' : vid.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-sky-300">
                  {vid.durationLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Video & Chapters Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center: Video Player + 15-Minute Countdown Bar */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* The Video Container with 16:9 ratio */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700/80 group">
              <iframe
                key={`${selectedVideo.youtubeId}-${videoTimestamp}`}
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=${isPlaying ? 1 : 0}&start=${videoTimestamp}&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* 15-Minute Live Interactive Tracker Bar */}
            <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                    title={isPlaying ? 'หยุดชั่วคราว' : 'เริ่มเล่น / นับเวลา'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">เวลารับชมปัจจุบัน:</span>
                      <span className="font-mono text-lg font-bold text-sky-400">
                        {formatTime(secondsElapsed)}
                      </span>
                      <span className="text-slate-500 text-xs font-mono">/ 15:00 นาที</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                      <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>{activeChapter.title}</span>
                    </p>
                  </div>
                </div>

                {/* Fast Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={handleResetTimer}
                    className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="เริ่มนับเวลาใหม่"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">รีเซ็ต</span>
                  </button>

                  {!isCompleted ? (
                    <button
                      id="btn-fast-forward-video"
                      onClick={handleFastForwardComplete}
                      className="px-3 py-1.5 bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>ฉันดูจบแล้ว (ปลดล็อกขั้นตอนถัดไป)</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-700 px-2.5 py-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ดูครบ 15 นาทีแล้ว</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Percentage Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                  <span>ความคืบหน้า: {progressPercent}%</span>
                  <span>{15 - Math.floor(secondsElapsed / 60)} นาทีคงเหลือ</span>
                </div>
                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* UNLOCKED SUCCESS BANNER (Appears when 15 mins finished or completed) */}
            {isCompleted && (
              <div className="bg-gradient-to-r from-emerald-900/90 via-slate-800 to-emerald-900/90 border-2 border-emerald-500/70 rounded-2xl p-5 sm:p-6 shadow-2xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 shrink-0">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                      <span>ยินดีด้วย! คุณรับชมข้อมูลครบ 15 นาทีแล้ว</span>
                      <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                      ปลดล็อกสิทธิพิเศษ: รับรหัสสปอนเซอร์ และคู่มือเริ่มต้นธุรกิจฟรีกับคุณ {sponsor.sponsorName}
                    </p>
                  </div>
                </div>

                <a
                  href={sponsor.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-600/40 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>แอด LINE รับสิทธิ์ทันที</span>
                </a>
              </div>
            )}
          </div>

          {/* Right Column: 15-Minute Chapters & Highlights */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>หัวข้อบรรยาย 15 นาที</span>
                </h3>
                <span className="text-[11px] text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  คลิกเพื่อข้ามไปยังหัวข้อ
                </span>
              </div>

              {/* Chapters List */}
              <div className="mt-3 space-y-2.5">
                {VIDEO_CHAPTERS.map((ch) => {
                  const isSelected = activeChapter.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch)}
                      className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 shadow-md shadow-blue-500/20'
                          : 'bg-slate-900/50 hover:bg-slate-900 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {ch.timestamp}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] text-sky-300 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                            กำลังเล่น
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs sm:text-sm font-semibold mt-2 ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}>
                        {ch.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {ch.description}
                      </p>
                      
                      <div className="mt-2 text-[10px] text-sky-300 bg-sky-950/50 px-2 py-1 rounded border border-sky-900/50">
                        ⚡ {ch.highlight}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Next Step Callout */}
              <div className="mt-5 p-3.5 bg-gradient-to-r from-blue-950 to-slate-900 rounded-xl border border-blue-800/60 text-center">
                <p className="text-xs text-slate-300">
                  มีข้อสงสัยระหว่างรับชมวิดีโอ?
                </p>
                <button
                  onClick={onOpenLineModal}
                  className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>ปรึกษาสปอนเซอร์ผ่าน LINE ทันที</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
