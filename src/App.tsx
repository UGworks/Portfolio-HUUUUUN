import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import Header from './components/Header';
import PortfolioLayout from './components/PortfolioLayout';
import GeneralInfoPanel from './components/GeneralInfoPanel';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LoadingScreen from './components/LoadingScreen';
import IntroScreen from './components/IntroScreen';
import EndingScreen from './components/EndingScreen';
import { projects } from './data';
import { Project } from './types';
import { getSchoolCopy } from './schoolCopy';
import {
  ProjectSelectMethod,
  startEngagementHeartbeat,
  trackProjectLeave,
  trackProjectView,
  trackSectionView,
} from './analytics';

type AppSection = 'works' | 'about' | 'contact';

const getInitialSection = (): AppSection => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'contact') return 'contact';
  if (hash === 'about') return 'about';
  return 'works';
};

function App() {
  const { school } = useParams<{ school: string }>();
  const schoolCopyData = getSchoolCopy(school);
  const [isBootReady, setIsBootReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection>(getInitialSection);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  const [showPersonIntro, setShowPersonIntro] = useState(() => getInitialSection() === 'works');
  const [introChromeRevealing, setIntroChromeRevealing] = useState(false);
  /** 발표 엔딩(Thank you) 화면 — Shift+5 토글, Esc·클릭으로 닫기 */
  const [showEnding, setShowEnding] = useState(false);
  const showEndingRef = useRef(false);
  showEndingRef.current = showEnding;
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );
  const projectViewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewingRef = useRef<{
    project: Project;
    startedAt: number;
    method: ProjectSelectMethod;
  } | null>(null);
  const introHeaderDelayMs = 0;
  const introHeaderDurationMs = 520;
  const introExitFadeMs = 480;
  const mobileIntroSidebarDelayMs = introHeaderDelayMs;
  const mobileIntroMaskDelayMs = introHeaderDurationMs + 80;
  const mobileIntroMaskDurationMs = 500;
  const mobileIntroInfoDelayMs = mobileIntroMaskDelayMs + mobileIntroMaskDurationMs + 120;
  const mobileIntroTotalMs = mobileIntroInfoDelayMs + 480;
  /* 데스크톱 등장 순서: 메인 스와이프·줌(0~2.0s) → 썸네일(1.4s~) → 상세 패널(2.5s~) */
  const desktopIntroMaskDelayMs = 0;
  const desktopIntroMaskDurationMs = 2000;
  const desktopIntroSidebarDelayMs = 1400;
  const desktopIntroInfoDelayMs = desktopIntroMaskDelayMs + desktopIntroMaskDurationMs + 500;
  const desktopIntroTotalMs = desktopIntroInfoDelayMs + 480;
  const introMaskDelayMs = isMobileLayout ? mobileIntroMaskDelayMs : desktopIntroMaskDelayMs;
  const introMaskDurationMs = isMobileLayout ? mobileIntroMaskDurationMs : desktopIntroMaskDurationMs;
  const introSidebarDelayMs = isMobileLayout ? mobileIntroSidebarDelayMs : desktopIntroSidebarDelayMs;
  const introInfoDelayMs = isMobileLayout ? mobileIntroInfoDelayMs : desktopIntroInfoDelayMs;
  const introTotalMs = isMobileLayout ? mobileIntroTotalMs : desktopIntroTotalMs;
  /** 포트폴리오 등장 효과를 이미 한 번 끝까지 재생했는가.
      about/contact에서 돌아올 때는 건너뛰고, 로고로 인트로를 다시 열면 초기화한다.
      (인트로가 끝나는 순간 세우면 등장 효과가 첫 프레임에서 잘려 보일 때와 안 보일 때가 생긴다) */
  const hasPlayedEntranceRef = useRef(false);

  const handleBuffered = useCallback(() => {
    setIsBootReady(true);
  }, []);

  const handleSectionChange = (section: AppSection) => {
    setActiveSection(section);
    window.history.replaceState(null, '', `#${section}`);
  };

  const flushProjectLeave = useCallback(() => {
    const current = viewingRef.current;
    if (!current) return;
    const dwellSeconds = Math.round((Date.now() - current.startedAt) / 1000);
    if (dwellSeconds >= 1) {
      trackProjectLeave(current.project, dwellSeconds, current.method);
    }
    viewingRef.current = null;
  }, []);

  const handleProjectChange = useCallback((
    project: Project | null,
    method: ProjectSelectMethod = 'initial'
  ) => {
    flushProjectLeave();
    setActiveProject(project);
    if (projectViewTimerRef.current) {
      clearTimeout(projectViewTimerRef.current);
      projectViewTimerRef.current = null;
    }
    if (!project) return;
    viewingRef.current = { project, startedAt: Date.now(), method };
    // 빠르게 넘긴 작품은 제외, 약 1초 이상 본 작품만 조회로 기록
    projectViewTimerRef.current = setTimeout(() => {
      trackProjectView(project, method);
    }, 1000);
  }, [flushProjectLeave]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (activeSection !== 'works') flushProjectLeave();
  }, [activeSection, flushProjectLeave]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushProjectLeave();
        return;
      }
      if (activeProject) {
        viewingRef.current = {
          project: activeProject,
          startedAt: Date.now(),
          method: viewingRef.current?.method ?? 'initial',
        };
      }
    };
    const onPageHide = () => flushProjectLeave();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [activeProject, flushProjectLeave]);

  useEffect(() => {
    if (!isBootReady) return;
    trackSectionView(activeSection);
  }, [isBootReady, activeSection]);

  useEffect(() => {
    if (!isBootReady) return;
    return startEngagementHeartbeat(30000);
  }, [isBootReady]);

  const handlePersonIntroDone = useCallback(() => {
    setShowPersonIntro(false);
    setIntroChromeRevealing(false);
  }, []);

  const handleShowPersonIntro = useCallback(() => {
    flushProjectLeave();
    setActiveSection('works');
    window.history.replaceState(null, '', '#works');
    window.scrollTo(0, 0);
    setIntroChromeRevealing(false);
    hasPlayedEntranceRef.current = false;
    setHasPlayedIntro(false);
    setShowPersonIntro(true);
  }, [flushProjectLeave]);

  const portfolioChromeRevealed =
    !isMobileLayout || !showPersonIntro || introChromeRevealing;
  const showPortfolioChrome = !showPersonIntro || isMobileLayout;
  const isPortfolioEntering = !hasPlayedIntro;

  useEffect(() => {
    const onResize = () => setIsMobileLayout(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isBootReady || showPersonIntro) return;
    if (activeSection === 'works') {
      if (hasPlayedEntranceRef.current) {
        setHasPlayedIntro(true);
        return;
      }
      setHasPlayedIntro(false);
      const timer = setTimeout(() => {
        hasPlayedEntranceRef.current = true;
        setHasPlayedIntro(true);
      }, introTotalMs);
      return () => clearTimeout(timer);
    }
    setHasPlayedIntro(true);
  }, [isBootReady, showPersonIntro, activeSection, introTotalMs]);

  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  useEffect(() => {
    const preventDevShortcuts = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) {
        e.preventDefault();
        return;
      }
    };
    document.addEventListener('keydown', preventDevShortcuts);
    return () => document.removeEventListener('keydown', preventDevShortcuts);
  }, []);

  // 전체화면: Cmd+Enter(맥) / Ctrl+Enter(윈도우)로 진입, Esc로 종료
  useEffect(() => {
    const getFullscreenElement = () =>
      document.fullscreenElement ??
      (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ??
      null;

    const enterFullscreen = () => {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
      if (request) void request.call(el);
    };

    const exitFullscreen = () => {
      const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void };
      const exit = doc.exitFullscreen ?? doc.webkitExitFullscreen;
      if (exit) void exit.call(doc);
    };

    const isEditing = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLElement &&
        (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Shift+5: 엔딩 화면 토글 (자판에 따라 e.key가 '%'로 바뀌므로 e.code로 본다)
      if (e.shiftKey && e.code === 'Digit5' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (isEditing()) return;
        e.preventDefault();
        setShowEnding((v) => !v);
        return;
      }
      if (e.key === 'Escape' && showEndingRef.current) {
        e.preventDefault();
        setShowEnding(false);
        return;
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (getFullscreenElement()) exitFullscreen();
        else enterFullscreen();
        return;
      }
      if (e.key === 'Escape' && getFullscreenElement()) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (projectViewTimerRef.current) clearTimeout(projectViewTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {showLoader && (
        <LoadingScreen
          projects={projects}
          onBuffered={handleBuffered}
          onGone={() => setShowLoader(false)}
        />
      )}

      <AnimatePresence>
        {isBootReady && showPersonIntro && (
          <IntroScreen
            key="person-intro"
            exitFadeMs={introExitFadeMs}
            onContinue={handlePersonIntroDone}
            onRevealChrome={() => setIntroChromeRevealing(true)}
          />
        )}
      </AnimatePresence>

      {isBootReady && showPortfolioChrome && (
        <>
          <Header
            onSectionChange={handleSectionChange}
            onHomeClick={handleShowPersonIntro}
            isIntro={isPortfolioEntering}
            introDelayMs={introHeaderDelayMs}
            introDurationMs={introHeaderDurationMs}
            isMobile={isMobileLayout}
            chromeRevealed={
              isMobileLayout
                ? activeSection !== 'works' || portfolioChromeRevealed
                : true
            }
          />
          {schoolCopyData && !showPersonIntro && (
            <div className="bg-gray-50 border-b border-gray-200 py-3 px-6 min-[2560px]:py-4 text-center">
              <p className="text-sm min-[2560px]:text-base font-medium text-gray-800">{schoolCopyData.headline}</p>
              {schoolCopyData.subline && (
                <p className="text-xs min-[2560px]:text-sm text-gray-500 mt-0.5">{schoolCopyData.subline}</p>
              )}
            </div>
          )}
          {activeSection === 'works' && showPortfolioChrome && (
            <>
              <PortfolioLayout
                projects={projects}
                onProjectChange={handleProjectChange}
                isIntro={isPortfolioEntering}
                introMaskDelayMs={introMaskDelayMs}
                introMaskDurationMs={introMaskDurationMs}
                introSidebarDelayMs={introSidebarDelayMs}
                introSidebarDurationMs={introHeaderDurationMs}
                chromeRevealed={portfolioChromeRevealed}
                isMobileLayout={isMobileLayout}
              />
              <GeneralInfoPanel
                activeProject={activeProject}
                isIntro={isPortfolioEntering}
                introDelayMs={introInfoDelayMs}
                introDurationMs={480}
                chromeRevealed={portfolioChromeRevealed}
                isMobile={isMobileLayout}
              />
            </>
          )}
          {!showPersonIntro && activeSection === 'about' && <AboutPage />}
          {!showPersonIntro && activeSection === 'contact' && <ContactPage />}
        </>
      )}

      <AnimatePresence>
        {showEnding && <EndingScreen key="ending" onClose={() => setShowEnding(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
