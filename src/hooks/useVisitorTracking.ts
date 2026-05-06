import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a simple browser fingerprint hash for anonymous visitor tracking.
 * Not perfect, but good enough for basic unique visitor counting.
 */
function generateVisitorHash(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 'unknown',
  ];
  
  const raw = components.join('|');
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

const SESSION_KEY = 'mn_visit_recorded';

export function useVisitorTracking() {
  useEffect(() => {
    // Only record once per session
    const alreadyRecorded = sessionStorage.getItem(SESSION_KEY);
    if (alreadyRecorded) return;

    const visitorHash = generateVisitorHash();
    const pagePath = window.location.pathname;

    supabase
      .from('site_visits')
      .insert({
        visitor_hash: visitorHash,
        page_path: pagePath,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      })
      .then(() => {
        sessionStorage.setItem(SESSION_KEY, '1');
      });
  }, []);
}
