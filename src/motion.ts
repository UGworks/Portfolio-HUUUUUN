import { useMemo } from 'react';
import { useReducedMotion, type Transition } from 'framer-motion';

/**
 * 모션 토큰 — 이 사이트의 서명(signature)입니다.
 *
 * 영상 편집실에서 쓰는 커브를 웹으로 옮겼습니다. framer-motion 기본값인
 * 'easeOut'은 어떤 사이트에나 붙는 값이라, 2D TD·포스트프로덕션 포트폴리오의
 * 성격을 담지 못합니다. 아래 네 개만 쓰고 그 외 이징은 쓰지 않습니다.
 */
type Bezier = [number, number, number, number];

export const ease = {
  /** 컷 전환 — 앞이 빠르고 뒤가 길게 안착. AE의 Easy Ease Out 계열 */
  cut: [0.16, 1, 0.3, 1] as Bezier,
  /** 크롬(헤더·사이드바·패널) 진입 — 양끝이 모두 부드러운 대칭 커브 */
  panel: [0.65, 0, 0.35, 1] as Bezier,
  /** 마스크·와이프 — 필름 와이프처럼 앞이 무겁고 뒤가 가볍게 빠짐 */
  wipe: [0.22, 1, 0.36, 1] as Bezier,
  /** 타이틀·인물 — 관성이 남는 진입 */
  title: [0.2, 0.8, 0.2, 1] as Bezier,
} as const;

/** 지속시간 스케일 (초) */
export const dur = {
  /** 상태 토글, 호버 */
  fast: 0.2,
  /** 텍스트 교체, 썸네일 반응 */
  base: 0.4,
  /** 패널·크롬 진입 */
  slow: 0.9,
  /** 인트로 시퀀스 1스텝 */
  intro: 1.5,
} as const;

/** ProjectSidebar의 직접 계산 스크롤에 쓰는 ease-in-out quint */
export const easeInOutQuint = (t: number): number =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

export interface MotionPrefs {
  /** 사용자가 OS에서 '동작 줄이기'를 켰는지 */
  reduced: boolean;
  /** 지속시간(초)을 환경에 맞게 접는다. reduced면 0 */
  d: (seconds: number) => number;
  /** 지연(초)을 환경에 맞게 접는다. reduced면 0 */
  delay: (seconds: number) => number;
  /** transition 객체를 만들어 준다. reduced면 즉시 적용 */
  t: (duration: number, easing?: Bezier, delaySeconds?: number) => Transition;
}

/**
 * 동작 줄이기(prefers-reduced-motion)를 존중하는 모션 헬퍼.
 *
 * 이 사이트는 인트로 그리드가 대각선으로 7초 가까이 순차 등장하고 영상이
 * 자동 전환됩니다. 전정 장애가 있는 사용자에게는 그대로 두면 안 되는 양이라
 * reduced가 켜지면 모든 지속시간·지연을 0으로 접어 '최종 상태'만 보여줍니다.
 */
export function useMotionPrefs(): MotionPrefs {
  const reduced = useReducedMotion() ?? false;

  return useMemo<MotionPrefs>(() => {
    const d = (seconds: number) => (reduced ? 0 : seconds);
    const delay = (seconds: number) => (reduced ? 0 : seconds);
    return {
      reduced,
      d,
      delay,
      t: (duration, easing = ease.panel, delaySeconds = 0) => ({
        duration: d(duration),
        ease: easing,
        delay: delay(delaySeconds),
      }),
    };
  }, [reduced]);
}
