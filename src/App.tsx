import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/Header';
import PortfolioLayout from './components/PortfolioLayout';
import GeneralInfoPanel from './components/GeneralInfoPanel';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LoadingScreen from './components/LoadingScreen';
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
  const projectViewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewingRef = useRef<{
    project: Project;
    startedAt: number;
    method: ProjectSelectMethod;
  } | null>(null);
  const introHeaderDelayMs = 0;
  const introMaskDelayMs = 0;
  const introMaskDurationMs = 2000;
  const introSidebarDelayMs = 800;
  const introInfoDelayMs = introMaskDelayMs + introMaskDurationMs + 300;
  const introContentDelayMs = introMaskDelayMs + introMaskDurationMs;
  const introTotalMs = introContentDelayMs + 500;

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

  useEffect(() => {
    if (!isBootReady) return;
    if (activeSection === 'works') {
      setHasPlayedIntro(false);
      const timer = setTimeout(() => setHasPlayedIntro(true), introTotalMs);
      return () => clearTimeout(timer);
    }
    setHasPlayedIntro(true);
  }, [isBootReady, activeSection, introTotalMs]);

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

      {isBootReady && (
        <>
          <Header
            onSectionChange={handleSectionChange}
            isIntro={!hasPlayedIntro}
            introDelayMs={introHeaderDelayMs}
          />
          {schoolCopyData && (
            <div className="bg-gray-50 border-b border-gray-200 py-3 px-6 text-center">
              <p className="text-sm font-medium text-gray-800">{schoolCopyData.headline}</p>
              {schoolCopyData.subline && (
                <p className="text-xs text-gray-500 mt-0.5">{schoolCopyData.subline}</p>
              )}
            </div>
          )}
          {activeSection === 'works' && (
            <>
              <PortfolioLayout
                projects={projects}
                onProjectChange={handleProjectChange}
                isIntro={!hasPlayedIntro}
                introMaskDelayMs={introMaskDelayMs}
                introMaskDurationMs={introMaskDurationMs}
                introSidebarDelayMs={introSidebarDelayMs}
              />
              <GeneralInfoPanel
                activeProject={activeProject}
                isIntro={!hasPlayedIntro}
                introDelayMs={introInfoDelayMs}
              />
            </>
          )}
          {activeSection === 'about' && <AboutPage />}
          {activeSection === 'contact' && <ContactPage />}
        </>
      )}
    </div>
  );
}

export default App;
