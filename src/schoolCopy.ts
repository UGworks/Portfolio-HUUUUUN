/**
 * 학교별 메인 카피 (allgre.com/joongang, allgre.com/hongik 등)
 * path와 일치하는 키를 사용합니다.
 */
export type SchoolKey = 'joongang' | 'hongik';

export const schoolCopy: Record<SchoolKey, { headline: string; subline?: string }> = {
  joongang: {
    headline: '중앙대를 위한 포트폴리오',
    subline: '2D TD · 포스트프로덕션',
  },
  hongik: {
    headline: '홍익대를 위한 포트폴리오',
    subline: '2D TD · 포스트프로덕션',
  },
};

/** 비밀번호 페이지 문구 (대학별 커스터마이징) */
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
  joongang: {
    title: '중앙대 지원 포트폴리오',
    instruction: '중앙대 교수님, 비밀번호를 입력해 주세요.',
    placeholder: '비밀번호',
    buttonConfirm: '확인',
    buttonChecking: '확인 중...',
    errorMessage: '비밀번호가 올바르지 않습니다',
  },
  hongik: {
    title: '홍익대 지원 포트폴리오',
    instruction: '홍익대 교수님, 비밀번호를 입력해 주세요.',
    placeholder: '비밀번호',
    buttonConfirm: '확인',
    buttonChecking: '확인 중...',
    errorMessage: '비밀번호가 올바르지 않습니다',
  },
};

export const schoolKeys: SchoolKey[] = ['joongang', 'hongik'];

export function getSchoolCopy(school: string | undefined): { headline: string; subline?: string } | null {
  if (!school || !(school in schoolCopy)) return null;
  return schoolCopy[school as SchoolKey];
}

export function getPasswordPageCopy(school: string | undefined): PasswordPageCopy {
  if (!school || !(school in schoolPasswordCopy)) return defaultPasswordCopy;
  return schoolPasswordCopy[school as SchoolKey];
}
