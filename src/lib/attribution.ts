import { LeadAttribution } from '../types';

const STORAGE_KEY = 'atomy_attribution_v1';

function clean(value: string | null, maxLength = 180) {
  return value?.trim().slice(0, maxLength) || undefined;
}

export function captureAttribution(): LeadAttribution {
  const params = new URLSearchParams(window.location.search);
  const current: LeadAttribution = {
    utmSource: clean(params.get('utm_source')),
    utmMedium: clean(params.get('utm_medium')),
    utmCampaign: clean(params.get('utm_campaign')),
    utmContent: clean(params.get('utm_content')),
    utmTerm: clean(params.get('utm_term')),
    ttclid: clean(params.get('ttclid'), 220),
    landingPage: `${window.location.origin}${window.location.pathname}`,
    referrer: clean(document.referrer, 300),
    eventId: crypto.randomUUID(),
  };

  try {
    const previous = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as Partial<LeadAttribution>;
    const merged = { ...previous, ...Object.fromEntries(Object.entries(current).filter(([, value]) => value)) } as LeadAttribution;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return { ...merged, eventId: crypto.randomUUID() };
  } catch {
    return current;
  }
}
