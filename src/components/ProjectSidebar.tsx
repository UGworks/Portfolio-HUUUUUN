import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { dur, ease, easeInOutQuint, useMotionPrefs } from '../motion';

interface ProjectSidebarProps {
  projects: Project[];
  activeIndex: number;
  onProjectClick: (index: number) => void;
  isIntro?: boolean;
  introDelayMs?: number;
  introDurationMs?: number;
  chromeRevealed?: boolean;
  isMobile?: boolean;
}

type Axis = 'vertical' | 'horizontal';

const ProjectSidebar = ({
  projects,
  activeIndex,
  onProjectClick,
  isIntro = false,
  introDelayMs = 0,
  introDurationMs = 520,
  chromeRevealed = true,
  isMobile = false,
}: ProjectSidebarProps) => {
  const loopCount = 3;
  const prefs = useMotionPrefs();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mobileSidebarRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prevActiveIndexRef = useRef(activeIndex);
  const animationFrameRef = useRef<number | null>(null);
  const reducedRef = useRef(prefs.reduced);
  reducedRef.current = prefs.reduced;

  /**
   * 세로(PC)·가로(모바일) 스크롤을 하나로 합친 관성 스크롤.
   * 이전에는 축만 다른 같은 함수가 두 벌 있었다.
   */
  const smoothScroll = useCallback(
    (element: HTMLElement, axis: Axis, target: number, duration: number) => {
      const prop = axis === 'vertical' ? 'scrollTop' : 'scrollLeft';

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // 동작 줄이기: 관성 없이 바로 이동
      if (reducedRef.current) {
        element[prop] = target;
        return;
      }

      const start = element[prop];
      const distance = target - start;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        element[prop] = start + distance * easeInOutQuint(progress);
        animationFrameRef.current = progress < 1 ? requestAnimationFrame(animate) : null;
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [],
  );

  /**
   * 3중 루프 중 현재 스크롤 위치에서 가장 가까운 사본으로 중앙 정렬한다.
   * (루프를 건너뛰지 않아야 이동 거리가 최소가 된다)
   */
  const centerActiveItem = useCallback(
    (element: HTMLElement, item: HTMLElement, axis: Axis) => {
      const isVertical = axis === 'vertical';
      const listSize = (isVertical ? element.scrollHeight : element.scrollWidth) / loopCount;
      const itemSize = isVertical ? item.offsetHeight : item.offsetWidth;
      const viewSize = isVertical ? element.clientHeight : element.clientWidth;
      const current = isVertical ? element.scrollTop : element.scrollLeft;
      const itemOffset = isVertical ? item.offsetTop : item.offsetLeft;

      const centered = itemOffset - viewSize / 2 + itemSize / 2;
      const candidates = [centered - listSize, centered, centered + listSize];
      const target = candidates.reduce((best, candidate) =>
        Math.abs(current - candidate) < Math.abs(current - best) ? candidate : best,
      );

      const rawJump = Math.abs(activeIndex - prevActiveIndexRef.current);
      const jumpSize = Math.min(rawJump, projects.length - rawJump);
      smoothScroll(element, axis, target, 320 + jumpSize * 100);
      prevActiveIndexRef.current = activeIndex;
    },
    [activeIndex, projects.length, smoothScroll],
  );

  // PC: activeIndex가 바뀌면 해당 썸네일을 세로 중앙에 맞춘다
  useEffect(() => {
    if (isMobile || isIntro) return;
    const item = itemRefs.current[activeIndex];
    const sidebar = sidebarRef.current;
    if (!item || !sidebar) return;

    centerActiveItem(sidebar, item, 'vertical');

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeIndex, isIntro, isMobile, centerActiveItem]);

  // 모바일: 가로 중앙 정렬 (레이아웃이 잡힌 뒤 측정해야 해서 한 프레임 늦춘다)
  useEffect(() => {
    if (!isMobile || isIntro) return;
    const sidebar = mobileSidebarRef.current;
    if (!sidebar) return;

    const timeoutId = setTimeout(() => {
      const item = mobileItemRefs.current[activeIndex];
      if (item) centerActiveItem(sidebar, item, 'horizontal');
    }, 80);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeIndex, isIntro, isMobile, centerActiveItem]);

  /** 무한 루핑: 가운데 사본에서 시작하고 양 끝에 닿으면 한 리스트만큼 되돌린다 */
  useEffect(() => {
    const element = isMobile ? mobileSidebarRef.current : sidebarRef.current;
    if (!element || projects.length === 0) return;
    const prop = isMobile ? 'scrollLeft' : 'scrollTop';
    const sizeProp = isMobile ? 'scrollWidth' : 'scrollHeight';

    const setInitialPosition = () => {
      const listSize = element[sizeProp] / loopCount;
      if (listSize > 0) element[prop] = listSize;
    };

    const handleLoopScroll = () => {
      const listSize = element[sizeProp] / loopCount;
      if (listSize <= 0) return;
      if (element[prop] <= listSize * 0.25) element[prop] += listSize;
      else if (element[prop] >= listSize * 1.75) element[prop] -= listSize;
    };

    const rafId = requestAnimationFrame(setInitialPosition);
    element.addEventListener('scroll', handleLoopScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      element.removeEventListener('scroll', handleLoopScroll);
    };
  }, [projects.length, isMobile]);

  // PC: 무한 루핑을 위한 3번 반복, 모바일: 3번 반복 (가로 루핑)
  const loopedProjects = Array.from({ length: loopCount }, (_, loopIndex) =>
    projects.map((project, index) => ({ project, index, loopIndex }))
  ).flat();

  // 사이드바 자체 스크롤은 막고 전체 페이지 휠 핸들러가 작품 전환을 담당한다
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const mobileSidebar = mobileSidebarRef.current;

    const handleSidebarWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    if (sidebar) {
      sidebar.addEventListener('wheel', handleSidebarWheel, { passive: false, capture: true });
    }
    if (mobileSidebar) {
      mobileSidebar.addEventListener('wheel', handleSidebarWheel, { passive: false, capture: true });
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener('wheel', handleSidebarWheel, { capture: true } as EventListenerOptions);
      }
      if (mobileSidebar) {
        mobileSidebar.removeEventListener('wheel', handleSidebarWheel, { capture: true } as EventListenerOptions);
      }
    };
  }, []);

  const renderThumbnail = (project: Project, index: number, loopIndex: number, isMobile: boolean) => {
    const isActive = index === activeIndex && !isIntro;
    // 3중 루프라 같은 작품이 세 번 나온다. 가운데 사본만 실제 컨트롤로 노출하고
    // 나머지는 탭 순서·낭독 대상에서 뺀다. (그러지 않으면 탭 177번)
    const isCanonical = loopIndex === 1;
    const refs = isMobile ? mobileItemRefs : itemRefs;

    return (
      <motion.button
        key={`${project.id}-${loopIndex}-${index}`}
        type="button"
        ref={(el) => {
          if (isCanonical) refs.current[index] = el;
        }}
        onClick={() => onProjectClick(index)}
        tabIndex={isCanonical ? 0 : -1}
        aria-hidden={isCanonical ? undefined : true}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`${project.title} — ${project.category}`}
        title={project.title}
        className="cursor-pointer group flex items-center gap-3 flex-shrink-0 text-left bg-transparent border-0 p-0 appearance-none"
      >
        {/* 정방형 썸네일 — QHD에서 --layout-thumb으로 확대 */}
        <motion.span
          className="relative overflow-hidden bg-gray-100 flex-shrink-0 block"
          style={{
            width: isMobile ? 60 : 'var(--layout-thumb)',
            height: isMobile ? 60 : 'var(--layout-thumb)',
            boxShadow: isActive ? 'inset 0 0 20px rgba(0, 0, 0, 0.3)' : 'none'
          }}
          animate={{
            clipPath: isActive ? 'inset(8% 8% 8% 8%)' : 'inset(0% 0% 0% 0%)',
          }}
          transition={prefs.t(dur.base, ease.panel)}
        >
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : project.video ? (
            <video
              src={project.video}
              className="w-full h-full object-cover"
              muted
              playsInline
              onMouseEnter={(e) => {
                const video = e.currentTarget;
                video.currentTime = 0;
                video.play().catch(() => {});
              }}
              onMouseLeave={(e) => {
                const video = e.currentTarget;
                video.pause();
                video.currentTime = 0;
              }}
            />
          ) : (
            <img
              src={project.image}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </motion.span>
        {/* 프로젝트 정보 텍스트 - 선택된 썸네일에만 표시 (페이드 효과), 모바일에서는 숨김 */}
        {!isMobile && (
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.span
                key={`info-${activeIndex}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={prefs.t(0.3, ease.cut)}
                className="flex-1 min-w-0 pr-2 block"
              >
                <span
                  className="font-normal mb-0.5 leading-tight block"
                  style={{ fontSize: 'var(--layout-meta)' }}
                >
                  {project.title}
                </span>
                <span
                  className="text-gray-500 font-light leading-tight block"
                  style={{ fontSize: 'calc(var(--layout-meta) - 0.125rem)' }}
                >
                  {project.category}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        )}
      </motion.button>
    );
  };

  return (
    <>
      {!isMobile && (
      <motion.div
        ref={sidebarRef}
        initial={isIntro ? { x: '-100%' } : false}
        animate={{ x: 0 }}
        transition={prefs.t(
          introDurationMs / 1000,
          ease.panel,
          isIntro && chromeRevealed ? introDelayMs / 1000 : 0,
        )}
        className="fixed left-0 bottom-0 overflow-y-auto bg-white z-30 border-r border-gray-200"
        role="group"
        aria-label="작품 목록"
        style={{
          top: 'var(--layout-header-h)',
          width: 'var(--layout-sidebar-w)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div
          style={{
            padding: 'var(--layout-sidebar-pad)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--layout-sidebar-gap)',
          }}
        >
          {loopedProjects.map(({ project, index, loopIndex }) =>
            renderThumbnail(project, index, loopIndex, false)
          )}
        </div>
      </motion.div>
      )}

      {isMobile && (
      <motion.div
        ref={mobileSidebarRef}
        initial={isIntro ? { y: 'calc(-1 * var(--layout-mobile-chrome-h))' } : false}
        animate={{
          y: isIntro && !chromeRevealed ? 'calc(-1 * var(--layout-mobile-chrome-h))' : 0,
        }}
        transition={prefs.t(
          introDurationMs / 1000,
          ease.panel,
          isIntro && chromeRevealed ? introDelayMs / 1000 : 0,
        )}
        className="fixed left-0 right-0 h-20 overflow-x-auto overflow-y-hidden border-b border-gray-200 bg-white z-30 top-[var(--layout-header-h)]"
        role="group"
        aria-label="작품 목록"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="p-4 flex flex-row gap-4 h-full items-center">
          {loopedProjects.map(({ project, index, loopIndex }) =>
            renderThumbnail(project, index, loopIndex, true)
          )}
        </div>
      </motion.div>
      )}
    </>
  );
};

export default ProjectSidebar;
