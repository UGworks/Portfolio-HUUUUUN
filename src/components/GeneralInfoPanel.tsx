import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { info } from '../data';
import { Project } from '../types';

interface GeneralInfoPanelProps {
  activeProject: Project | null;
  isIntro?: boolean;
  introDelayMs?: number;
}

const GeneralInfoPanel = ({
  activeProject,
  isIntro = false,
  introDelayMs = 0,
}: GeneralInfoPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 여부 확인
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 패널에서 휠 이벤트를 막아서 전체 페이지 휠 이벤트만 작동하도록
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handlePanelWheel = (e: WheelEvent) => {
      // 패널의 기본 스크롤 방지 - 전체 페이지 휠 이벤트가 처리하도록
      e.preventDefault();
      e.stopPropagation();
    };

    panel.addEventListener('wheel', handlePanelWheel, { passive: false, capture: true });

    return () => {
      panel.removeEventListener('wheel', handlePanelWheel, { capture: true } as EventListenerOptions);
    };
  }, []);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: isIntro ? introDelayMs / 1000 : 0 }}
      className={`fixed bg-white z-30 overflow-y-auto ${isMobile ? 'p-5' : 'p-6 md:p-8'}
                 ${isMobile 
                   ? 'left-0 right-0 w-full border-t border-gray-200' 
                   : 'md:top-16 md:left-auto md:right-0 md:w-96 md:border-l md:border-gray-200 md:h-[calc(100vh-4rem)]'
                 }`}
      style={{
        top: isMobile ? 'calc(4rem + 20px + 80px + 100vw)' : undefined, // 모바일: 헤더 + 썸네일 + 80px + 1:1 영상 영역 아래
        bottom: isMobile ? 0 : undefined,
        height: isMobile ? 'auto' : undefined,
        maxHeight: isMobile ? 'calc(100vh - 4rem - 20px - 80px - 100vw)' : undefined
      }}
    >
      <AnimatePresence mode="wait">
        {activeProject ? (
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className={`${isMobile ? 'text-2xl' : 'text-2xl'} font-bold ${isMobile ? 'mb-1' : 'mb-2'} leading-[1.15] tracking-tight`}>
              {activeProject.title}
            </h2>
            <p
              className={`${
                isMobile ? 'text-xs font-medium' : 'text-xs font-medium'
              } text-gray-500 uppercase tracking-wide ${isMobile ? 'mb-1.5' : 'mb-2.5'} leading-[1.25]`}
            >
              {activeProject.category}
            </p>
            
            {/* 소제목 (description의 첫 줄) */}
            {activeProject.description && (
              <p className={`${isMobile ? 'text-[15px]' : 'text-base'} text-gray-900 font-medium ${isMobile ? 'mb-2 leading-[1.3]' : 'mb-3 leading-[1.4]'}`}>
                {activeProject.description.split('\n\n')[0].trim()}
              </p>
            )}
            
            {/* 참여도 막대그래프 */}
            <div className={`${isMobile ? 'mb-2' : 'mb-3'}`}>
              <div className="flex-1 h-6 bg-gray-200 relative overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-black/50 rounded-full relative flex items-center"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(30, activeProject.participation ?? 85)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                >
                  <span className={`${isMobile ? 'text-xs' : 'text-[11px]'} text-white/50 font-semibold pl-2 leading-none whitespace-nowrap`}>
                    참여도 {activeProject.participation ?? 85}%
                  </span>
                </motion.div>
              </div>
            </div>
            
            {/* 키워드(태그라인) 라운드박스 - 모바일: iPhone 14 Pro Max/Plus 등에서 가독·행간 개선 */}
            {activeProject.keywords && activeProject.keywords.length > 0 && (
              <div className={`flex flex-wrap items-center ${isMobile ? 'gap-1 mb-2.5' : 'gap-2 mb-4'}`}>
                {activeProject.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className={`${isMobile ? 'px-2 py-0.5 text-[10px] leading-none' : 'px-3 py-1.5 text-xs leading-tight'} font-medium text-gray-700 bg-transparent border border-gray-300 rounded-full hover:bg-transparent transition-colors whitespace-nowrap`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            
            {/* PC: 전체 설명 표시 (소제목 제외, 두 번째 문단부터) */}
            {!isMobile && (
              <div className="space-y-3 text-sm font-normal leading-[1.5] text-gray-700">
                {activeProject.description ? (
                  activeProject.description.split('\n\n').slice(1).map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="text-gray-700 leading-[1.5]">
                        {paragraph.trim()}
                      </p>
                    )
                  ))
                ) : (
                  <>
                    <p className="text-gray-700 leading-[1.5]">
                      This project represents a comprehensive exploration of {activeProject.category.toLowerCase()}, combining innovative design principles with meticulous attention to detail. The work demonstrates a deep understanding of visual communication and user experience, creating a cohesive narrative that resonates with the target audience.
                    </p>
                    
                    <p className="text-gray-700 leading-[1.5]">
                      Through careful consideration of form, function, and aesthetic harmony, this project showcases the intersection of creative vision and technical excellence. Each element has been thoughtfully crafted to contribute to an overall experience that is both engaging and meaningful.
                    </p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="general"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-medium mb-6">소개</h2>
            
            <div className="space-y-6 text-sm font-light leading-relaxed">
              <p className="text-gray-700">
                {info.description}
              </p>
              
              {info.clients.length > 0 && (
                <div>
                  <p className="mb-4 font-normal">주요 클라이언트</p>
                  <ul className="list-none space-y-2">
                    {info.clients.map((client, index) => (
                      <li key={index} className="text-gray-700">
                        {client}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <p className="mb-2 font-normal">문의</p>
                <a
                  href={`mailto:${info.email}`}
                  className="text-base hover:opacity-70 transition-opacity"
                >
                  {info.email}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GeneralInfoPanel;

