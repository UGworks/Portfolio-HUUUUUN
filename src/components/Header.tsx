import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { info } from '../data';

interface HeaderProps {
  onSectionChange?: (section: 'works' | 'about' | 'contact' | 'studyPlan') => void;
  isIntro?: boolean;
  introDelayMs?: number;
}

const Header: React.FC<HeaderProps> = ({ onSectionChange, isIntro = false, introDelayMs = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut', delay: isIntro ? introDelayMs / 1000 : 0 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200"
    >
      <nav className="w-full mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between relative">
          <motion.a
            href="#"
            className="text-base font-normal tracking-widest cursor-pointer"
            whileHover={{ opacity: 0.7 }}
            style={{ letterSpacing: '0.3em' }}
            onClick={(e) => {
              e.preventDefault();
              onSectionChange?.('works');
            }}
          >
            {info.name}
          </motion.a>
          
          {/* PC: 컨텐츠 프레임 기준 센터 (left: 20rem, right: 24rem 영역의 중앙) */}
          <div 
            className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
            style={{
              marginLeft: '-2rem' // (24rem - 20rem) / 2 = 2rem 왼쪽으로 조정하여 컨텐츠 프레임 중앙 정렬
            }}
          >
            <a 
              href="#works" 
              className="text-xs hover:opacity-70 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                onSectionChange?.('works');
              }}
            >
              PORTFOLIO
            </a>
            <a 
              href="#contact" 
              className="text-xs hover:opacity-70 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                onSectionChange?.('contact');
              }}
            >
              CV
            </a>
            <a
              href="#study-plan"
              className="text-xs hover:opacity-70 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                onSectionChange?.('studyPlan');
              }}
            >
              STUDY PLAN
            </a>
          </div>

          <button
            className="md:hidden relative w-8 h-8 flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute top-1/2 left-0 w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`} />
              <span className={`absolute top-1/2 left-0 w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute top-1/2 left-0 w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`} />
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-4 space-y-4"
          >
            <a 
              href="#works" 
              className="block text-xs hover:opacity-70 transition-opacity cursor-pointer" 
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
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
                onSectionChange?.('contact');
              }}
            >
              CV
            </a>
            <a
              href="#study-plan"
              className="block text-xs hover:opacity-70 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                onSectionChange?.('studyPlan');
              }}
            >
              STUDY PLAN
            </a>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;

