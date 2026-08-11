import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { info } from '../data';

const AboutPage = () => {
  const [lineProgress, setLineProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current || !containerRef.current) return;

      const timelineTop = timelineRef.current.offsetTop;
      const timelineHeight = timelineRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // 타임라인 선 진행도 계산
      const timelineStart = timelineTop - windowHeight;
      const timelineEnd = timelineTop + timelineHeight;
      const scrollProgress = Math.max(0, Math.min(1, (scrollTop - timelineStart) / (timelineEnd - timelineStart)));
      setLineProgress(scrollProgress * 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white pt-16"
      ref={containerRef}
    >
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* 왼쪽 빈 영역 */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200"></div>
        
        {/* 오른쪽 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="max-w-5xl mx-auto p-8 lg:p-16 space-y-12">
        {/* About Me 헤더 */}
        <div>
          <h1 className="text-4xl font-bold mb-6 text-center">About Me</h1>
        </div>

        {/* 프로필 이미지와 소개 텍스트 2컬럼 */}
        <div className="flex gap-8 items-start">
          {/* 프로필 이미지 영역 - 나중에 이미지 추가 가능 */}
          <div className="w-64 h-80 bg-gray-200 rounded-lg flex-shrink-0"></div>
          
          {/* 텍스트 영역 */}
          <div className="flex-1 space-y-6">
            <p className="text-base font-light leading-relaxed text-gray-900" style={{ wordSpacing: '0.05em', letterSpacing: '0.01em' }}>
              {info.description}
            </p>

            {/* My Superpower */}
            {info.superpower && (
              <div>
                <h3 className="text-xl font-semibold mb-3">My Superpower</h3>
                <p className="text-base font-light leading-relaxed text-gray-900" style={{ wordSpacing: '0.05em', letterSpacing: '0.01em' }}>
                  {info.superpower}
                </p>
              </div>
            )}

            {/* Beyond Code */}
            {info.beyondCode && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Beyond Code</h3>
                <p className="text-base font-light leading-relaxed text-gray-900" style={{ wordSpacing: '0.05em', letterSpacing: '0.01em' }}>
                  {info.beyondCode}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Education & Recognition - 박스 스타일 */}
        {info.education && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Education & Recognition</h2>
            <p className="text-base font-light leading-relaxed text-gray-900 mb-4" style={{ wordSpacing: '0.05em', letterSpacing: '0.01em' }}>
              {info.education.school}에서 {info.education.degree}를 공부했습니다.
            </p>
            {info.education.awards && info.education.awards.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {info.education.awards.map((award, index) => (
                  <div 
                    key={index} 
                    className={`px-4 py-2 rounded-lg text-sm font-normal ${
                      index === 0 ? 'bg-orange-100 text-orange-900' : 'bg-purple-100 text-purple-900'
                    }`}
                  >
                    {award} →
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Where I've Been */}
        {info.experience && info.experience.length > 0 && (
          <div ref={timelineRef} className="relative py-12">
            <h2 className="text-2xl font-semibold mb-20 text-center">Where I've Been</h2>
            
            {/* 타임라인 선 - 중앙에 위치 */}
            <div className="absolute left-1/2 top-20 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-full bg-black"
                style={{
                  height: `${lineProgress}%`,
                  transition: 'height 0.1s ease-out'
                }}
              />
            </div>

            <div className="relative">
              {info.experience.map((exp, index) => {
                const isLeft = index % 2 === 0;
                const itemProgress = index / ((info.experience?.length ?? 1) - 1 || 1);
                const nodeProgress = itemProgress * 100;
                const shouldShowNode = lineProgress >= nodeProgress - 3;
                const shouldShowCard = lineProgress >= nodeProgress + 2;
                const itemTop = index * 320; // 항목 간 간격 증가
                const horizontalLineWidth = '6rem'; // 가로 연결선 길이
                const nodeSize = 12; // 노드 크기 (px)
                
                return (
                  <div
                    key={index}
                    className="relative"
                    style={{ 
                      paddingTop: `${itemTop}px`,
                      minHeight: '280px',
                      marginBottom: '160px'
                    }}
                  >
                    {/* 타임라인 노드 - 선 위 정확히 중앙, 흰색 테두리 제거 */}
                    <motion.div 
                      className="absolute bg-black z-20"
                      style={{
                        left: '50%',
                        top: `${itemTop + 140}px`, // paddingTop + minHeight/2
                        width: `${nodeSize}px`,
                        height: `${nodeSize}px`,
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        marginTop: 0
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: shouldShowNode ? 1 : 0,
                        scale: shouldShowNode ? 1 : 0,
                      }}
                      transition={{ 
                        duration: 0.4, 
                        ease: 'easeInOut'
                      }}
                    />
                    
                    {/* 가로 연결선 - 노드에서 카드로, 정확한 위치 계산 */}
                    <motion.div
                      className="absolute h-0.5 bg-black z-10"
                      style={{
                        width: horizontalLineWidth,
                        left: isLeft ? `calc(50% - ${horizontalLineWidth})` : '50%',
                        top: `${itemTop + 140}px`,
                        transform: 'translateY(-50%)'
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: shouldShowCard ? 1 : 0,
                        transformOrigin: isLeft ? 'right center' : 'left center'
                      }}
                      transition={{ 
                        duration: 0.4, 
                        ease: 'easeInOut',
                        delay: 0.1
                      }}
                    />
                    
                    {/* 카드 - 노드 다음에 좌우로 나타남 (지그재그), 가로 연결선과 정확히 연결 */}
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? -80 : 80, y: 20 }}
                      animate={{
                        opacity: shouldShowCard ? 1 : 0,
                        x: shouldShowCard ? 0 : (isLeft ? -80 : 80),
                        y: shouldShowCard ? 0 : 20
                      }}
                      transition={{ 
                        duration: 0.5, 
                        ease: 'easeInOut'
                      }}
                      className="absolute w-96 z-0"
                      style={{ 
                        top: `${itemTop + 140}px`,
                        transform: 'translateY(-50%)',
                        [isLeft ? 'right' : 'left']: `calc(50% + ${horizontalLineWidth})`
                      }}
                    >
                      <div className="bg-white border-2 border-black rounded-lg p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="inline-block px-3 py-1 bg-black text-white text-xs font-semibold rounded-full mb-2">
                              {exp.period}
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-black">
                              {exp.role}
                            </h3>
                            <div className="text-base font-normal text-gray-600 mb-3">
                              {exp.link ? (
                                <a href={exp.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 text-black">
                                  @{exp.company} ↗
                                </a>
                              ) : (
                                <span className="text-black">@{exp.company}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-base font-light leading-relaxed text-gray-900" style={{ wordSpacing: '0.05em', letterSpacing: '0.01em' }}>
                          {exp.description}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tools & Technologies */}
        {info.tools && info.tools.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Tools & Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {info.tools.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 text-sm font-normal text-gray-900 rounded-full"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Let's work together! */}
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Let's work together!</h2>
          <p className="text-base font-light mb-4">Get in touch</p>
          <a
            href={`mailto:${info.email}`}
            className="text-lg font-normal text-gray-900 hover:opacity-70 transition-opacity"
          >
            {info.email}
          </a>
        </div>

        {/* Socials */}
        {info.socials && (
          <div className="pt-6 border-t border-gray-200">
            <div className="flex gap-4">
              {info.socials.twitter && (
                <a
                  href={info.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-normal hover:opacity-70 transition-opacity"
                >
                  Twitter
                </a>
              )}
              {info.socials.github && (
                <a
                  href={info.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-normal hover:opacity-70 transition-opacity"
                >
                  Github
                </a>
              )}
              {info.socials.linkedin && (
                <a
                  href={info.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-normal hover:opacity-70 transition-opacity"
                >
                  Linkedin
                </a>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage;

