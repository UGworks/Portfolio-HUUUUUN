import { motion } from 'framer-motion';
import { info } from '../data';
import seonghunImage from '../IMG/seonghun.jpg';

const ContactPage = () => {
  const phone = '010-3890-7954';
  const email = 'huuuuun.88@gmail.com';
  const portfolioUrl = info.socials?.website;
  const experience = [
    {
      company: '리브라텀 파트너스',
      role: '크리에이티브 디렉터',
      period: '2025.03 – 현재',
      items: [
        '글로벌 IR 콘텐츠의 시각 시스템 설계 및 통합 운영',
        '데이터·브랜드 내러티브를 영상 언어로 전환하는 제작 파이프라인 운영',
        '생성형 AI를 후반 공정에 연결하기 위한 실무 워크플로우 탐색',
      ],
    },
    {
      company: '오픈익스체인지',
      role: '아트 디렉터',
      period: '2023.09 – 2025.01',
      items: [
        '실시간 IR 스트리밍 환경에서 시각 디자인 시스템 운영',
        '발표자 중심 포맷의 한계 분석 및 제작 구조 개선',
        '글로벌 금융 이벤트 시각 커뮤니케이션 총괄',
      ],
    },
    {
      company: '미디어파사드 프로젝트',
      role: '미디어 아티스트',
      period: '2022 – 현재',
      items: [
        '아라온 테마파크 2025 / 다중 픽셀 피치 LED 패널 기반 공간 영상 시각 구조 최적화',
        '김해 가야테마파크 2024 / 입체 조형물 대상 프로젝션 매핑 콘텐츠 제작',
        '빛의 공간 2022·2023 / 대형 곡면 구조물 대상 관람 거리 기반 영상 설계 및 왜곡 보정',
      ],
    },
    {
      company: '콘센트릭스 카탈리스트',
      role: '모션 콘텐츠 팀 리더',
      period: '2020.02 – 2023.08',
      items: [
        '글로벌 IT/가전 기업의 USP 영상 및 B2C 콘텐츠 기획·제작',
        '디자인 팀 매니징 및 다국적 프로젝트 품질 일관성 유지',
        '69개국 글로벌 웹사이트 운영을 위한 webm/mp4/JSON 포맷 영상 소재 제작 총괄',
      ],
    },
    {
      company: '키스톤 플레이',
      role: '2D 테크니컬 디렉터',
      period: '2015.09 – 2019.11',
      items: [
        'TVCF·뮤직비디오·공익광고 등 광고 영상 후반의 2D 합성·이펙트 디렉팅',
        '클라이언트 요구 기반 촬영 현장 감독 및 포스트 파이프라인 설계',
        '상업 영상 납품 기준에 맞춘 품질·일정 관리',
      ],
    },
    {
      company: '포스트포엠',
      role: '선임 2D 아티스트',
      period: '2014.10 – 2015.09',
      items: [
        '대규모 미디어 캠페인용 고해상도 영상 소스 제작 및 브랜드 모션 그래픽 연출',
        '광고 영상 합성 작업의 품질 기준 수립 및 주니어 아티스트 업무 조율',
        '다양한 포맷의 납품 소재 관리 및 후반 제작 공정 효율화',
      ],
    },
    {
      company: '빅슨 스튜디오',
      role: '2D 아티스트',
      period: '2012.07 – 2014.10',
      items: [
        '매트 페인팅 및 이미지 합성을 통한 TV 광고 공간 연출 및 후반 작업',
        'After Effects·Photoshop 기반 키잉·리터칭·색보정 등 광고 후반 전 공정 참여',
        '복수 프로젝트 동시 진행 환경에서 납기 준수 및 수정 대응 체계 구축',
      ],
    },
  ];
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white pt-16"
    >
      <style>{`
        .contact-print-only {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          html,
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .contact-print-area,
          .contact-print-area * {
            visibility: visible;
          }

          .contact-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #1f2937;
          }

          .contact-no-print,
          .contact-screen-only {
            display: none !important;
          }

          .contact-print-only {
            display: block !important;
          }

          .contact-print-header {
            display: flex !important;
            align-items: flex-end !important;
            gap: 12mm !important;
            border-bottom: 2px solid #000 !important;
            padding-bottom: 8mm !important;
            margin-bottom: 8mm !important;
          }

          .contact-print-profile {
            width: 42mm !important;
            height: 56mm !important;
            flex: 0 0 42mm !important;
            overflow: hidden !important;
            border-radius: 2mm !important;
            background: #000 !important;
          }

          .contact-print-profile img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }

          .contact-print-block,
          .contact-print-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .contact-print-area a,
          .contact-print-area a:any-link,
          .contact-print-area a:link,
          .contact-print-area a:visited {
            color: #374151 !important;
            text-decoration: none !important;
            text-decoration-line: none !important;
            text-underline-offset: 0 !important;
            -webkit-text-decoration: none !important;
          }
        }
      `}</style>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* 왼쪽 빈 영역 (사이드바와 동일 너비) */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 hidden md:block" />

        {/* 오른쪽 고정 패널 (GeneralInfoPanel과 동일 위치·스타일) */}
        <div className="contact-no-print hidden md:block fixed top-16 right-0 w-96 h-[calc(100vh-4rem)] border-l border-gray-200 bg-white z-30 overflow-y-auto p-6 md:p-8" style={{ scrollbarWidth: 'none' }}>
          <h2 className="text-xl font-medium mb-6">Contact</h2>
          <div className="space-y-6 text-sm font-light leading-relaxed">
            <div>
              <p className="font-normal mb-2">전화</p>
              <a href={`tel:${phone.replace(/-/g, '')}`} className="text-gray-700 no-underline hover:opacity-70 transition-opacity">
                {phone}
              </a>
            </div>
            <div>
              <p className="font-normal mb-2">이메일</p>
              <a href={`mailto:${email}`} className="text-base no-underline hover:opacity-70 transition-opacity">
                {email}
              </a>
            </div>
            {(info.socials?.linkedin || portfolioUrl) && (
              <div className="flex gap-2 text-sm">
                {info.socials?.linkedin && (
                  <a href={info.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-700 no-underline hover:opacity-70 transition-opacity">
                    LinkedIn
                  </a>
                )}
                {info.socials?.linkedin && portfolioUrl && <span className="text-gray-400">|</span>}
                {portfolioUrl && (
                  <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 no-underline hover:opacity-70 transition-opacity">
                    TVCF-Site
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden md:mr-96" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="max-w-[850px] mx-auto px-5 py-10 md:px-10 md:py-10">
            <div className="contact-no-print mb-5 flex justify-end">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-800 transition-opacity hover:opacity-70"
              >
                이력서 PDF 저장
              </button>
            </div>

            <div className="contact-print-area bg-white">
              <header className="contact-print-only contact-print-header">
                <div className="contact-print-profile">
                  <img
                    src={seonghunImage}
                    alt="이성훈 프로필 사진"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">이성훈</h1>
                  <p className="text-base md:text-lg text-gray-600 mb-5">Creative Director / Media Artist</p>
                  <div className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-2 text-left text-sm md:text-[14.5px] leading-relaxed max-w-md">
                    <span className="font-semibold text-gray-900">전화</span>
                    <a href={`tel:${phone.replace(/-/g, '')}`} className="text-gray-700 no-underline">
                      {phone}
                    </a>
                    <span className="font-semibold text-gray-900">이메일</span>
                    <a href={`mailto:${email}`} className="text-gray-700 no-underline">
                      {email}
                    </a>
                    {portfolioUrl && (
                      <>
                        <span className="font-semibold text-gray-900">포트폴리오</span>
                        <a
                          href={portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 no-underline break-all"
                        >
                          {portfolioUrl}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </header>

              <div className="contact-screen-only mb-10 flex justify-center md:justify-start relative left-1/2 -translate-x-1/2 w-screen max-w-[100vw] md:left-0 md:translate-x-0 md:w-auto overflow-visible">
                <div className="w-[60%] max-w-[12rem] aspect-[3/4] md:w-48 md:h-60 rounded-none md:rounded overflow-hidden bg-black">
                  <img
                    src={seonghunImage}
                    alt="이성훈 프로필 사진"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* CV 본문 */}
              <div className="contact-cv text-gray-800 leading-relaxed">

                <header className="contact-screen-only border-b-2 border-black pb-5 mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">이성훈</h1>
                  <p className="text-base md:text-lg text-gray-600 mb-3">Creative Director / Media Artist</p>
                </header>

              {/* ── PROFESSIONAL PROFILE ── */}
              <section className="contact-print-block mb-8">
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wide">지원자 프로필</h2>
                <p className="text-[14.5px] text-gray-700 leading-[1.75]">
                  13년간 TVCF·브랜드 콘텐츠·미디어파사드·글로벌 IR 영상 현장에서 2D TD와 크리에이티브 디렉터로 일해 온 현업 크리에이터입니다.
                  현재 사모펀드(PEF) 운용사 리브라텀 파트너스에서 크리에이티브 디렉터로 재직하며, 광고·금융·공간 미디어를 아우르는 제작 파이프라인을 운영하고 있습니다.
                  기존 후반 제작 역량에 생성형 AI(이미지·영상·오디오)를 결합해, 현업에서 바로 쓰는 AI 디렉팅 파이프라인을 고도화하고자
                  SOYLAB X The Class Track B(AI 디렉터 퀀텀점프)에 지원합니다.
                </p>
              </section>

              {/* ── APPLICATION FOCUS ── */}
              <section className="contact-print-block mb-8">
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wide">지원 목표 · 실무 적용</h2>
                <ul className="list-disc pl-5 space-y-1 text-[14.5px] text-gray-700">
                  <li>광고·IR·공간 미디어 실무에 바로 붙는 AI 이미지·영상 제작 파이프라인 구축</li>
                  <li>Midjourney · Comfy Cloud · 시네마틱 영상 · FX를 연결한 디렉팅 워크플로우 정립</li>
                  <li>반복 공정을 줄이는 AI 기반 자동화로 제작 속도와 퀄리티 일관성 확보</li>
                  <li>브랜드·금융 커뮤니케이션에 맞는 스토리보드–생성–후반 통합 프로세스 설계</li>
                  <li>부트캠프 결과물을 현업 포트폴리오·실무 시연으로 바로 적용</li>
                </ul>
              </section>

              {/* ── EXPERIENCE ── */}
              <section className="mb-8">
                <h2 className="contact-print-block text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wide">경력</h2>
                {experience.map((job, i) => (
                  <div key={i} className="contact-print-item mb-6">
                    {/* 모바일: 회사/직책 → 다음 줄 기간. PC: 한 줄에 회사/직책(왼쪽) + 기간(오른쪽) */}
                    <div className="leading-tight mb-1 md:flex md:flex-wrap md:justify-between md:items-baseline md:gap-2">
                      <div className="font-semibold text-gray-900">{job.company} / {job.role}</div>
                      <span className="text-sm text-gray-600 font-normal mt-0.5 block md:mt-0 md:flex-shrink-0 md:whitespace-nowrap">{job.period}</span>
                    </div>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-[14.5px]">
                      {job.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              {/* ── CERTIFICATIONS & TECHNICAL SKILLS ── */}
              <section className="contact-print-block">
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wide">자격증 및 기술</h2>
                <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-3 text-[14.5px]">
                  <strong className="text-gray-900">자격증</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>컬러리스트기사 (2025)</li>
                    <li>컬러리스트산업기사 (2025)</li>
                    <li>멀티미디어콘텐츠제작전문가 (2025)</li>
                    <li>ICA DaVinci{'\u00A0'}Resolve 201 (2024)</li>
                  </ul>
                  <strong className="text-gray-900">영상 후반 작업</strong>
                  <span>After Effects, DaVinci{'\u00A0'}Resolve, Flame, Premiere{'\u00A0'}Pro</span>
                  <strong className="text-gray-900">3D·생성형 AI</strong>
                  <span>Blender, Midjourney, ComfyUI / Comfy Cloud, TouchDesigner</span>
                  <strong className="text-gray-900">라이브 스트리밍</strong>
                  <span>vMix, Tricaster, OBS를 통한 라이브 송출 경험</span>
                  <strong className="text-gray-900">AI 파이프라인</strong>
                  <span>이미지·영상 생성형 AI를 후반 제작과 연결한 실무 파이프라인 설계</span>
                  <strong className="text-gray-900">Vibe Coding</strong>
                  <span>Cursor, Claude Code를 통한 웹 및 다양한 HTML 디자인 포맷 제작</span>
                </div>
              </section>

              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage;
