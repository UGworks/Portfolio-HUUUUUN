type GtagCommand = 'config' | 'event' | 'js' | 'set';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, ...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = 'G-0GK9DRZDE7';

export type ProjectSelectMethod =
  | 'click'
  | 'wheel'
  | 'swipe'
  | 'keyboard'
  | 'auto'
  | 'video_end'
  | 'initial';

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag(...(args as [GtagCommand, ...unknown[]]));
}

function projectParams(project: { id: string; title: string; category?: string }) {
  return {
    project_id: project.id,
    project_title: project.title,
    project_category: project.category ?? '',
    item_id: project.id,
    item_name: project.title,
  };
}

/** SPA 가상 페이지뷰 (섹션 전환) */
export function trackPageView(pagePath: string, pageTitle?: string) {
  gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    send_to: MEASUREMENT_ID,
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  gtag('event', eventName, params);
}

/** 메뉴 클릭 */
export function trackMenuClick(label: string, section: string) {
  trackEvent('menu_click', {
    link_text: label,
    section,
  });
}

/** 메뉴 / 섹션 이동 */
export function trackSectionView(section: 'works' | 'about' | 'contact') {
  const labels = {
    works: 'Portfolio',
    about: 'CV',
    contact: 'CV',
  } as const;
  const path = section === 'works' ? '/' : `/#${section}`;
  trackPageView(path, labels[section]);
  trackEvent('section_view', {
    section,
    section_label: labels[section],
  });
}

/** 작품 조회 (1초 이상 머문 경우) */
export function trackProjectView(
  project: { id: string; title: string; category?: string },
  method: ProjectSelectMethod = 'initial'
) {
  trackEvent('project_view', {
    ...projectParams(project),
    select_method: method,
  });
}

/** 작품에서 떠날 때 — 체류 초 */
export function trackProjectLeave(
  project: { id: string; title: string; category?: string },
  dwellSeconds: number,
  method: ProjectSelectMethod = 'initial'
) {
  trackEvent('project_leave', {
    ...projectParams(project),
    dwell_seconds: dwellSeconds,
    select_method: method,
  });
}

export function trackVideoStart(
  project: { id: string; title: string; category?: string },
  durationSeconds?: number
) {
  trackEvent('video_start', {
    ...projectParams(project),
    video_title: project.title,
    video_provider: 'self_hosted',
    video_duration: durationSeconds != null ? Math.round(durationSeconds) : undefined,
  });
}

export function trackVideoProgress(
  project: { id: string; title: string; category?: string },
  percent: 25 | 50 | 75,
  currentSeconds: number
) {
  trackEvent('video_progress', {
    ...projectParams(project),
    video_title: project.title,
    video_percent: percent,
    video_current_time: Math.round(currentSeconds),
  });
}

export function trackVideoComplete(project: { id: string; title: string; category?: string }) {
  trackEvent('video_complete', {
    ...projectParams(project),
    video_title: project.title,
  });
}

/** 이력서 PDF 저장(인쇄) */
export function trackResumePdfSave() {
  trackEvent('file_download', {
    file_name: 'resume.pdf',
    file_extension: 'pdf',
    link_text: '이력서 PDF 저장',
    method: 'print',
  });
  trackEvent('resume_pdf_save', {
    method: 'print',
  });
}

/** 외부/연락처 클릭 */
export function trackOutboundClick(label: string, url: string) {
  trackEvent('click', {
    link_url: url,
    link_text: label,
    outbound: true,
  });
}

/** 체류시간 하트비트 (30초 단위) */
export function startEngagementHeartbeat(intervalMs = 30000) {
  let ticks = 0;
  const tick = () => {
    if (document.visibilityState !== 'visible') return;
    ticks += 1;
    trackEvent('engagement_heartbeat', {
      engaged_seconds: ticks * (intervalMs / 1000),
    });
  };
  const id = window.setInterval(tick, intervalMs);
  return () => window.clearInterval(id);
}
