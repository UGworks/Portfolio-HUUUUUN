export interface Project {
  id: string;
  title: string;
  category: string;
  image?: string;
  video?: string;
  thumbnail?: string; // 썸네일용 이미지 (비디오 프로젝트용)
  link?: string;
  description?: string;
  participation?: number; // 참여도 (0-100)
  keywords?: string[]; // 키워드 배열
}

export interface Info {
  name: string;
  title: string;
  description: string;
  location: string;
  email: string;
  clients: string[];
  superpower?: string;
  beyondCode?: string;
  education?: {
    school: string;
    degree: string;
    awards?: string[];
  };
  experience?: {
    period: string;
    role: string;
    company: string;
    description: string;
    link?: string;
  }[];
  tools?: string[];
  socials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

