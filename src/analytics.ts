type GtagCommand = 'config' | 'event' | 'js' | 'set';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, ...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = 'G-0GK9DRZDE7';

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag(...(args as [GtagCommand, ...unknown[]]));
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

/** 메뉴 / 섹션 이동 */
export function trackSectionView(section: 'works' | 'about' | 'contact') {
  const labels = {
    works: 'Portfolio',
    about: 'About',
    contact: 'About',
  } as const;
  const path = section === 'works' ? '/' : `/#${section}`;
  trackPageView(path, labels[section]);
  trackEvent('section_view', {
    section,
    section_label: labels[section],
  });
}

/** 포트폴리오 작품 조회 */
export function trackProjectView(project: {
  id: string;
  title: string;
  category?: string;
}) {
  trackEvent('project_view', {
    project_id: project.id,
    project_title: project.title,
    project_category: project.category ?? '',
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

/** 체류시간 하트비트 (분 단위 누적) */
export function startEngagementHeartbeat(intervalMs = 30000) {
  let minutes = 0;
  const tick = () => {
    if (document.visibilityState !== 'visible') return;
    minutes += 1;
    trackEvent('engagement_heartbeat', {
      engaged_minutes: minutes,
      engaged_seconds: minutes * (intervalMs / 1000),
    });
  };
  const id = window.setInterval(tick, intervalMs);
  return () => window.clearInterval(id);
}
