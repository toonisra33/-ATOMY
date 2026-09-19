/**
 * Utility to detect if the current device accessing the app is Desktop or Mobile
 */
export function detectDeviceType(): 'desktop' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua);
  const isSmallScreen = window.innerWidth < 768;
  
  return (isMobileUA || isSmallScreen) ? 'mobile' : 'desktop';
}
