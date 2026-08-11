import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import type { PasswordPageCopy } from '../schoolCopy';

/** 비밀번호별 노출: experienceCount=노출 개수, experienceStartIndex=건너뛸 처음 개수(해당 항목 숨김) */
const PASSWORD_CONFIG: { password: string; experienceCount?: number; experienceStartIndex?: number }[] = [
  { password: '0515', experienceCount: 7 }, // 전체
  { password: '1234', experienceCount: 4 }, // 상위 4개만
  { password: '0823', experienceStartIndex: 1 }, // 첫 번째(리브라텀 파트너스) 숨김, 나머지 6개 노출
];

const AUTH_STORAGE_KEY = 'portfolio_authenticated';
const EXPERIENCE_COUNT_KEY = 'portfolio_experience_count';
const EXPERIENCE_START_KEY = 'portfolio_experience_start';

const defaultCopy: PasswordPageCopy = {
  title: 'PORTFOLIO',
  instruction: '비밀번호를 입력하세요',
  placeholder: '비밀번호',
  buttonConfirm: '확인',
  buttonChecking: '확인 중...',
  errorMessage: '비밀번호가 올바르지 않습니다',
};

export interface PasswordProtectionProps {
  /** 인증 성공 시 호출. (노출 개수, 건너뛸 처음 개수) → 건너뛴 뒤 그만큼만 노출 */
  onAuthenticated: (experienceCount?: number, experienceStartIndex?: number) => void;
  projects?: Project[];
  passwordPageCopy?: PasswordPageCopy;
}

const PasswordProtection = ({ onAuthenticated, projects = [], passwordPageCopy }: PasswordProtectionProps) => {
  const copy = passwordPageCopy ?? defaultCopy;
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 비밀번호 화면에서 모든 프로젝트 소스(영상·썸네일·이미지) 프리로드
  useEffect(() => {
    if (projects.length === 0) return;
    projects.forEach((project) => {
      if (project.thumbnail) {
        const img = new Image();
        img.src = project.thumbnail;
      }
      if (project.image) {
        const img = new Image();
        img.src = project.image;
      }
      if (project.video) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.src = project.video;
        video.load();
      }
    });
  }, [projects]);

  // 로컬 스토리지에서 인증 상태 확인
  useEffect(() => {
    const isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY);
    if (isAuthenticated === 'true') {
      const count = localStorage.getItem(EXPERIENCE_COUNT_KEY);
      const start = localStorage.getItem(EXPERIENCE_START_KEY);
      const experienceCount = count != null ? parseInt(count, 10) : undefined;
      const experienceStartIndex = start != null ? parseInt(start, 10) : undefined;
      onAuthenticated(
        Number.isNaN(experienceCount) ? undefined : experienceCount,
        Number.isNaN(experienceStartIndex) ? undefined : experienceStartIndex
      );
    }
  }, [onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError(false);

    // 약간의 딜레이로 자연스러운 UX
    setTimeout(() => {
      const matched = PASSWORD_CONFIG.find((c) => c.password === password);
      if (matched) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        if (matched.experienceCount != null) {
          localStorage.setItem(EXPERIENCE_COUNT_KEY, String(matched.experienceCount));
        } else {
          localStorage.removeItem(EXPERIENCE_COUNT_KEY);
        }
        if (matched.experienceStartIndex != null) {
          localStorage.setItem(EXPERIENCE_START_KEY, String(matched.experienceStartIndex));
        } else {
          localStorage.removeItem(EXPERIENCE_START_KEY);
        }
        onAuthenticated(matched.experienceCount, matched.experienceStartIndex);
      } else {
        setError(true);
        setPassword('');
        setIsChecking(false);
      }
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm px-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-normal mb-2 tracking-widest" style={{ letterSpacing: '0.3em' }}>
            {copy.title}
          </h1>
          <p className="text-sm text-gray-500 font-light">{copy.instruction}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              onKeyPress={handleKeyPress}
              placeholder={copy.placeholder}
              className="w-full px-4 py-3 text-center text-lg border border-gray-300 focus:outline-none focus:border-black transition-colors"
              autoFocus
              disabled={isChecking}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-2 text-center"
              >
                {copy.errorMessage}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChecking || !password}
            className="w-full py-3 bg-black text-white text-sm font-normal hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (copy.buttonChecking ?? '확인 중...') : copy.buttonConfirm}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PasswordProtection;
