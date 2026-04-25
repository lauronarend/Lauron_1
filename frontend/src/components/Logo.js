import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 'normal', animated = false }) => {
  const sizes = {
    small:  { textClass: 'text-2xl',              ballSize: 32, spacing: 'gap-2' },
    normal: { textClass: 'text-4xl sm:text-5xl',  ballSize: 52, spacing: 'gap-3' },
    large:  { textClass: 'text-6xl sm:text-7xl',  ballSize: 80, spacing: 'gap-5' }
  };
  const { textClass, ballSize, spacing } = sizes[size];

  const wordIn = (i) => ({
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.15, type: 'spring', stiffness: 120 } }
  });

  const rollAnim = {
    hidden:  { x: -80, opacity: 0, rotate: -270 },
    visible: { x: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 110, damping: 12, delay: 0.25 } },
    roll:    { rotate: 360, transition: { duration: 1.6, repeat: Infinity, ease: 'linear' } }
  };

  const staticRoll = {
    roll: { rotate: 360, transition: { duration: 2.2, repeat: Infinity, ease: 'linear' } }
  };

  const golPulse = {
    hidden:  { opacity: 0, scale: 0.75 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.5, type: 'spring', stiffness: 200, damping: 10 } },
    pulse:   { scale: [1, 1.07, 1], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }
  };

  const Ball = ({ px }) => (
    <svg width={px} height={px} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="60%"  stopColor="#dddddd"/>
          <stop offset="100%" stopColor="#aaaaaa"/>
        </radialGradient>
        <radialGradient id="shine" cx="30%" cy="28%" r="38%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.9)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        <filter id="dropshadow">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.4"/>
        </filter>
        <clipPath id="clip"><circle cx="50" cy="50" r="46"/></clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#bg)" filter="url(#dropshadow)"/>
      <g clipPath="url(#clip)">
        <polygon points="50,4 37,17 42,32 58,32 63,17"         fill="#111" stroke="#333" strokeWidth="0.8"/>
        <polygon points="8,38 4,52 13,65 27,63 31,48 19,37"    fill="#111" stroke="#333" strokeWidth="0.8"/>
        <polygon points="92,38 81,37 69,48 73,63 87,65 96,52"  fill="#111" stroke="#333" strokeWidth="0.8"/>
        <polygon points="24,82 20,96 34,101 45,93 41,79"       fill="#111" stroke="#333" strokeWidth="0.8"/>
        <polygon points="76,82 59,79 55,93 66,101 80,96"       fill="#111" stroke="#333" strokeWidth="0.8"/>
        <polygon points="50,40 40,46 40,58 50,64 60,58 60,46"  fill="#111" stroke="#333" strokeWidth="0.8"/>
        <polygon points="50,32 42,32 37,40 42,48 50,48 58,40"  fill="#f5f5f5" stroke="#ccc" strokeWidth="0.6"/>
        <polygon points="31,48 19,47 14,58 21,66 31,63 37,56"  fill="#f5f5f5" stroke="#ccc" strokeWidth="0.6"/>
        <polygon points="69,48 63,56 69,63 79,66 86,58 81,47"  fill="#f5f5f5" stroke="#ccc" strokeWidth="0.6"/>
        <polygon points="41,64 31,63 23,73 28,83 42,85 47,76"  fill="#f5f5f5" stroke="#ccc" strokeWidth="0.6"/>
        <polygon points="59,64 53,76 58,85 72,83 77,73 69,63"  fill="#f5f5f5" stroke="#ccc" strokeWidth="0.6"/>
      </g>
      <circle cx="50" cy="50" r="46" fill="url(#shine)"/>
    </svg>
  );

  const olhaStyle = {
    fontFamily: '"Barlow Condensed", sans-serif',
    background: 'linear-gradient(135deg,#FFD700,#FFA500,#FF6B00)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
    filter: 'drop-shadow(0 0 10px rgba(255,165,0,0.5))'
  };
  const golStyle = {
    fontFamily: '"Barlow Condensed", sans-serif',
    background: 'linear-gradient(135deg,#00E676,#00C853,#007B33)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
    filter: 'drop-shadow(0 0 12px rgba(0,200,83,0.6))'
  };

  return (
    <div className={`relative inline-flex items-center ${spacing}`} data-testid="olha-o-gol-logo">
      {animated ? (
        <>
          <motion.div custom={0} initial="hidden" animate="visible"
            variants={wordIn(0)} className={`font-black ${textClass}`} style={olhaStyle}>
            OLHA
          </motion.div>

          <motion.div initial="hidden" animate={['visible','roll']} variants={rollAnim}
            style={{display:'inline-flex',alignItems:'center'}}>
            <Ball px={ballSize}/>
          </motion.div>

          <motion.div initial="hidden" animate={['visible','pulse']} variants={golPulse}
            className={`font-black ${textClass}`} style={golStyle}>
            GOL!
          </motion.div>

          {['⚽','✨','🔥'].map((e,i) => (
            <motion.span key={i}
              initial={{opacity:0,scale:0,y:0,x:0}}
              animate={{opacity:[0,1,0],scale:[0,1.3,0],y:[0,-28-i*10],x:[0,(i-1)*18]}}
              transition={{duration:1.1,delay:0.7+i*0.18,repeat:Infinity,repeatDelay:3.5}}
              style={{position:'absolute',right:-8,top:-8,fontSize:13,pointerEvents:'none'}}>
              {e}
            </motion.span>
          ))}
        </>
      ) : (
        <>
          <span className={`font-black ${textClass}`} style={olhaStyle}>OLHA</span>
          <motion.div animate="roll" variants={staticRoll}
            style={{display:'inline-flex',alignItems:'center'}}>
            <Ball px={ballSize}/>
          </motion.div>
          <span className={`font-black ${textClass}`} style={golStyle}>GOL!</span>
        </>
      )}

      {size !== 'small' && (
        <div className="absolute -bottom-3 left-0 right-0 h-1 rounded-full opacity-50"
          style={{background:'linear-gradient(90deg,transparent,#2E7D32 15%,#66BB6A 50%,#2E7D32 85%,transparent)'}}/>
      )}
    </div>
  );
};

export default Logo;
