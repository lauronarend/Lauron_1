import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const Logo = ({ size = 'normal', animated = false }) => {
  const { currentKit } = useTheme();
  
  const sizes = {
    small: { text: 'text-2xl', ball: 'h-6 w-6', container: 'h-12' },
    normal: { text: 'text-4xl sm:text-5xl', ball: 'h-12 w-12', container: 'h-20' },
    large: { text: 'text-5xl sm:text-6xl lg:text-7xl', ball: 'h-16 w-16 sm:h-20 sm:w-20', container: 'h-32' }
  };
  
  const currentSize = sizes[size];
  const primaryColor = currentKit?.primary || '#FFD700';
  
  const letterVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 10
      }
    })
  };
  
  const ballVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.5,
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    },
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 2
      }
    }
  };

  return (
    <div className="relative inline-block" data-testid="olha-o-gol-logo">
      {/* Main Logo Text */}
      <div className={`font-black ${currentSize.text} flex items-center gap-2`} style={{ 
        fontFamily: '"Barlow Condensed", sans-serif',
        letterSpacing: '-0.02em'
      }}>
        {animated ? (
          <>
            {['O', 'L', 'H', 'A'].map((letter, i) => (
              <motion.span
                key={`olha-${i}`}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={letterVariants}
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))'
                }}
              >
                {letter}
              </motion.span>
            ))}
            
            <motion.span
              custom={4}
              initial="hidden"
              animate="visible"
              variants={letterVariants}
              className="inline-block relative"
              style={{
                color: '#FF1744',
                textShadow: '0 0 20px rgba(255, 23, 68, 0.8), 2px 2px 4px rgba(0,0,0,0.3)',
                WebkitTextStroke: '2px white'
              }}
            >
              O
              {/* Ball in the O */}
              <motion.div
                initial="hidden"
                animate={['visible', 'bounce']}
                variants={ballVariants}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className={`${currentSize.ball} rounded-full bg-white flex items-center justify-center`}
                  style={{
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(0,0,0,0.2)',
                    background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)'
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="48" fill="white" stroke="#000" strokeWidth="2"/>
                    <path d="M50 10 L35 35 L15 35 L50 10 Z" fill="#000"/>
                    <path d="M50 10 L65 35 L85 35 L50 10 Z" fill="#000"/>
                    <path d="M15 35 L10 60 L30 70 L35 35 L15 35 Z" fill="#000"/>
                    <path d="M85 35 L90 60 L70 70 L65 35 L85 35 Z" fill="#000"/>
                  </svg>
                </div>
              </motion.div>
            </motion.span>
            
            {['G', 'O', 'L'].map((letter, i) => (
              <motion.span
                key={`gol-${i}`}
                custom={i + 5}
                initial="hidden"
                animate="visible"
                variants={letterVariants}
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #00C853 0%, #1B5E20 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  filter: 'drop-shadow(0 0 8px rgba(0, 200, 83, 0.5))'
                }}
              >
                {letter}
              </motion.span>
            ))}
          </>
        ) : (
          <>
            <span className="inline-block" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))'
            }}>
              OLHA
            </span>
            
            <span className="inline-block relative" style={{
              color: '#FF1744',
              textShadow: '0 0 20px rgba(255, 23, 68, 0.8)',
              WebkitTextStroke: '2px white'
            }}>
              O
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`${currentSize.ball} rounded-full bg-white`}
                  style={{
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)'
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="48" fill="white" stroke="#000" strokeWidth="2"/>
                    <path d="M50 10 L35 35 L15 35 L50 10 Z" fill="#000"/>
                    <path d="M50 10 L65 35 L85 35 L50 10 Z" fill="#000"/>
                    <path d="M15 35 L10 60 L30 70 L35 35 L15 35 Z" fill="#000"/>
                    <path d="M85 35 L90 60 L70 70 L65 35 L85 35 Z" fill="#000"/>
                  </svg>
                </div>
              </div>
            </span>
            
            <span className="inline-block" style={{
              background: 'linear-gradient(135deg, #00C853 0%, #1B5E20 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px rgba(0, 200, 83, 0.5))'
            }}>
              GOL
            </span>
          </>
        )}
      </div>
      
      {/* Grass decoration under logo */}
      {size !== 'small' && (
        <div className="mt-2 h-2 w-full rounded-full overflow-hidden" style={{
          background: 'repeating-linear-gradient(90deg, #2E7D32 0px, #2E7D32 4px, #66BB6A 4px, #66BB6A 8px)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
        }} />
      )}
    </div>
  );
};

export default Logo;