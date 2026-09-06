import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import ProjectSidebar from './ProjectSidebar';
import MainDisplay from './MainDisplay';
import { ProjectSelectMethod } from '../analytics';
import { ease, useMotionPrefs } from '../motion';

interface PortfolioLayoutProps {
  projects: Project[];
  onProjectChange?: (project: Project | null, method?: ProjectSelectMethod) => void;
  isIntro?: boolean;
  introMaskDelayMs?: number;
  introMaskDurationMs?: number;
  introSidebarDelayMs?: number;
  introSidebarDurationMs?: number;
  chromeRevealed?: boolean;
  isMobileLayout?: boolean;
}

const PortfolioLayout = ({
  projects,
  onProjectChange,
  isIntro = false,
  introMaskDelayMs = 0,
  introMaskDurationMs = 2000,
  introSidebarDelayMs = 0,
  introSidebarDurationMs = 520,
  chromeRevealed = true,
  isMobileLayout = false,
}: PortfolioLayoutProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = isMobileLayout;
  const prefs = useMotionPrefs();
  const containerRef = useRef<HTMLDivElement>(null);
  const mainDisplayRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const imageAutoTransitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoTransitioningRef = useRef(false);
  const onProjectChangeRef = useRef(onProjectChange);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const chromeRevealedRef = useRef(chromeRevealed);

  const syncScrollToIndex = (index: number) => {
    requestAnimationFrame(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const target = (index / projects.length) * maxScroll;
      window.scrollTo({ top: target, behavior: 'auto' });
    });
  };

  useEffect(() => {
    onProjectChangeRef.current = onProjectChange;
  }, [onProjectChange]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    chromeRevealedRef.current = chromeRevealed;
  }, [chromeRevealed]);

  /** 발표용 북마크 — Shift+숫자로 바로 간다. 값은 작품 id(순서를 바꿔도 같은 작품을 가리킨다).
      사이드바가 거리에 비례한 시간으로 스크롤하므로 멀수록 더 길게 '스르륵' 지나간다. */
  const BOOKMARKS: Record<string, string> = {
    Digit1: '1', // COWAY
    Digit2: '34', // LG 인스타그램 운영
    Digit3: '35-1', // Libratum Investment
    Digit4: '60', // 대한민국육군
  };

  /** 모든 작품 이동의 단일 창구 — 휠·키보드·스와이프·클릭·자동전환이 공유한다 */
  const goToIndex = useCallback(
    (index: number, method: ProjectSelectMethod) => {
      if (projects.length === 0) return;
      const next = ((index % projects.length) + projects.length) % projects.length;
      if (next === activeIndexRef.current) return;

      if (imageAutoTransitionRef.current) {
        clearTimeout(imageAutoTransitionRef.current);
        imageAutoTransitionRef.current = null;
        isAutoTransitioningRef.current = false;
      }

      activeIndexRef.current = next;
      setActiveIndex(next);
      onProjectChangeRef.current?.(projects[next], method);
      syncScrollToIndex(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects],
  );

  const stepBy = useCallback(
    (direction: 1 | -1, method: ProjectSelectMethod) => {
      goToIndex(activeIndexRef.current + direction, method);
    },
    [goToIndex],
  );

  useEffect(() => {
    if (projects.length === 0) return;

    if (imageAutoTransitionRef.current) {
      clearTimeout(imageAutoTransitionRef.current);
      imageAutoTransitionRef.current = null;
    }

    const currentProject = projects[activeIndex];
    const isImageOnly = currentProject && !currentProject.video && currentProject.image;

    if (isImageOnly && activeIndex < projects.length - 1 && !isAutoTransitioningRef.current) {
      isAutoTransitioningRef.current = true;

      imageAutoTransitionRef.current = setTimeout(() => {
        if (activeIndexRef.current === activeIndex) {
          const nextIndex = (activeIndex + 1) % projects.length;

          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);

          if (onProjectChangeRef.current) {
            onProjectChangeRef.current(projects[nextIndex], 'auto');
          }

          syncScrollToIndex(nextIndex);
          isAutoTransitioningRef.current = false;
        } else {
          isAutoTransitioningRef.current = false;
        }
        imageAutoTransitionRef.current = null;
      }, 1500);
    } else if (!isImageOnly) {
      isAutoTransitioningRef.current = false;
    }

    return () => {
      if (imageAutoTransitionRef.current) {
        clearTimeout(imageAutoTransitionRef.current);
        imageAutoTransitionRef.current = null;
      }
    };
  }, [activeIndex, projects.length]);

  // 휠 — 이벤트 하나당 작품 하나. 원본 동작이며, 마우스 휠로 빠르게 훑을 때
  // 감기는 느낌이 가장 좋다. (임계값·쿨다운을 걸면 초당 전환 수가 묶여 답답해진다)
  useEffect(() => {
    if (projects.length === 0) return;

    /** 정보 패널처럼 아직 스크롤 여지가 남은 영역 위에서는 네이티브 스크롤에 양보한다 */
    const scrollableUnderCursor = (target: EventTarget | null, deltaY: number) => {
      let node: Node | null = target instanceof Node ? target : null;
      while (node && node !== document.body) {
        if (node instanceof HTMLElement && node.dataset.scrollable !== undefined) {
          const room = node.scrollHeight - node.clientHeight;
          if (room > 1) {
            const atTop = node.scrollTop <= 0;
            const atBottom = node.scrollTop >= room - 1;
            if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
          }
        }
        node = node.parentNode;
      }
      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (scrollableUnderCursor(e.target, e.deltaY)) return;

      e.preventDefault();
      stepBy(e.deltaY > 0 ? 1 : -1, 'wheel');
    };

    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      document.removeEventListener('wheel', handleWheel, {
        capture: true,
      } as EventListenerOptions);
    };
  }, [projects.length, stepBy]);

  // 키보드 — 휠·스와이프 말고는 작품을 넘길 방법이 없었다.
  // 방향키/PageUp·Down/Home·End로 59개 작품을 전부 훑을 수 있게 한다.
  useEffect(() => {
    if (projects.length === 0) return;

    const handleKey = (e: KeyboardEvent) => {
      if (!chromeRevealedRef.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const el = document.activeElement;
      if (
        el instanceof HTMLElement &&
        (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))
      ) {
        return;
      }

      let target: number | null = null;

      // Shift+1~4: 북마크. 키 자판에 따라 e.key가 '!'·'@'로 바뀌므로 e.code로 본다
      if (e.shiftKey && e.code in BOOKMARKS) {
        const index = projects.findIndex((project) => project.id === BOOKMARKS[e.code]);
        if (index >= 0) {
          e.preventDefault();
          goToIndex(index, 'keyboard');
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageDown':
          target = activeIndexRef.current + 1;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp':
          target = activeIndexRef.current - 1;
          break;
        case 'Home':
          target = 0;
          break;
        case 'End':
          target = projects.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      goToIndex(target, 'keyboard');
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [projects.length, goToIndex]);

  const handleProjectClick = (index: number) => {
    goToIndex(index, 'click');
  };

  const handleVideoEnd = () => {
    stepBy(1, 'video_end');
  };

  useEffect(() => {
    if (!isMobile || !mainDisplayRef.current) return;

    const displayElement = mainDisplayRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if ((absDeltaY > 30 || absDeltaX > 30) && deltaTime < 300) {
        const primary = absDeltaY > absDeltaX ? deltaY : -deltaX;
        stepBy(primary > 0 ? 1 : -1, 'swipe');
      }

      touchStartRef.current = null;
    };

    displayElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    displayElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    displayElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      displayElement.removeEventListener('touchstart', handleTouchStart);
      displayElement.removeEventListener('touchmove', handleTouchMove);
      displayElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, stepBy]);

  useEffect(() => {
    if (projects.length > 0) {
      activeIndexRef.current = 0;
      setActiveIndex(0);
      isAutoTransitioningRef.current = false;
      if (imageAutoTransitionRef.current) {
        clearTimeout(imageAutoTransitionRef.current);
        imageAutoTransitionRef.current = null;
      }
      if (onProjectChange) {
        onProjectChange(projects[0], 'initial');
      }
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  const activeProject = projects[activeIndex];

  return (
    <div className="min-h-screen bg-white" ref={containerRef}>
      <ProjectSidebar
        projects={projects}
        activeIndex={activeIndex}
        onProjectClick={handleProjectClick}
        isIntro={isIntro}
        introDelayMs={introSidebarDelayMs}
        introDurationMs={introSidebarDurationMs}
        chromeRevealed={chromeRevealed}
        isMobile={isMobile}
      />

      <div className={`min-h-screen relative ${isMobile ? '' : 'md:ml-[var(--layout-sidebar-w)]'}`}>
        <motion.div
          ref={mainDisplayRef}
          className="fixed bg-black"
          initial={
            isIntro
              ? isMobile
                ? { x: '100%' }
                : { clipPath: 'inset(0 0 100% 0)' }
              : false
          }
          animate={
            isIntro
              ? isMobile
                ? { x: chromeRevealed ? 0 : '100%', clipPath: 'inset(0 0 0 0)' }
                : { clipPath: 'inset(0 0 0 0)', x: 0 }
              : { x: 0, clipPath: 'inset(0 0 0 0)' }
          }
          transition={
            isIntro
              ? {
                  duration: prefs.d(introMaskDurationMs / 1000),
                  ease: ease.wipe,
                  delay: prefs.delay(
                    isMobile && !chromeRevealed ? 0 : introMaskDelayMs / 1000,
                  ),
                }
              : { duration: 0 }
          }
          style={{
            left: isMobile ? 0 : 'var(--layout-sidebar-w)',
            right: isMobile ? 0 : 'var(--layout-info-w)',
            top: isMobile
              ? 'var(--layout-mobile-chrome-h)'
              : 'var(--layout-header-h)',
            height: isMobile
              ? 'var(--layout-mobile-media-h)'
              : 'calc(100vh - var(--layout-header-h))',
            width: isMobile ? '100vw' : 'auto',
            bottom: isMobile ? 'auto' : 0,
            zIndex: isMobile ? 10 : 20,
            overflow: 'hidden',
          }}
        >
          {/* mode="wait"를 쓰면 나가는 컷이 다 사라진 뒤에야 다음 컷이 들어와
              작품 사이마다 0.5초짜리 암전이 생겼다. 겹쳐서 크로스페이드한다. */}
          <AnimatePresence initial={false}>
            {activeProject && (
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefs.d(0.35), ease: ease.cut }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <MainDisplay
                  project={activeProject}
                  isVisible={true}
                  isIntro={isIntro}
                  isMobile={isMobile}
                  chromeRevealed={chromeRevealed}
                  introMaskDelayMs={introMaskDelayMs}
                  introMaskDurationMs={introMaskDurationMs}
                  onVideoEnd={handleVideoEnd}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 작품 인덱스 — 59개짜리 릴에서 지금 어디쯤인지가 유일하게 없던 단서 */}
          {activeProject && chromeRevealed && (
            <div className="absolute bottom-0 right-0 z-10 p-3 md:p-5 pointer-events-none">
              <p className="work-counter text-[11px] md:text-xs text-white/70">
                <span className="text-white">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className="mx-1 text-white/40">/</span>
                {String(projects.length).padStart(2, '0')}
              </p>
            </div>
          )}

          {/* 화면 낭독기용 — 작품이 바뀔 때마다 제목을 알린다 */}
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {activeProject
              ? `${activeIndex + 1}번째 작품, ${activeProject.title}, ${activeProject.category}`
              : ''}
          </p>
        </motion.div>

        <div className="bg-white" style={{ height: `${projects.length * 100}vh`, minHeight: '100vh' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              className="h-screen"
              style={{
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioLayout;
