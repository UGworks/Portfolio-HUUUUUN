import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { CONTACT } from './ContactPage';

/**
 * 발표 엔딩 화면 — Shift+5로 어디서든 띄운다. Esc·Shift+5·클릭으로 닫는다.
 * 사이트의 문법 그대로: 흰 바탕, 검정 글자, 붉은 점 하나, 가는 선 하나.
 */
const EASE: Transition = { type: 'spring', bounce: 0, duration: 0.9 };

const EndingScreen = ({ onClose }: { onClose: () => void }) => {
  const reduced = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { ...EASE, delay },
  });

  return (
    <motion.div
      className="ending fixed inset-0 z-[100] bg-white text-[#101215] select-none cursor-default"
      role="dialog"
      aria-label="발표 마침"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
      onClick={onClose}
    >
      <style>{`
        .ending {
          --ink: #101215;
          --ink-2: #5b626a;
          --ink-3: #949aa1;
          --rule: #e2e6ea;
          --now: #e4372b;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
        }

        .ending-stage {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-rows: 1fr auto 1fr;
          padding-inline: clamp(2rem, 8vw, 9rem);
        }

        .ending-main {
          grid-row: 2;
          display: grid;
          row-gap: clamp(1.25rem, 2.6vh, 2rem);
        }

        .ending-kicker {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin: 0;
          font-size: clamp(0.85rem, 1.05vw, 1.15rem);
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--ink-3);
        }

        .ending-dot {
          inline-size: 7px;
          block-size: 7px;
          border-radius: 50%;
          background: var(--now);
          flex: none;
        }

        .ending-title {
          margin: 0;
          font-size: clamp(4.5rem, 11.5vw, 11rem);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.045em;
          color: var(--ink);
        }

        .ending-rule {
          block-size: 1px;
          background: var(--ink);
          transform-origin: 0 50%;
        }

        .ending-foot {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.75rem 2rem;
        }

        .ending-name {
          margin: 0;
          font-size: clamp(1.25rem, 1.9vw, 2rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--ink);
        }


        .ending-contact {
          margin: 0;
          display: flex;
          gap: 1.4rem;
          font-size: clamp(0.95rem, 1.15vw, 1.3rem);
          font-variant-numeric: tabular-nums;
          color: var(--ink-2);
        }

      `}</style>

      <div className="ending-stage">
        <div className="ending-main">
          <motion.p className="ending-kicker" {...rise(0.1)}>
            <i className="ending-dot" aria-hidden />
            중앙대학교 첨단영상대학원 · 예술공학 전공 석사과정
          </motion.p>

          <motion.h1 className="ending-title" {...rise(0.22)}>
            Thank you.
          </motion.h1>

          <motion.div
            className="ending-rule"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...EASE, duration: 1.1, delay: 0.5 }}
          />

          <motion.div className="ending-foot" {...rise(0.7)}>
            <p className="ending-name">
              이성훈
            </p>
            <p className="ending-contact">
              <span>{CONTACT.phone}</span>
              <span>{CONTACT.email}</span>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EndingScreen;
