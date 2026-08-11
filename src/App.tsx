import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/Header';
import PortfolioLayout from './components/PortfolioLayout';
import GeneralInfoPanel from './components/GeneralInfoPanel';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import { projects } from './data';
import { Project } from './types';
import { getSchoolCopy } from './schoolCopy';

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
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection>(getInitialSection);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  // 인증 후 오프닝 순서: 1) 콘텐츠 프레임 아래→위 마스킹 2) 썸네일 등장 3) 상세설명 등장 (PC·모바일 동일)
  const introHeaderDelayMs = 0;
  const introMaskDelayMs = 0;
  const introMaskDurationMs = 2000;
  const introSidebarDelayMs = 800;
  const introInfoDelayMs = introMaskDelayMs + introMaskDurationMs + 300;
  const introContentDelayMs = introMaskDelayMs + introMaskDurationMs;
  const introTotalMs = introContentDelayMs + 500;

  const handleSectionChange = (section: AppSection) => {
    setActiveSection(section);
    window.history.replaceState(null, '', `#${section}`);
  };

  // 섹션 전환 시 스크롤 맨 위로 (모바일에서 Contact 등 눌렀을 때 중간에서 시작하는 문제 방지)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  // 비밀번호 인증은 비활성화. Works 진입 시에만 인트로 실행
  useEffect(() => {
    if (activeSection === 'works') {
      setHasPlayedIntro(false);
      const timer = setTimeout(() => setHasPlayedIntro(true), introTotalMs);
      return () => clearTimeout(timer);
    } else {
      setHasPlayedIntro(true);
    }
  }, [activeSection, introTotalMs]);

  // 우클릭(컨텍스트 메뉴) 방지
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  // 소스 보기·개발자 도구 단축키 방지 (F12, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J)
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

  return (
    <div className="min-h-screen bg-white">
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
            onProjectChange={setActiveProject}
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
    </div>
  );
}

export default App;

