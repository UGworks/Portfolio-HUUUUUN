import { Fragment } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { info } from '../data';
import { Project } from '../types';
import { ease, useMotionPrefs } from '../motion';
import { trackOutboundClick } from '../analytics';

interface GeneralInfoPanelProps {
  activeProject: Project | null;
  isIntro?: boolean;
  introDelayMs?: number;
  introDurationMs?: number;
  chromeRevealed?: boolean;
  isMobile?: boolean;
}

/* 텍스트 교체는 '페이드스루': 나가는 글은 제자리에서 빠르게 사라지고,
   들어오는 글은 그 직후 살짝 올라오며 나타난다. 두 글이 겹쳐 보이는 순간을 없앤다.
   입력은 막지 않는다 — 빠르게 넘기면 진행 중인 값에서 바로 다음으로 이어진다. */
const SWAP_OUT: Transition = { duration: 0.14, ease: 'easeOut' };
const SWAP_IN: Transition = { type: 'spring', bounce: 0, duration: 0.45, delay: 0.1 };
const METER_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.7, delay: 0.1 };
const SWAP_REDUCED: Transition = { duration: 0.2, ease: 'easeOut' };

const GeneralInfoPanel = ({
  activeProject,
  isIntro = false,
  introDelayMs = 0,
  introDurationMs = 480,
  chromeRevealed = true,
  isMobile = false,
}: GeneralInfoPanelProps) => {
  const prefs = useMotionPrefs();
  const introHidden = isIntro && !chromeRevealed;
  const swapIn = prefs.reduced ? SWAP_REDUCED : SWAP_IN;
  const swapOut = prefs.reduced ? SWAP_REDUCED : SWAP_OUT;

  // 참여도는 모든 작품에 표시한다.
  // data.ts에 값이 있는 작품은 그 값을, 나머지는 기본값 85를 쓴다.
  const participation = activeProject?.participation ?? 85;
  const [lead, ...paragraphs] = (activeProject?.description ?? '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <motion.div
      // data-scrollable: 이 패널 위에서 휠을 굴리면 작품을 넘기는 대신
      // 패널이 스크롤된다. 전역 휠 핸들러가 이 표시를 보고 양보한다.
      data-scrollable=""
      initial={
        isIntro
          ? isMobile
            ? { opacity: 0, y: 56 }
            : { opacity: 0, x: 48 }
          : false
      }
      animate={{
        opacity: introHidden ? 0 : 1,
        y: introHidden && isMobile ? 56 : 0,
        x: introHidden && !isMobile ? 48 : 0,
      }}
      transition={prefs.t(
        introDurationMs / 1000,
        ease.panel,
        isIntro && chromeRevealed ? introDelayMs / 1000 : 0,
      )}
      className={`gip fixed bg-white z-30 overflow-y-auto overscroll-contain ${
        isMobile ? 'gip--mobile left-0 right-0 w-full' : 'gip--desktop md:left-auto md:right-0'
      }`}
      style={
        isMobile
          ? {
              top: 'calc(var(--layout-mobile-chrome-h) + var(--layout-mobile-media-h))',
              bottom: 0,
              height: 'auto',
              maxHeight:
                'calc(100vh - var(--layout-mobile-chrome-h) - var(--layout-mobile-media-h))',
            }
          : {
              top: 'var(--layout-header-h)',
              width: 'var(--layout-info-w)',
              height: 'calc(100vh - var(--layout-header-h))',
            }
      }
    >
      <style>{`
        /* ============================================================
           작품 정보 패널 — 소개서(CV)와 같은 점·선·면 언어를 쓴다.
           점: 낱낱의 사실(키워드, 참여도 끝점)   선: 관계와 양(참여도, 구획)
           면: 본문이 비워 둔 여백.  위계는 색보다 굵기·크기·행간의 조합으로 세운다.
           ============================================================ */
        .gip {
          --ink: #101215;
          --ink-2: #5b626a;
          --ink-3: #949aa1;
          --rule: #e2e6ea;
          --now: #e4372b;
          --chart-line-2: #e5e6eb;
          --chart-line-3: #c9cdd4;

          --t-title: var(--layout-title);
          --t-lead: calc(var(--layout-body) + 0.125rem);
          --t-body: var(--layout-body);
          --t-meta: var(--layout-meta);

          /* 간격 시스템 — 소개서(CV)와 같은 이름의 토큰. 패널 폭에 맞춘 값 */
          --rail-w: 4.5rem;
          --col-gap: 1rem;
          --space-row: 0.7rem;
          --space-item: 0.5rem;
          --space-block: clamp(1rem, 1.6vw, 1.75rem);

          color: var(--ink);
          font-optical-sizing: auto;
          overscroll-behavior: contain;
        }

        .gip--desktop {
          padding: var(--layout-panel-pad);
          border-inline-start: 1px solid var(--rule);
        }

        .gip--mobile {
          --t-title: 1.5rem;
          --t-lead: 0.9375rem;
          --t-body: 0.875rem;
          --t-meta: 0.75rem;
          padding: 1.1rem 1.25rem 1.25rem;
          border-block-start: 1px solid var(--rule);
        }

        /* 스크롤 가장자리 — 본문이 위아래로 넘칠 때만 그 끝이 살짝 흐려진다.
           스크롤 여지가 없으면 타임라인이 비활성이라 아무 효과도 없다. */
        @property --gip-edge-top {
          syntax: '<length>';
          inherits: false;
          initial-value: 0px;
        }

        @property --gip-edge-bottom {
          syntax: '<length>';
          inherits: false;
          initial-value: 0px;
        }

        @supports (animation-timeline: scroll()) {
          .gip {
            mask-image: linear-gradient(
              to bottom,
              transparent,
              #000 var(--gip-edge-top),
              #000 calc(100% - var(--gip-edge-bottom)),
              transparent
            );
            animation: gip-scroll-edge linear both;
            animation-timeline: scroll(self block);
          }

          @keyframes gip-scroll-edge {
            0%   { --gip-edge-top: 0px;   --gip-edge-bottom: 2.5rem; }
            12%  { --gip-edge-top: 2rem;  --gip-edge-bottom: 2.5rem; }
            88%  { --gip-edge-top: 2rem;  --gip-edge-bottom: 2.5rem; }
            100% { --gip-edge-top: 2rem;  --gip-edge-bottom: 0px; }
          }
        }

        .gip-project,
        .gip-general {
          display: grid;
          row-gap: clamp(1rem, 1.6vw, 1.75rem);
        }

        .gip--mobile .gip-project { row-gap: 0.7rem; }

        /* ── 표제 ─────────────────────────────────────────────────── */
        .gip-head { display: grid; row-gap: 0.55rem; }

        .gip--mobile .gip-head { row-gap: 0.35rem; }

        /* 분류: 작은 글자는 자간을 살짝 벌린다 */
        .gip-kicker {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin: 0;
          font-size: var(--t-meta);
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--ink-3);
        }

        .gip-dot {
          flex: none;
          inline-size: 5px;
          block-size: 5px;
          border-radius: 50%;
          background: var(--now);
        }

        /* 제목: 커질수록 자간은 좁히고 행간은 조인다 */
        .gip-title {
          margin: 0;
          font-size: var(--t-title);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.025em;
          word-break: keep-all;
          overflow-wrap: break-word;
          text-wrap: balance;
        }

        /* 요약: 굵기로 힘을 주고 크기는 본문보다 한 단계만 */
        .gip-lead {
          margin: 0.15rem 0 0;
          font-size: var(--t-lead);
          font-weight: 500;
          line-height: 1.5;
          letter-spacing: -0.01em;
          color: var(--ink);
          word-break: keep-all;
          overflow-wrap: break-word;
          text-wrap: pretty;
        }

        /* ── 사양: 레일 레이블 + 값 ───────────────────────────────── */
        .gip-spec {
          display: grid;
          margin: 0;
          border-block-start: 1px solid var(--ink);
        }

        .gip-row {
          display: grid;
          grid-template-columns: var(--rail-w) minmax(0, 1fr);
          column-gap: var(--col-gap);
          align-items: baseline;
          padding-block: var(--space-row);
          border-block-end: 1px solid var(--rule);
        }

        .gip--mobile .gip-row {
          --rail-w: 3.5rem;
          --col-gap: 0.75rem;
          --space-row: 0.5rem;
        }

        .gip-label {
          margin: 0;
          font-size: var(--t-meta);
          font-weight: 400;
          letter-spacing: 0.06em;
          color: var(--ink-3);
          word-break: keep-all;
          overflow-wrap: break-word;
          text-wrap: balance;
        }

        .gip-row > dd { margin: 0; min-inline-size: 0; }

        /* 참여도: 선이 양이다 — 점선 눈금 위에 실선이 차오르고 끝에 점이 놓인다 */
        .gip-meter {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          column-gap: 0.9rem;
        }

        .gip-meter-track {
          position: relative;
          display: block;
          block-size: 0.85rem;
        }

        .gip-meter-track::before {
          content: '';
          position: absolute;
          inset-inline: 0;
          inset-block-start: 50%;
          block-size: 1px;
          translate: 0 -50%;
          background-image: repeating-linear-gradient(
            to right,
            var(--chart-line-2) 0 4px,
            transparent 4px 8px
          );
        }

        .gip-meter-fill {
          position: absolute;
          inset-inline-start: 0;
          inset-block-start: 50%;
          block-size: 2px;
          translate: 0 -50%;
          background: var(--ink);
        }

        .gip-meter-fill::after {
          content: '';
          position: absolute;
          inset-inline-end: -1px;
          inset-block-start: 50%;
          inline-size: 6px;
          block-size: 6px;
          border-radius: 50%;
          translate: 0 -50%;
          background: var(--ink);
        }

        .gip-num {
          font-size: var(--t-meta);
          font-variant-numeric: tabular-nums;
          font-feature-settings: 'tnum' 1;
          letter-spacing: 0.02em;
          color: var(--ink);
          white-space: nowrap;
        }

        /* 키워드: 알약이 아니라 점으로 이어진 낱말. 누르는 것처럼 보이지 않게 */
        .gip-tags {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          row-gap: 0.25rem;
          margin: 0;
          padding: 0;
          list-style: none;
          font-size: var(--t-meta);
          line-height: 1.6;
          color: var(--ink-2);
        }

        .gip-tag { white-space: nowrap; }

        /* 구분점은 글자의 세로 중심(x-height 가운데)에 놓는다 */
        .gip-sep {
          display: block;
          align-self: center;
          inline-size: 3px;
          block-size: 3px;
          margin-inline: 0.55rem;
          border-radius: 50%;
          background: var(--ink-3);
        }

        /* ── 본문 ─────────────────────────────────────────────────── */
        .gip-body {
          display: grid;
          row-gap: 0.9rem;
          font-size: var(--t-body);
          font-weight: 300;
          line-height: 1.85;
          letter-spacing: -0.005em;
          color: #2f343a;
        }

        .gip-body p {
          margin: 0;
          word-break: keep-all;
          overflow-wrap: break-word;
          text-wrap: pretty;
        }

        /* ── 소개(작품이 없을 때) ─────────────────────────────────── */
        .gip-general .gip-title { font-weight: 600; }

        .gip-list {
          margin: 0;
          padding: 0;
          list-style: none;
          font-size: var(--t-body);
          line-height: 1.7;
        }

        .gip-list li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #2f343a;
        }

        .gip-list li::before {
          content: '';
          flex: none;
          inline-size: 3px;
          block-size: 3px;
          border-radius: 50%;
          background: var(--ink-3);
        }

        .gip-link {
          color: var(--ink);
          text-decoration: none;
          transition: opacity 0.2s ease-out;
        }

        .gip-link:hover { opacity: 0.6; }
        .gip-link:active { opacity: 0.6; transition: none; }

        /* 링크 버튼: 선 하나로 된 알약. 호버에 먹이 차오른다 */
        .gip-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45em;
          padding: 0.38em 0.95em 0.42em;
          border: 1px solid var(--ink);
          border-radius: 999px;
          font-size: var(--t-meta);
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1;
          color: var(--ink);
          text-decoration: none;
          background: transparent;
          transition: background-color 0.2s ease-out, color 0.2s ease-out;
        }

        .gip-btn-arrow {
          font-size: 0.9em;
          translate: 0 -0.05em;
          transition: translate 0.2s ease-out;
        }

        .gip-btn:hover { background: var(--ink); color: var(--paper, #fff); }
        .gip-btn:hover .gip-btn-arrow { translate: 0.12em -0.17em; }
        .gip-btn:active { opacity: 0.8; transition: none; }

        @media (prefers-reduced-motion: reduce) {
          .gip-link,
          .gip-btn,
          .gip-btn-arrow { transition: none; }
        }
      `}</style>

      <AnimatePresence mode="popLayout" initial={false}>
        {activeProject ? (
          <motion.article
            key={activeProject.id}
            className="gip-project"
            initial={prefs.reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: swapIn }}
            exit={{ opacity: 0, transition: swapOut }}
          >
            <header className="gip-head">
              <p className="gip-kicker">
                <i className="gip-dot" aria-hidden />
                {activeProject.category}
              </p>
              <h2 className="gip-title">{activeProject.title}</h2>
              {lead && <p className="gip-lead">{lead}</p>}
            </header>

            <dl className="gip-spec">
              <div className="gip-row">
                <dt className="gip-label">참여도</dt>
                <dd className="gip-meter" role="img" aria-label={`참여도 ${participation}퍼센트`}>
                  <span className="gip-meter-track">
                    <motion.span
                      className="gip-meter-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${participation}%` }}
                      transition={prefs.reduced ? { duration: 0 } : METER_SPRING}
                    />
                  </span>
                  <span className="gip-num" aria-hidden>
                    {participation}%
                  </span>
                </dd>
              </div>

              {activeProject.keywords && activeProject.keywords.length > 0 && (
                <div className="gip-row">
                  <dt className="gip-label">키워드</dt>
                  <dd>
                    <ul className="gip-tags">
                      {activeProject.keywords.map((keyword, index) => (
                        <Fragment key={keyword}>
                          {index > 0 && <i className="gip-sep" aria-hidden />}
                          <li className="gip-tag">{keyword}</li>
                        </Fragment>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}

              {activeProject.link && (
                <div className="gip-row">
                  <dt className="gip-label">링크</dt>
                  <dd>
                    <a
                      href={activeProject.link}
                      className="gip-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOutboundClick(`project_${activeProject.id}`, activeProject.link!)}
                    >
                      {activeProject.linkLabel ?? '사이트 열기'}
                      <span className="gip-btn-arrow" aria-hidden>↗</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {/* PC: 전체 설명(요약을 뺀 두 번째 문단부터). 모바일은 요약만 */}
            {!isMobile && paragraphs.length > 0 && (
              <div className="gip-body">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </motion.article>
        ) : (
          <motion.section
            key="general"
            className="gip-general"
            initial={prefs.reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: swapIn }}
            exit={{ opacity: 0, transition: swapOut }}
          >
            <header className="gip-head">
              <p className="gip-kicker">
                <i className="gip-dot" aria-hidden />
                {info.title}
              </p>
              <h2 className="gip-title">소개</h2>
            </header>

            <div className="gip-body">
              <p>{info.description}</p>
            </div>

            {info.clients.length > 0 && (
              <dl className="gip-spec">
                <div className="gip-row">
                  <dt className="gip-label">클라이언트</dt>
                  <dd>
                    <ul className="gip-list">
                      {info.clients.map((client) => (
                        <li key={client}>{client}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="gip-row">
                  <dt className="gip-label">문의</dt>
                  <dd>
                    <a href={`mailto:${info.email}`} className="gip-link gip-num">
                      {info.email}
                    </a>
                  </dd>
                </div>
              </dl>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GeneralInfoPanel;
