/**
 * 경로별 메인 카피 (예: /soylab)
 * path와 일치하는 키를 사용합니다.
 */
export type SchoolKey = 'soylab' | 'joongang' | 'hongik';

export const schoolCopy: Record<SchoolKey, { headline: string; subline?: string }> = {
  soylab: {
    headline: 'SOYLAB X The Class · Track B 지원 포트폴리오',
    subline: 'AI 디렉터 퀀텀점프 · 현업 AI 파이프라인',
  },
  // 기존 경로 호환 (대학원 지원용 → Track B 메시지로 통일)
  joongang: {
    headline: 'SOYLAB X The Class · Track B 지원 포트폴리오',
    subline: 'AI 디렉터 퀀텀점프 · 현업 AI 파이프라인',
  },
  hongik: {
    headline: 'SOYLAB X The Class · Track B 지원 포트폴리오',
    subline: 'AI 디렉터 퀀텀점프 · 현업 AI 파이프라인',
  },
};

/** 비밀번호 페이지 문구 */
export interface PasswordPageCopy {
  title: string;
  instruction: string;
  placeholder: string;
  buttonConfirm: string;
  buttonChecking?: string;
  errorMessage: string;
}

const defaultPasswordCopy: PasswordPageCopy = {
  title: 'PORTFOLIO',
  instruction: '비밀번호를 입력하세요',
  placeholder: '비밀번호',
  buttonConfirm: '확인',
  buttonChecking: '확인 중...',
  errorMessage: '비밀번호가 올바르지 않습니다',
};

export const schoolPasswordCopy: Record<SchoolKey, PasswordPageCopy> = {
  soylab: {
    title: 'SOYLAB Track B 지원 포트폴리오',
    instruction: '심사용 비밀번호를 입력해 주세요.',
    placeholder: '비밀번호',
    buttonConfirm: '확인',
    buttonChecking: '확인 중...',
    errorMessage: '비밀번호가 올바르지 않습니다',
  },
  joongang: {
    title: 'SOYLAB Track B 지원 포트폴리오',
    instruction: '심사용 비밀번호를 입력해 주세요.',
    placeholder: '비밀번호',
    buttonConfirm: '확인',
    buttonChecking: '확인 중...',
    errorMessage: '비밀번호가 올바르지 않습니다',
  },
  hongik: {
    title: 'SOYLAB Track B 지원 포트폴리오',
    instruction: '심사용 비밀번호를 입력해 주세요.',
    placeholder: '비밀번호',
    buttonConfirm: '확인',
    buttonChecking: '확인 중...',
    errorMessage: '비밀번호가 올바르지 않습니다',
  },
};

export const schoolKeys: SchoolKey[] = ['soylab', 'joongang', 'hongik'];

export function getSchoolCopy(school: string | undefined): { headline: string; subline?: string } | null {
  if (!school || !(school in schoolCopy)) return null;
  return schoolCopy[school as SchoolKey];
}

export function getPasswordPageCopy(school: string | undefined): PasswordPageCopy {
  if (!school || !(school in schoolPasswordCopy)) return defaultPasswordCopy;
  return schoolPasswordCopy[school as SchoolKey];
}
