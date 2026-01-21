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
        background: 'radial-gradient(circle at 30% 30%, #ffffff, #e8e8e8)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset -3px -3px 8px rgba(0,0,0,0.15)'
      }}
    >
      {/* Classic soccer ball pattern - 12 black pentagons and 20 white hexagons */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="ballShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.8"/>
            <feOffset dx="0.5" dy="0.5" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Top pentagon */}
        <path 
          d="M50 8 L38 18 L42 32 L58 32 L62 18 Z" 
          fill="#000" 
          stroke="#1a1a1a" 
          strokeWidth="0.5"
          filter="url(#ballShadow)"
        />
        
        {/* Upper left hexagons */}
        <path 
          d="M25 22 L15 28 L15 40 L25 46 L35 40 L35 28 Z" 
          fill="#fff" 
          stroke="#d0d0d0" 
          strokeWidth="0.5"
        />
        
        {/* Upper right hexagons */}
        <path 
          d="M65 22 L65 28 L75 34 L85 28 L85 22 L75 16 Z" 
          fill="#fff" 
          stroke="#d0d0d0" 
          strokeWidth="0.5"
        />
        
        {/* Left pentagon */}
        <path 
          d="M20 50 L10 58 L15 72 L30 72 L35 58 Z" 
          fill="#000" 
          stroke="#1a1a1a" 
          strokeWidth="0.5"
          filter="url(#ballShadow)"
        />
        
        {/* Center hexagons */}
        <path 
          d="M40 45 L35 52 L40 60 L50 60 L55 52 L50 45 Z" 
          fill="#fff" 
          stroke="#d0d0d0" 
          strokeWidth="0.5"
        />
        
        {/* Right pentagon */}
        <path 
          d="M65 50 L70 58 L65 72 L80 72 L85 58 Z" 
          fill="#000" 
          stroke="#1a1a1a" 
          strokeWidth="0.5"
          filter="url(#ballShadow)"
        />
        
        {/* Bottom left hexagons */}
        <path 
          d="M25 70 L20 78 L25 86 L35 86 L40 78 L35 70 Z" 
          fill="#fff" 
          stroke="#d0d0d0" 
          strokeWidth="0.5"
        />
        
        {/* Bottom center pentagon */}
        <path 
          d="M45 78 L40 85 L50 92 L60 85 L55 78 Z" 
          fill="#000" 
          stroke="#1a1a1a" 
          strokeWidth="0.5"
          filter="url(#ballShadow)"
        />
        
        {/* Bottom right hexagons */}
        <path 
          d="M60 70 L55 78 L60 86 L70 86 L75 78 L70 70 Z" 
          fill="#fff" 
          stroke="#d0d0d0" 
          strokeWidth="0.5"
        />
        
        {/* Additional detail polygons for realism */}
        <path 
          d="M50 25 L42 32 L45 42 L55 42 L58 32 Z" 
          fill="#fff" 
          stroke="#d0d0d0" 
          strokeWidth="0.5"
        />
      </svg>
      
      {/* Highlight for 3D effect */}
      <div className="absolute top-[20%] left-[25%] w-[30%] h-[30%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
          filter: 'blur(4px)'
        }}
      />
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