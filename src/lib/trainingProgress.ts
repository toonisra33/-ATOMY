/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DayProgress {
  dayNumber: number;
  isVideoCompleted: boolean;
  videoCompletedAt?: number | null;
  isQuizPassed: boolean;
  quizPassedAt?: number | null; // Timestamp ms when quiz achieved 10/10
  quizScore?: number;
}

export type DayLockStatus =
  | 'UNLOCKED'
  | 'COUNTDOWN_RUNNING'
  | 'LOCKED_WAITING_PREVIOUS_QUIZ';

export interface DayLockInfo {
  status: DayLockStatus;
  isUnlocked: boolean;
  remainingMs: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedCountdown: string;
  unlockTimestamp: number | null;
  requiredDayNumber: number;
}

export const FUNNEL_UNLOCK_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const SEVEN_DAYS_OVERVIEW = [
  {
    dayNumber: 1,
    title: "Work Hard กับ Work Smart",
    subtitle: "ผมเจอทางแล้วว่าผมควรจะไปทางไหน",
    duration: "60 นาที",
  },
  {
    dayNumber: 2,
    title: "คำเตือนจากคนรุ่นปู่ จงรู้จักคุณค่าของเวลา",
    subtitle: "เวลาคือสิ่งเดียวที่ไม่สามารถซื้อคืนได้ อย่าเอา 40 ปีไปแลกกับความว่างเปล่า",
    duration: "60 นาที",
  },
  {
    dayNumber: 3,
    title: "ธุรกิจเครือข่ายไม่ได้หลอกคุณ แต่คุณเลือกเครื่องมือผิดมาตลอด",
    subtitle: "ผ่าตัดความจริงวงการ MLM: ทำไมคน 95% ถึงล้มเหลว และอะโทมี่ฉีกกฎเกณฑ์เดิมอย่างไร",
    duration: "60 นาที",
  },
  {
    dayNumber: 4,
    title: "ทำไมผมถึงเรียกอะโทมี่ว่า ห้างของคนจน",
    subtitle: "โอกาสทางธุรกิจที่เปิดกว้างที่สุด: เริ่มต้นจากศูนย์ ไม่ต้องใช้เงินทุน และเปลี่ยนชีวิตคนธรรมดาได้จริง",
    duration: "60 นาที",
  },
  {
    dayNumber: 5,
    title: "6 เดือนแรกที่ไม่มีใครบอกคุณ - กฎของเมล็ดพันธุ์",
    subtitle: "ธรรมชาติของการเติบโตแบบก้าวกระโดด: ทำไมช่วงแรกถึงเหนื่อยแต่ได้น้อย และทำไมอดทนข้ามพ้นแล้วจะหยุดไม่อยู่",
    duration: "60 นาที",
  },
  {
    dayNumber: 6,
    title: "ทำไมคนเก่งถึงสร้างทีมไม่ได้ แต่คนธรรมดาสร้างทีมพันคนได้ - ระบบ vs ฮีโร่",
    subtitle: "ถอดรหัสการลอกเลียนแบบ 100%: ธุรกิจนี้ไม่ได้ต้องการซูเปอร์สตาร์ แต่ต้องการระบบที่คนธรรมดาทำซ้ำได้",
    duration: "60 นาที",
  },
  {
    dayNumber: 7,
    title: "มรดก 3 ชั้น - งานเดียวที่ส่งต่อให้ลูกหลานได้",
    subtitle: "ปลายทางแห่งความเหนื่อยครั้งสุดท้าย: เปลี่ยนเวลาหยาดเหงื่อให้กลายเป็นบำนาญส่งต่อถึงรุ่นลูกและรุ่นหลาน",
    duration: "60 นาที",
  },
];

export interface ProspectLearnerSession {
  fullName: string;
  phoneNumber: string;
  email?: string;
  lineId?: string;
  registeredAt: number;
}

export interface EmailDispatchRecord {
  id: string;
  dayNumber: number;
  recipientName: string;
  recipientEmail: string;
  dispatchedAt: number;
  triggerReason: 'registration' | '24h_unlock' | 'manual_resend' | 'day_completion';
  status: 'sent' | 'opened';
}

const STORAGE_KEY = "atomy_7day_training_progress_v1";
const PROSPECT_LEARNER_KEY = "atomy_prospect_learner_session";
const EMAIL_DISPATCHES_KEY = "atomy_email_dispatches_v1";

export function getProspectLearnerSession(): ProspectLearnerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROSPECT_LEARNER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse prospect learner session", e);
  }
  return null;
}

export function saveProspectLearnerSession(session: ProspectLearnerSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROSPECT_LEARNER_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save prospect learner session", e);
  }
}

export function clearProspectLearnerSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROSPECT_LEARNER_KEY);
}

export function getEmailDispatches(): EmailDispatchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EMAIL_DISPATCHES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse email dispatches", e);
  }
  return [];
}

export function recordEmailDispatch(
  dayNumber: number,
  recipientName: string,
  recipientEmail: string,
  triggerReason: 'registration' | '24h_unlock' | 'manual_resend' | 'day_completion'
): EmailDispatchRecord[] {
  if (typeof window === "undefined") return [];
  const current = getEmailDispatches();
  const newRecord: EmailDispatchRecord = {
    id: `email-${dayNumber}-${Date.now()}`,
    dayNumber,
    recipientName,
    recipientEmail: recipientEmail || "registered-user@email.com",
    dispatchedAt: Date.now(),
    triggerReason,
    status: 'sent',
  };
  const updated = [newRecord, ...current];
  try {
    localStorage.setItem(EMAIL_DISPATCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save email dispatch", e);
  }
  return updated;
}

export function getStoredTrainingProgress(): Record<number, DayProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load training progress", e);
  }

  // Fallback: check legacy single flag for Day 1
  const legacyDay1Passed = localStorage.getItem("atomy_training_day_1_passed") === "true";
  if (legacyDay1Passed) {
    return {
      1: {
        dayNumber: 1,
        isVideoCompleted: true,
        isQuizPassed: true,
        quizPassedAt: Date.now() - 1000 * 60 * 5, // 5 mins ago
        quizScore: 10,
      },
    };
  }

  return {};
}

export function saveDayProgress(dayNumber: number, update: Partial<DayProgress>): Record<number, DayProgress> {
  if (typeof window === "undefined") return {};
  const current = getStoredTrainingProgress();
  const existing = current[dayNumber] || {
    dayNumber,
    isVideoCompleted: false,
    isQuizPassed: false,
  };

  const updatedDay: DayProgress = {
    ...existing,
    ...update,
    dayNumber,
  };

  // If quiz is passed, ensure quizPassedAt is set
  if (updatedDay.isQuizPassed && !updatedDay.quizPassedAt) {
    updatedDay.quizPassedAt = Date.now();
  }

  const newProgress = {
    ...current,
    [dayNumber]: updatedDay,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    // Also keep legacy flag for Day 1 backward compatibility
    if (dayNumber === 1 && updatedDay.isQuizPassed) {
      localStorage.setItem("atomy_training_day_1_passed", "true");
    }
  } catch (e) {
    console.error("Failed to save training progress", e);
  }

  return newProgress;
}

/**
 * Calculates whether a specific day is unlocked or still under the 24-hour countdown.
 *
 * RULE:
 * - Day 1 is always unlocked.
 * - Day N (from 2 to 7) requires Day (N-1) to have passed the quiz.
 *   - If Day (N-1) is NOT passed: LOCKED_WAITING_PREVIOUS_QUIZ (countdown is NOT running).
 *   - If Day (N-1) IS passed:
 *       unlockTimestamp = Day(N-1).quizPassedAt + 24 hours.
 *       - If now < unlockTimestamp: COUNTDOWN_RUNNING (countdown is active).
 *       - If now >= unlockTimestamp: UNLOCKED!
 */
export function getDayLockInfo(
  targetDay: number,
  allProgress: Record<number, DayProgress> = getStoredTrainingProgress(),
  now: number = Date.now()
): DayLockInfo {
  // Day 1 has a 24-hour countdown after lead form registration
  if (targetDay <= 1) {
    const day1Prog = allProgress[1];
    // If Day 1 was already passed, it is permanently unlocked
    if (day1Prog?.isQuizPassed) {
      return {
        status: 'UNLOCKED',
        isUnlocked: true,
        remainingMs: 0,
        remainingHours: 0,
        remainingMinutes: 0,
        remainingSeconds: 0,
        formattedCountdown: '00:00:00',
        unlockTimestamp: null,
        requiredDayNumber: 0,
      };
    }

    // Check if registered prospect has 24h countdown from registeredAt
    const prospect = getProspectLearnerSession();
    if (prospect && prospect.registeredAt) {
      const unlockTimestamp = prospect.registeredAt + FUNNEL_UNLOCK_DELAY_MS;
      const remainingMs = Math.max(0, unlockTimestamp - now);

      if (remainingMs > 0) {
        const totalSeconds = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedCountdown = `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return {
          status: 'COUNTDOWN_RUNNING',
          isUnlocked: false,
          remainingMs,
          remainingHours: hours,
          remainingMinutes: minutes,
          remainingSeconds: seconds,
          formattedCountdown,
          unlockTimestamp,
          requiredDayNumber: 0,
        };
      }
    }

    // Unlocked once 24h elapsed (or direct testing)
    return {
      status: 'UNLOCKED',
      isUnlocked: true,
      remainingMs: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedCountdown: '00:00:00',
      unlockTimestamp: null,
      requiredDayNumber: 0,
    };
  }

  const previousDay = targetDay - 1;
  const prevProg = allProgress[previousDay];

  // If previous day quiz is not passed:
  if (!prevProg || !prevProg.isQuizPassed || !prevProg.quizPassedAt) {
    return {
      status: 'LOCKED_WAITING_PREVIOUS_QUIZ',
      isUnlocked: false,
      remainingMs: FUNNEL_UNLOCK_DELAY_MS,
      remainingHours: 24,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedCountdown: '24:00:00',
      unlockTimestamp: null,
      requiredDayNumber: previousDay,
    };
  }

  // Previous day quiz WAS passed! Compute unlock timestamp
  const unlockTimestamp = prevProg.quizPassedAt + FUNNEL_UNLOCK_DELAY_MS;
  const remainingMs = Math.max(0, unlockTimestamp - now);

  if (remainingMs <= 0) {
    return {
      status: 'UNLOCKED',
      isUnlocked: true,
      remainingMs: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedCountdown: '00:00:00',
      unlockTimestamp,
      requiredDayNumber: previousDay,
    };
  }

  // Countdown is active!
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedCountdown = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    status: 'COUNTDOWN_RUNNING',
    isUnlocked: false,
    remainingMs,
    remainingHours: hours,
    remainingMinutes: minutes,
    remainingSeconds: seconds,
    formattedCountdown,
    unlockTimestamp,
    requiredDayNumber: previousDay,
  };
}

/**
 * Fast-forwards the 24-hour waiting countdown for Day 1 after lead registration
 */
export function simulateFastForwardDay1Registration() {
  if (typeof window === "undefined") return;
  const prospect = getProspectLearnerSession();
  if (prospect) {
    prospect.registeredAt = Date.now() - (FUNNEL_UNLOCK_DELAY_MS + 1000 * 60);
    saveProspectLearnerSession(prospect);
  }
}

/**
 * Fast-forward simulator for testing (skips 24 hours so next day unlocks immediately)
 */
export function simulateFastForwardDay(dayNumber: number) {
  if (typeof window === "undefined") return;

  if (dayNumber <= 1) {
    simulateFastForwardDay1Registration();
  }

  const progress = getStoredTrainingProgress();
  const currentDayProg = progress[dayNumber] || {
    dayNumber,
    isVideoCompleted: true,
    isQuizPassed: true,
  };

  // Set quizPassedAt to 25 hours ago
  currentDayProg.isVideoCompleted = true;
  currentDayProg.isQuizPassed = true;
  currentDayProg.quizScore = 10;
  currentDayProg.quizPassedAt = Date.now() - (FUNNEL_UNLOCK_DELAY_MS + 1000 * 60);

  progress[dayNumber] = currentDayProg;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  localStorage.setItem("atomy_training_day_1_passed", "true");
}

/**
 * Reset all training progress for testing from scratch
 */
export function resetAllTrainingProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("atomy_training_day_1_passed");
}
