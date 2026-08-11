import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import ProjectSidebar from './ProjectSidebar';
import MainDisplay from './MainDisplay';

interface PortfolioLayoutProps {
  projects: Project[];
  onProjectChange?: (project: Project | null) => void;
  isIntro?: boolean;
  introMaskDelayMs?: number;
  introMaskDurationMs?: number;
  introSidebarDelayMs?: number;
}

const PortfolioLayout = ({
  projects,
  onProjectChange,
  isIntro = false,
  introMaskDelayMs = 0,
  introMaskDurationMs = 2000,
  introSidebarDelayMs = 0,
}: PortfolioLayoutProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainDisplayRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const imageAutoTransitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoTransitioningRef = useRef(false);
  const onProjectChangeRef = useRef(onProjectChange);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // 스크롤 위치 동기화: 레이아웃 반영 후 실행해 리로드/깜빡임 방지
  const syncScrollToIndex = (index: number) => {
    requestAnimationFrame(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const target = (index / projects.length) * maxScroll;
      window.scrollTo({ top: target, behavior: 'auto' });
    });
  };

  // 모바일 여부 확인
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // onProjectChange ref 업데이트
  useEffect(() => {
    onProjectChangeRef.current = onProjectChange;
  }, [onProjectChange]);

  // activeIndex가 변경될 때 ref 업데이트
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);


  // 이미지만 있는 프로젝트는 1.5초 후 자동으로 다음 프로젝트로 전환 (애니메이션 시간 고려)
  useEffect(() => {
    if (projects.length === 0) return;

    // 기존 타이머가 있으면 먼저 취소
    if (imageAutoTransitionRef.current) {
      clearTimeout(imageAutoTransitionRef.current);
      imageAutoTransitionRef.current = null;
    }

    const currentProject = projects[activeIndex];
    const isImageOnly = currentProject && !currentProject.video && currentProject.image;

    // 자동 전환은 isScrollingRef 체크를 건너뛰고, isAutoTransitioningRef만 체크
    if (isImageOnly && activeIndex < projects.length - 1 && !isAutoTransitioningRef.current) {
      isAutoTransitioningRef.current = true;
      
      imageAutoTransitionRef.current = setTimeout(() => {
        // 현재 인덱스가 변경되지 않았을 때만 전환
        if (activeIndexRef.current === activeIndex) {
          const nextIndex = (activeIndex + 1) % projects.length; // 순환
          
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
          
          if (onProjectChangeRef.current) {
            onProjectChangeRef.current(projects[nextIndex]);
          }
          
          syncScrollToIndex(nextIndex);
          
          // 자동 전환 플래그 해제
          isAutoTransitioningRef.current = false;
        } else {
          isAutoTransitioningRef.current = false;
        }
        imageAutoTransitionRef.current = null;
      }, 1500);
    } else if (!isImageOnly) {
      // 이미지가 아니면 플래그 해제
      isAutoTransitioningRef.current = false;
    }

    return () => {
      if (imageAutoTransitionRef.current) {
        clearTimeout(imageAutoTransitionRef.current);
        imageAutoTransitionRef.current = null;
      }
    };
  }, [activeIndex, projects.length]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      const currentIndex = activeIndexRef.current;
      const newIndex =
        delta > 0
          ? (currentIndex + 1) % projects.length
          : (currentIndex - 1 + projects.length) % projects.length;

      if (newIndex === currentIndex) return;

      activeIndexRef.current = newIndex;
      setActiveIndex(newIndex);
      if (onProjectChangeRef.current) {
        onProjectChangeRef.current(projects[newIndex]);
      }
      syncScrollToIndex(newIndex);
    };

    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => document.removeEventListener('wheel', handleWheel, { capture: true } as EventListenerOptions);
  }, [projects.length]);

  const handleProjectClick = (index: number) => {
    if (imageAutoTransitionRef.current) {
      clearTimeout(imageAutoTransitionRef.current);
      imageAutoTransitionRef.current = null;
      isAutoTransitioningRef.current = false;
    }
    // 즉시 전환
    activeIndexRef.current = index;
    setActiveIndex(index);
    if (onProjectChangeRef.current) {
      onProjectChangeRef.current(projects[index]);
    }
    syncScrollToIndex(index);
  };

  const handleVideoEnd = () => {
    if (projects.length > 0) {
      const nextIndex = (activeIndexRef.current + 1) % projects.length;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      if (onProjectChangeRef.current) {
        onProjectChangeRef.current(projects[nextIndex]);
      }
      syncScrollToIndex(nextIndex);
    }
  };

  // 모바일: 터치 스와이프 이벤트 처리
  useEffect(() => {
    if (!isMobile || !mainDisplayRef.current) return;

    const displayElement = mainDisplayRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 스와이프 중에는 기본 동작 방지
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

      // 스와이프 감지 (수직 또는 가로)
      if ((absDeltaY > 30 || absDeltaX > 30) && deltaTime < 300) {
        const currentIndex = activeIndexRef.current;
        let newIndex: number;

        // 수직 스와이프 우선 처리
        if (absDeltaY > absDeltaX) {
          if (deltaY > 0) {
            // 아래로 스와이프 - 다음 프로젝트 (순환)
            newIndex = (currentIndex + 1) % projects.length;
          } else {
            // 위로 스와이프 - 이전 프로젝트 (순환)
            newIndex = (currentIndex - 1 + projects.length) % projects.length;
          }
        } else {
          // 가로 스와이프 처리
          if (deltaX > 0) {
            // 오른쪽으로 스와이프 - 이전 프로젝트 (순환)
            newIndex = (currentIndex - 1 + projects.length) % projects.length;
          } else {
            // 왼쪽으로 스와이프 - 다음 프로젝트 (순환)
            newIndex = (currentIndex + 1) % projects.length;
          }
        }

        // 즉시 전환
        activeIndexRef.current = newIndex;
        setActiveIndex(newIndex);
        if (onProjectChangeRef.current) {
          onProjectChangeRef.current(projects[newIndex]);
        }

        syncScrollToIndex(newIndex);
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
  }, [projects.length, isMobile]);

  // 초기 프로젝트 설정 및 인덱스 초기화 (마운트 시 1회만, projects.length 변경 시에만 재실행)
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
        onProjectChange(projects[0]);
      }
      // 레이아웃 반영 후 스크롤 초기화 (리로드처럼 보이는 현상 방지)
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  return (
    <div className="min-h-screen bg-white" ref={containerRef}>
      {/* 모바일: 상단 썸네일 바, PC: 왼쪽 사이드바 */}
      <ProjectSidebar
        projects={projects}
        activeIndex={activeIndex}
        onProjectClick={handleProjectClick}
        isIntro={isIntro}
        introDelayMs={introSidebarDelayMs}
      />

      {/* 모바일: 메인 컨텐츠 영역, PC: 오른쪽 메인 영역 */}
      <div className="md:ml-80 min-h-screen relative">
        {/* 모바일: 썸네일 아래 1:1 비율 영상 영역, PC: 오른쪽 하단 메인 디스플레이 영역 (검은색 배경) */}
        {/* 콘텐츠 프레임: 인증 후 오프닝 시 아래에서 위로 올라오는 마스킹 (PC·모바일 동일) */}
        <motion.div
          ref={mainDisplayRef}
          className="fixed bg-black"
          initial={isIntro ? { clipPath: 'inset(0 0 100% 0)' } : false}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={
            isIntro
              ? { 
                  duration: introMaskDurationMs / 1000, 
                  ease: 'easeInOut', 
                  delay: introMaskDelayMs / 1000
                }
              : { duration: 0 }
          }
          style={{ 
            // PC: 원래 스타일
            left: isMobile ? 0 : '20rem', // 사이드바 너비 (80 = 20rem)
            right: isMobile ? 0 : '24rem', // 소개 패널 너비 (96 = 24rem)
            // 모바일: 썸네일 아래에서 시작하는 1:1 비율 프레임 (썸네일 영역 제외)
            // 헤더(4rem=64px) + 썸네일(h-20=20px) + 80px = 164px 아래에서 시작
            top: isMobile ? 'calc(4rem + 20px + 80px)' : '4rem', // 모바일: 헤더(64px) + 썸네일(20px) + 80px = 164px
            height: isMobile ? '100vw' : 'calc(100vh - 4rem)', // 모바일: 화면 너비와 동일한 높이 (1:1)
            width: isMobile ? '100vw' : 'auto', // 모바일: 전체 너비
            bottom: isMobile ? 'auto' : 0,
            zIndex: isMobile ? 10 : 20, // 모바일: 썸네일(z-30) 아래, PC: 기존 유지
            overflow: 'hidden',
            clipPath: 'inset(0 0 0 0)'
          }}
        >
          <AnimatePresence mode="wait">
            {projects[activeIndex] && (
              <motion.div
                key={projects[activeIndex].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <MainDisplay
                  project={projects[activeIndex]}
                  isVisible={true}
                  isIntro={isIntro}
                  onVideoEnd={handleVideoEnd}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 스크롤을 위한 더미 컨텐츠 - 각 프로젝트마다 화면 높이만큼 공간 확보 */}
        <div className="bg-white" style={{ height: `${projects.length * 100}vh`, minHeight: '100vh' }}>
          {/* 각 프로젝트마다 섹션 생성하여 스크롤 감지 */}
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

