import { motion } from 'framer-motion';

export default function AnimatedAnimeCharacter({ mouse = { x: 0, y: 0 }, hover = false }) {
  return (
    <motion.div
      className="hidden md:flex flex-col items-center justify-center h-full min-w-[280px]"
      initial={{ y: -30, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ pointerEvents: 'none' }}
    >
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="220" height="240" viewBox="0 0 220 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="100%" stopColor="#1F2937" />
            </linearGradient>
            <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
            <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(236,72,153,0.35)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.35)" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="224" rx="40" ry="8" fill="rgba(0,0,0,0.12)" />
          <motion.g
            style={{ transformOrigin: '110px 105px' }}
            animate={{
              translateX: mouse.x * 4,
              translateY: mouse.y * 3,
              rotate: mouse.x * 3,
            }}
            transition={{ type: 'spring', stiffness: 80, damping: 12 }}
          >
            <motion.rect
              x="60"
              y="60"
              width="100"
              height="90"
              rx="14"
              fill="url(#panel)"
              stroke="#374151"
              strokeWidth="2"
              animate={{ y: [0, 1.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.rect
              x="55"
              y="45"
              width="110"
              height="22"
              rx="6"
              fill="url(#accent)"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '110px 56px' }}
            />
            <rect x="65" y="48" width="15" height="4" rx="2" fill="#FFFFFF" opacity="0.9" />
            <rect x="82" y="48" width="15" height="4" rx="2" fill="#FFFFFF" opacity="0.75" />
            <rect x="99" y="48" width="15" height="4" rx="2" fill="#FFFFFF" opacity="0.6" />
            <rect x="116" y="48" width="15" height="4" rx="2" fill="#FFFFFF" opacity="0.45" />
            <rect x="133" y="48" width="15" height="4" rx="2" fill="#FFFFFF" opacity="0.3" />
            <motion.circle
              cx={92 + mouse.x * 1.8}
              cy={98 + mouse.y * 1.6}
              r="8"
              fill="#FFFFFF"
            />
            <motion.circle
              cx={128 + mouse.x * 1.8}
              cy={98 + mouse.y * 1.6}
              r="8"
              fill="#FFFFFF"
            />
            <motion.circle
              cx={92 + mouse.x * 2.8}
              cy={98 + mouse.y * 2.2}
              r="3.8"
              fill="#0EA5E9"
            />
            <motion.circle
              cx={128 + mouse.x * 2.8}
              cy={98 + mouse.y * 2.2}
              r="3.8"
              fill="#0EA5E9"
            />
            <motion.path
              d="M90 120 Q110 128 130 120"
              stroke="#F87171"
              strokeWidth="2.2"
              fill="none"
              animate={{ d: ['M90 120 Q110 128 130 120', 'M92 121 Q110 124 128 121', 'M88 119 Q110 132 132 119'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line
              x1="58"
              y1="110"
              x2="78"
              y2="100"
              stroke="url(#accent)"
              strokeWidth="6"
              strokeLinecap="round"
              animate={{ rotate: [0, hover ? 12 : 6, hover ? -8 : -4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '58px 110px' }}
            />
            <motion.line
              x1="162"
              y1="110"
              x2="142"
              y2="100"
              stroke="url(#accent)"
              strokeWidth="6"
              strokeLinecap="round"
              animate={{ rotate: [0, hover ? -12 : -6, hover ? 8 : 4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              style={{ transformOrigin: '162px 110px' }}
            />
            <motion.circle
              cx="96"
              cy="162"
              r="8"
              fill="#1E3A8A"
              animate={{ cy: [162, 160, 162] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="124"
              cy="162"
              r="8"
              fill="#1E3A8A"
              animate={{ cy: [162, 160, 162] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
            />
          </motion.g>
          <motion.circle
            cx="180"
            cy="70"
            r="8"
            fill="url(#glow)"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '180px 70px' }}
          />
          <motion.circle
            cx="40"
            cy="130"
            r="6"
            fill="url(#glow)"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '40px 130px' }}
          />
          <motion.circle
            cx="170"
            cy="170"
            r="5"
            fill="url(#glow)"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{ transformOrigin: '170px 170px' }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
