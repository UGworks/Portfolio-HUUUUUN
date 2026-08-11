import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';

interface MainDisplayProps {
  project: Project | null;
  isVisible: boolean;
  isIntro?: boolean;
  onVideoEnd?: () => void;
}

const MainDisplay = ({ project, isVisible, isIntro = false, onVideoEnd }: MainDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [shouldFade, setShouldFade] = useState(false);
  const prevProjectIdRef = useRef<string | null>(null);

  // 1) 프로젝트/표시 여부가 바뀔 때만 로드·처음 재생 (isWheeling/isIntro 변경 시에는 이 effect 안 탐)
  useEffect(() => {
    if (!videoRef.current || !project?.video || !isVisible) {
      if (videoRef.current && !isVisible) videoRef.current.pause();
      return;
    }
    const video = videoRef.current;
    prevProjectIdRef.current = project.id;

    video.pause();
    video.currentTime = 0;
    setVideoOpacity(1);
    setShouldFade(false);
    video.load();

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.5) {
        setShouldFade(true);
        const fadeProgress = (video.duration - video.currentTime) / 0.5;
        setVideoOpacity(Math.max(0, fadeProgress));
      }
    };

    const playFromStart = () => {
      video.currentTime = 0;
      setVideoOpacity(1);
      video.play().catch(() => {});
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', playFromStart, { once: true });
    video.addEventListener('canplaythrough', playFromStart, { once: true });

    if (video.readyState >= 2) playFromStart();

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', playFromStart);
      video.removeEventListener('canplaythrough', playFromStart);
    };
  }, [project?.id, project?.video, isVisible]);

  // 프로젝트가 변경될 때 상태 리셋
  useEffect(() => {
    if (project?.image) {
      setImageLoaded(false);
    }
    if (project?.video) {
      setVideoOpacity(1);
      setShouldFade(false); // 새 프로젝트 시작 시 페이드 비활성화
    }
  }, [project?.id]);

  if (!project) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center" style={{ overflow: 'hidden', padding: 0 }}>
      {isVisible && (
        <motion.div 
          key={project.id}
          className="w-full h-full flex items-center justify-center"
          initial={isIntro ? { scale: 1.3, opacity: 1 } : { opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={ 
            isIntro 
              ? { duration: 2, ease: 'easeOut', delay: 0 } 
              : { duration: 0 }
          }
        >
          {project.video ? (
            <video
              ref={videoRef}
              src={project.video}
              className="w-auto h-auto object-contain"
              style={{ 
                aspectRatio: 'auto',
                display: 'block',
                opacity: videoOpacity,
                transition: shouldFade ? 'opacity 0.3s ease-out' : 'none', // 페이드가 필요할 때만 transition 적용
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto'
              }}
              muted
              playsInline
              onEnded={() => {
                if (onVideoEnd) {
                  setShouldFade(true);
                  setVideoOpacity(0);
                  setTimeout(() => onVideoEnd(), 300);
                }
              }}
            />
          ) : (
            <img
              src={project.image}
              alt={project.title}
              className="w-auto h-auto object-contain"
              style={{ 
                aspectRatio: 'auto',
                display: 'block',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out',
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto'
              }}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MainDisplay;

