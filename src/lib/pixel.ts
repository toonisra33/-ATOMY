// Pixel tracking utility for Meta (Facebook), TikTok, Google Analytics, and LINE Tag

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    _lt?: any;
  }
}

export interface PixelConfig {
  fbPixelId?: string;
  tiktokPixelId?: string;
  googleTagId?: string;
  lineTagId?: string;
}

export interface PixelEventLog {
  id: string;
  platform: 'Facebook' | 'TikTok' | 'Google' | 'LINE' | 'System';
  eventName: string;
  timestamp: string;
  details?: Record<string, any>;
}

// In-memory event log for debugging & verification
const eventListeners: ((logs: PixelEventLog[]) => void)[] = [];
let recentLogs: PixelEventLog[] = [];

function logPixelEvent(platform: PixelEventLog['platform'], eventName: string, details?: Record<string, any>) {
  const log: PixelEventLog = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    platform,
    eventName,
    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    details,
  };
  recentLogs = [log, ...recentLogs.slice(0, 19)];
  eventListeners.forEach(listener => listener(recentLogs));
}

export function subscribePixelLogs(callback: (logs: PixelEventLog[]) => void) {
  eventListeners.push(callback);
  callback(recentLogs);
  return () => {
    const index = eventListeners.indexOf(callback);
    if (index !== -1) eventListeners.splice(index, 1);
  };
}

export function getRecentPixelLogs(): PixelEventLog[] {
  return recentLogs;
}

// ----------------------------------------------------
// Meta / Facebook Pixel
// ----------------------------------------------------
let activeFbPixelId: string | null = null;

export function initFacebookPixel(pixelId: string) {
  const cleanId = pixelId.trim();
  if (!cleanId || typeof window === 'undefined') return;
  if (activeFbPixelId === cleanId) return;

  activeFbPixelId = cleanId;

  if (!window.fbq) {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
  }

  try {
    window.fbq('init', cleanId);
    window.fbq('track', 'PageView');
    logPixelEvent('Facebook', 'init & PageView', { pixelId: cleanId });
  } catch (err) {
    console.warn('Meta Pixel Init error:', err);
  }
}

// ----------------------------------------------------
// TikTok Pixel
// ----------------------------------------------------
let activeTikTokPixelId: string | null = null;

export function initTikTokPixel(pixelId: string) {
  const cleanId = pixelId.trim();
  if (!cleanId || typeof window === 'undefined') return;
  if (activeTikTokPixelId === cleanId) return;

  activeTikTokPixelId = cleanId;

  if (!window.ttq) {
    /* eslint-disable */
    (function (w: any, d: any, t: any) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      ttq.methods = [
        'page',
        'track',
        'identify',
        'instances',
        'debug',
        'on',
        'off',
        'once',
        'ready',
        'alias',
        'group',
        'enableCookie',
        'disableCookie',
      ];
      ttq.setAndDefer = function (t: any, e: any) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (t: any) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) {
          ttq.setAndDefer(e, ttq.methods[n]);
        }
        return e;
      };
      ttq.load = function (e: any, n: any) {
        var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = i;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var o = d.createElement('script');
        o.type = 'text/javascript';
        o.async = true;
        o.src = i + '?sdkid=' + e + '&lib=' + t;
        var a = d.getElementsByTagName('script')[0];
        a.parentNode.insertBefore(o, a);
      };
    })(window, document, 'ttq');
    /* eslint-enable */
  }

  try {
    window.ttq.load(cleanId);
    window.ttq.page();
    logPixelEvent('TikTok', 'load & page()', { pixelId: cleanId });
  } catch (err) {
    console.warn('TikTok Pixel Init error:', err);
  }
}

// ----------------------------------------------------
// Google Analytics 4 / Google Tag
// ----------------------------------------------------
let activeGoogleTagId: string | null = null;

export function initGoogleTag(tagId: string) {
  const cleanId = tagId.trim();
  if (!cleanId || typeof window === 'undefined') return;
  if (activeGoogleTagId === cleanId) return;

  activeGoogleTagId = cleanId;

  if (!document.getElementById(`gtag-${cleanId}`)) {
    const script = document.createElement('script');
    script.id = `gtag-${cleanId}`;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', cleanId);
    logPixelEvent('Google', 'config & page_view', { tagId: cleanId });
  }
}

// ----------------------------------------------------
// Unified Batch Initializer
// ----------------------------------------------------
export function setupAllPixels(config: PixelConfig) {
  if (config.fbPixelId) {
    initFacebookPixel(config.fbPixelId);
  }
  if (config.tiktokPixelId) {
    initTikTokPixel(config.tiktokPixelId);
  }
  if (config.googleTagId) {
    initGoogleTag(config.googleTagId);
  }
}

// ----------------------------------------------------
// High-Level Conversion & Engagement Event Tracking
// ----------------------------------------------------

/**
 * Triggered when a prospect submits their contact info (Lead)
 */
export function trackLeadEvent(data: {
  fullName?: string;
  sponsorId: string;
  sponsorName: string;
  eventId?: string;
  ttclid?: string;
}) {
  // Facebook Pixel
  if (window.fbq) {
    try {
      window.fbq('track', 'Lead', {
        content_name: 'Atomy Satellite Lead Form',
        content_category: 'Business Opportunity',
        sponsor_id: data.sponsorId,
        sponsor_name: data.sponsorName,
      });
      logPixelEvent('Facebook', 'Lead', { sponsor: data.sponsorId });
    } catch (e) {
      console.warn(e);
    }
  }

  // TikTok Pixel
  if (window.ttq) {
    try {
      window.ttq.track('Lead', {
        content_name: 'Atomy Lead Form',
        content_id: data.sponsorId,
        event_id: data.eventId,
        ttclid: data.ttclid,
      });
      logPixelEvent('TikTok', 'Lead', { sponsor: data.sponsorId, eventId: data.eventId });
    } catch (e) {
      console.warn(e);
    }
  }

  // Google Analytics
  if (window.gtag) {
    try {
      window.gtag('event', 'generate_lead', {
        event_category: 'engagement',
        event_label: `Sponsor: ${data.sponsorId}`,
      });
      logPixelEvent('Google', 'generate_lead', { sponsor: data.sponsorId });
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Triggered when prospect clicks contact button (LINE / Call / Official Link)
 */
export function trackContactEvent(method: 'line' | 'call' | 'official_web' | 'qr_code', sponsorId: string) {
  if (window.fbq) {
    try {
      window.fbq('track', 'Contact', {
        contact_method: method,
        sponsor_id: sponsorId,
      });
      logPixelEvent('Facebook', 'Contact', { method, sponsorId });
    } catch (e) {
      console.warn(e);
    }
  }

  if (window.ttq) {
    try {
      window.ttq.track('Contact', {
        contact_method: method,
        sponsor_id: sponsorId,
      });
      logPixelEvent('TikTok', 'Contact', { method, sponsorId });
    } catch (e) {
      console.warn(e);
    }
  }

  if (window.gtag) {
    try {
      window.gtag('event', 'contact', {
        method: method,
        sponsor: sponsorId,
      });
      logPixelEvent('Google', 'contact', { method, sponsorId });
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Triggered when prospect engages deeply (e.g. watches video or reads plan)
 */
export function trackContentEngagement(contentName: string, sponsorId: string) {
  if (window.fbq) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: contentName,
        sponsor_id: sponsorId,
      });
      logPixelEvent('Facebook', 'ViewContent', { contentName });
    } catch (e) {
      console.warn(e);
    }
  }

  if (window.ttq) {
    try {
      window.ttq.track('ViewContent', {
        content_name: contentName,
        sponsor_id: sponsorId,
      });
      logPixelEvent('TikTok', 'ViewContent', { contentName });
    } catch (e) {
      console.warn(e);
    }
  }
}
