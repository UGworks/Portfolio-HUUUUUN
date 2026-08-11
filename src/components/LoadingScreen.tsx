import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';

const PRELOAD_COUNT = 3;
const MIN_VISIBLE_MS = 700;
const MAX_WAIT_MS = 12000;

function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener('canplaythrough', done);
      video.removeEventListener('canplay', done);
      video.removeEventListener('error', done);
      resolve();
    };

    video.addEventListener('canplaythrough', done, { once: true });
    video.addEventListener('canplay', done, { once: true });
    video.addEventListener('error', done, { once: true });
    video.src = src;
    video.load();
  });
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

interface LoadingScreenProps {
  projects: Project[];
  /** 영상 버퍼 준비 → 본문 마운트 */
  onBuffered: () => void;
  /** 페이드아웃 종료 */
  onGone?: () => void;
}

const LoadingScreen = ({ projects, onBuffered, onGone }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();
    let contentReleased = false;

    const releaseContent = () => {
      if (contentReleased || cancelled) return;
      contentReleased = true;
      onBuffered();
    };

    const videoTargets = projects.filter((p) => p.video).slice(0, PRELOAD_COUNT);
    const thumbTargets = projects
      .slice(0, PRELOAD_COUNT)
      .map((p) => p.thumbnail || p.image)
      .filter((src): src is string => Boolean(src));

    const total = Math.max(1, videoTargets.length + Math.min(thumbTargets.length, 1));
    let loaded = 0;

    const bump = () => {
      loaded += 1;
      if (!cancelled) {
        setProgress(Math.min(100, Math.round((loaded / total) * 100)));
      }
    };

    const finish = async () => {
      releaseContent();
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));
      if (cancelled) return;
      setProgress(100);
      setVisible(false);
    };

    const run = async () => {
      const videoJobs = videoTargets.map((p) => preloadVideo(p.video!).then(bump));
      const imageJobs = thumbTargets.slice(0, 1).map((src) => preloadImage(src).then(bump));

      await Promise.race([
        Promise.all([...videoJobs, ...imageJobs]),
        new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS)),
      ]);

      await finish();
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [projects, onBuffered]);

  return (
    <AnimatePresence onExitComplete={onGone}>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-2 mb-8">
            <p
              className="text-sm text-black"
              style={{ letterSpacing: '0.35em' }}
            >
              Seonghun.Lee
            </p>
            <p
              className="text-[10px] text-gray-500 uppercase"
              style={{ letterSpacing: '0.28em' }}
            >
              Portfolio
            </p>
          </div>
          <div className="w-40 h-px bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full bg-black origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: Math.max(progress, 8) / 100 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
