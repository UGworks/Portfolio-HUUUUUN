import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { info } from '../data';
import { trackMenuClick } from '../analytics';
import { ease, useMotionPrefs } from '../motion';

interface HeaderProps {
  onSectionChange?: (section: 'works' | 'about' | 'contact') => void;
  onHomeClick?: () => void;
  isIntro?: boolean;
  introDelayMs?: number;
  introDurationMs?: number;
  chromeRevealed?: boolean;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onSectionChange,
  onHomeClick,
  isIntro = false,
  introDelayMs = 0,
  introDurationMs = 520,
  chromeRevealed = true,
  isMobile = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefs = useMotionPrefs();

  return (
    <motion.header
      initial={isIntro ? { y: '-100%' } : false}
      animate={{ y: chromeRevealed ? 0 : '-100%' }}
      transition={prefs.t(
        introDurationMs / 1000,
        ease.panel,
        chromeRevealed && isIntro ? introDelayMs / 1000 : 0,
      )}
      className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200"
      style={{ minHeight: 'var(--layout-header-h)' }}
    >
      <nav
        className="w-full mx-auto px-6 lg:px-8 flex items-center"
        style={{ minHeight: 'var(--layout-header-h)' }}
      >
        <div className="flex items-center justify-between relative w-full">
          <a
            href="#"
            className="font-normal tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
            style={{ letterSpacing: '0.3em', fontSize: 'var(--layout-brand)' }}
            onClick={(e) => {
              e.preventDefault();
              trackMenuClick(info.name, 'works');
              onHomeClick?.();
            }}
          >
            {info.name}
          </a>

          {/* PC: 영상 프레임(사이드바~정보패널) 중앙 정렬 */}
          {!isMobile && (
          <div
            className="flex items-center justify-center gap-10 absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: 'var(--layout-sidebar-w)',
              right: 'var(--layout-info-w)',
            }}
          >
            <a
              href="#works"
              className="pointer-events-auto hover:opacity-70 transition-opacity cursor-pointer"
              style={{ fontSize: 'var(--layout-nav)' }}
              onClick={(e) => {
                e.preventDefault();
                trackMenuClick('PORTFOLIO', 'works');
                onSectionChange?.('works');
              }}
            >
              PORTFOLIO
            </a>
            <a
              href="#contact"
              className="pointer-events-auto hover:opacity-70 transition-opacity cursor-pointer"
              style={{ fontSize: 'var(--layout-nav)' }}
              onClick={(e) => {
                e.preventDefault();
                trackMenuClick('CV', 'contact');
                onSectionChange?.('contact');
              }}
            >
              CV
            </a>
          </div>
          )}

          {isMobile && (
          <button
            type="button"
            className="relative w-8 h-8 flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMenuOpen}
            aria-controls="header-mobile-menu"
          >
            <span className="w-6 h-6 relative block" aria-hidden="true">
              <span className={`absolute top-1/2 left-0 w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`} />
              <span className={`absolute top-1/2 left-0 w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute top-1/2 left-0 w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`} />
            </span>
          </button>
          )}
        </div>

        {isMobile && isMenuOpen && (
          <motion.div
            id="header-mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefs.t(0.24, ease.cut)}
            className="absolute left-0 right-0 top-full mt-0 px-6 pb-4 space-y-4 bg-white border-b border-gray-200"
          >
            <a
              href="#works"
              className="block text-xs hover:opacity-70 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                trackMenuClick('PORTFOLIO', 'works');
                onSectionChange?.('works');
              }}
            >
              PORTFOLIO
            </a>
            <a
              href="#contact"
              className="block text-xs hover:opacity-70 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                trackMenuClick('CV', 'contact');
                onSectionChange?.('contact');
              }}
            >
              CV
            </a>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
