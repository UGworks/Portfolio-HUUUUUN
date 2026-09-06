import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { trackVideoComplete, trackVideoProgress, trackVideoStart } from '../analytics';
import { ease, useMotionPrefs } from '../motion';

interface MainDisplayProps {
  project: Project | null;
  isVisible: boolean;
  isIntro?: boolean;
  isMobile?: boolean;
  chromeRevealed?: boolean;
  introMaskDelayMs?: number;
  introMaskDurationMs?: number;
  onVideoEnd?: () => void;
}

const MOBILE_INTRO_ZOOM_MS = 550;
/** 데스크톱: 스와이프 진행률 몇 %에서 영상을 시작할지 (0.5 = 절반 벗겨졌을 때) */
const DESKTOP_INTRO_PLAY_AT = 0.5;

const MainDisplay = ({
  project,
  isVisible,
  isIntro = false,
  isMobile = false,
  chromeRevealed = true,
  introMaskDelayMs = 0,
  introMaskDurationMs = 500,
  onVideoEnd,
}: MainDisplayProps) => {
  const prefs = useMotionPrefs();
  const videoRef = useRef<HTMLVideoElement>(null);
  /* 이미지 로드 여부는 '어느 프로젝트의 이미지가 로드됐는지'로 기억한다.
     effect로 false로 되돌리는 방식은 캐시된 이미지의 load 이벤트가 effect보다
     먼저 발생하면 영원히 투명해지는 경쟁이 있었다(가야테마파크가 간헐적으로 안 보이던 원인). */
  const [imageLoadedFor, setImageLoadedFor] = useState<string | null>(null);
  const imageLoaded = imageLoadedFor === project?.id;
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [shouldFade, setShouldFade] = useState(false);
  const prevProjectIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const progressRef = useRef<Set<number>>(new Set());
  const completedRef = useRef(false);
  const playbackReadyRef = useRef(!isIntro);
  const introMediaHidden = isIntro && !chromeRevealed;
  const [playbackReady, setPlaybackReady] = useState(!isIntro);

  playbackReadyRef.current = playbackReady;

  // 소개→포트폴리오: 데스크톱은 스와이프가 절반쯤 벗겨진 시점에 재생을 시작한다(끝까지 기다리면 홀드가 길다).
  // 모바일은 줌아웃과 겹치지 않도록 기존대로 끝난 뒤에.
  useEffect(() => {
    if (!isIntro) {
      setPlaybackReady(true);
      return;
    }
    if (introMediaHidden) {
      setPlaybackReady(false);
      return;
    }

    const holdMs = isMobile
      ? Math.max(introMaskDelayMs + introMaskDurationMs, MOBILE_INTRO_ZOOM_MS)
      : introMaskDelayMs + introMaskDurationMs * DESKTOP_INTRO_PLAY_AT;

    setPlaybackReady(false);
    const timer = window.setTimeout(() => setPlaybackReady(true), holdMs);
    return () => window.clearTimeout(timer);
  }, [
    isIntro,
    introMediaHidden,
    isMobile,
    introMaskDelayMs,
    introMaskDurationMs,
  ]);

  // 1) 프로젝트/표시 여부가 바뀔 때만 로드·처음 재생 (isIntro 변경 시에는 playbackReady effect가 처리)
  useEffect(() => {
    if (!videoRef.current || !project?.video || !isVisible) {
      if (videoRef.current && !isVisible) videoRef.current.pause();
      return;
    }
    const video = videoRef.current;
    const currentProject = project;
    const startAt = currentProject.videoStart ?? 0; // 인점
    prevProjectIdRef.current = project.id;
    startedRef.current = false;
    progressRef.current = new Set();
    completedRef.current = false;

    video.pause();
    video.currentTime = startAt;
    setVideoOpacity(1);
    setShouldFade(false);
    video.load();

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.5) {
        setShouldFade(true);
        const fadeProgress = (video.duration - video.currentTime) / 0.5;
        setVideoOpacity(Math.max(0, fadeProgress));
      }
      if (!video.duration || video.duration <= 0) return;
      const percent = (video.currentTime / video.duration) * 100;
      ([25, 50, 75] as const).forEach((mark) => {
        if (percent >= mark && !progressRef.current.has(mark)) {
          progressRef.current.add(mark);
          trackVideoProgress(currentProject, mark, video.currentTime);
        }
      });
    };

    const holdFirstFrame = () => {
      video.currentTime = startAt;
      video.pause();
    };

    const handleLoadedData = () => {
      if (!playbackReadyRef.current) holdFirstFrame();
    };

    const handleCanPlay = () => {
      if (!playbackReadyRef.current) holdFirstFrame();
    };

    const handlePlayGuard = () => {
      if (!playbackReadyRef.current) holdFirstFrame();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlayGuard);

    if (video.readyState >= 2 && !playbackReadyRef.current) {
      holdFirstFrame();
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlayGuard);
    };
  }, [project?.id, project?.video, isVisible]);

  // 스와이프·줌아웃 완료 후 재생 시작
  useEffect(() => {
    if (!playbackReady || !videoRef.current || !project?.video || !isVisible) return;

    const video = videoRef.current;
    const currentProject = project;
    const startAt = currentProject.videoStart ?? 0; // 인점

    video.currentTime = startAt;
    setVideoOpacity(1);
    video.play().catch(() => {});
    if (!startedRef.current) {
      startedRef.current = true;
      trackVideoStart(currentProject, video.duration || undefined);
    }
  }, [playbackReady, project?.id, project?.video, isVisible]);

  // 프로젝트가 변경될 때 상태 리셋
  useEffect(() => {
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
          className="main-display__frame w-full h-full flex items-center justify-center"
          initial={
            isIntro
              ? isMobile
                ? { scale: 1.08, opacity: 0 }
                : { scale: 1.3, opacity: 1 }
              : { opacity: 1 }
          }
          animate={{
            scale: introMediaHidden ? (isMobile ? 1.08 : 1.3) : 1,
            opacity: introMediaHidden && isMobile ? 0 : 1,
          }}
          transition={
            isIntro
              ? isMobile
                ? {
                    duration: prefs.d(introMediaHidden ? 0 : MOBILE_INTRO_ZOOM_MS / 1000),
                    ease: ease.wipe,
                    delay: introMediaHidden ? 0 : 0,
                  }
                : {
                    duration: prefs.d(introMaskDurationMs / 1000),
                    ease: ease.wipe,
                    delay: 0,
                  }
              : { duration: 0 }
          }
        >
          {project.video ? (
            <video
              ref={videoRef}
              src={project.video}
              className="main-display__media"
              preload="auto"
              style={{ 
                display: 'block',
                opacity: videoOpacity,
                transition: shouldFade ? 'opacity 0.3s ease-out' : 'none',
              }}
              muted
              playsInline
              onEnded={() => {
                if (!completedRef.current && project) {
                  completedRef.current = true;
                  trackVideoComplete(project);
                }
                if (onVideoEnd) {
                  setShouldFade(true);
                  setVideoOpacity(0);
                  setTimeout(() => onVideoEnd(), 300);
                }
              }}
            />
          ) : (
            <img
              key={project.id}
              ref={(el) => {
                // 캐시에서 온 이미지는 마운트 시점에 이미 로드가 끝나 load 이벤트가 오지 않을 수 있다
                if (el && el.complete && el.naturalWidth > 0) setImageLoadedFor(project.id);
              }}
              src={project.image}
              alt={project.title}
              className="main-display__media"
              style={{
                display: 'block',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out',
              }}
              onLoad={() => setImageLoadedFor(project.id)}
              onError={() => setImageLoadedFor(project.id)}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MainDisplay;

