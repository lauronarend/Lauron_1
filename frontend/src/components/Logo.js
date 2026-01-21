import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const Logo = ({ size = 'normal', animated = false }) => {
  const { currentKit } = useTheme();
  
  const sizes = {
    small: { 
      containerClass: 'h-10',
      textClass: 'text-2xl',
      ballSize: 'h-8 w-8',
      spacing: 'gap-3'
    },
    normal: { 
      containerClass: 'h-16',
      textClass: 'text-4xl sm:text-5xl',
      ballSize: 'h-14 w-14',
      spacing: 'gap-4'
    },
    large: { 
      containerClass: 'h-24',
      textClass: 'text-6xl sm:text-7xl lg:text-8xl',
      ballSize: 'h-20 w-20 sm:h-24 sm:w-24',
      spacing: 'gap-6'
    }
  };
  
  const currentSize = sizes[size];
  
  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        type: 'spring',
        stiffness: 100
      }
    })
  };
  
  const ballVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.6,
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    },
    float: {
      y: [-5, 5, -5],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const Ball = ({ className }) => (
    <div className={`${className} rounded-full relative`}
      style={{
        background: 'radial-gradient(circle at 35% 35%, #ffffff, #f0f0f0)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Soccer ball pattern */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
        </defs>
        {/* Pentagon pattern */}
        <path d="M50 15 L35 30 L40 50 L60 50 L65 30 Z" fill="#000" filter="url(#shadow)"/>
        <path d="M30 35 L15 40 L20 58 L35 60 L40 45 Z" fill="#000" filter="url(#shadow)"/>
        <path d="M70 35 L85 40 L80 58 L65 60 L60 45 Z" fill="#000" filter="url(#shadow)"/>
        <path d="M35 65 L30 80 L50 88 L50 70 Z" fill="#000" filter="url(#shadow)"/>
        <path d="M65 65 L70 80 L50 88 L50 70 Z" fill="#000" filter="url(#shadow)"/>
      </svg>
    </div>
  );

  return (
    <div className={`relative inline-flex items-center ${currentSize.spacing}`} data-testid="olha-o-gol-logo">
      {animated ? (
        <>
          {/* Animated version */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className={`font-black ${currentSize.textClass} inline-block`}
            style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
              filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.4))'
            }}
          >
            OLHA
          </motion.div>

          <motion.div
            initial="hidden"
            animate={['visible', 'float']}
            variants={ballVariants}
            className="inline-block"
          >
            <Ball className={currentSize.ballSize} />
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className={`font-black ${currentSize.textClass} inline-block`}
            style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              background: 'linear-gradient(135deg, #00E676 0%, #00C853 50%, #00A344 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
              filter: 'drop-shadow(0 0 12px rgba(0, 230, 118, 0.4))'
            }}
          >
            GOL!
          </motion.div>
        </>
      ) : (
        <>
          {/* Static version */}
          <span
            className={`font-black ${currentSize.textClass} inline-block`}
            style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.4))'
            }}
          >
            OLHA
          </span>

          <Ball className={currentSize.ballSize} />

          <span
            className={`font-black ${currentSize.textClass} inline-block`}
            style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              background: 'linear-gradient(135deg, #00E676 0%, #00C853 50%, #00A344 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              filter: 'drop-shadow(0 0 12px rgba(0, 230, 118, 0.4))'
            }}
          >
            GOL!
          </span>
        </>
      )}
      
      {/* Field lines decoration */}
      {size !== 'small' && (
        <div className="absolute -bottom-3 left-0 right-0 h-1 rounded-full overflow-hidden opacity-60" style={{
          background: 'linear-gradient(90deg, transparent 0%, #2E7D32 10%, #66BB6A 50%, #2E7D32 90%, transparent 100%)'
        }} />
      )}
    </div>
  );
};

export default Logo;