import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedAnimeCharacter() {
    return (
        <motion.div
            className="hidden md:flex flex-col items-center justify-center h-full min-w-[280px]"
            initial={{ y: -30, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ pointerEvents: 'none' }}
        >
            {/* Floating particles */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-pink-300 rounded-full"
                        style={{
                            left: `${20 + i * 35}%`,
                            top: `${10 + (i % 3) * 30}%`,
                        }}
                        animate={{
                            y: [-10, -30, -10],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </motion.div>

            {/* Main character floating animation */}
            <motion.div
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, 2, 0, -2, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <svg width="200" height="240" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Character shadow */}
                    <ellipse cx="100" cy="220" rx="40" ry="8" fill="rgba(0,0,0,0.1)" />

                    {/* Hair back layer */}
                    <motion.path
                        d="M60 45 C50 25, 70 15, 100 20 C130 15, 150 25, 140 45 C145 55, 140 65, 130 70 L70 70 C60 65, 55 55, 60 45 Z"
                        fill="#8B4513"
                        animate={{
                            d: [
                                'M60 45 C50 25, 70 15, 100 20 C130 15, 150 25, 140 45 C145 55, 140 65, 130 70 L70 70 C60 65, 55 55, 60 45 Z',
                                'M58 43 C48 23, 72 17, 100 22 C128 17, 152 23, 142 43 C147 53, 142 63, 132 68 L68 68 C58 63, 53 53, 58 43 Z',
                                'M60 45 C50 25, 70 15, 100 20 C130 15, 150 25, 140 45 C145 55, 140 65, 130 70 L70 70 C60 65, 55 55, 60 45 Z',
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Head */}
                    <motion.circle
                        cx="100"
                        cy="55"
                        r="35"
                        fill="#FDB5A6"
                        animate={{
                            r: [35, 36, 35],
                            cy: [55, 54, 55],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Hair front layer with movement */}
                    <motion.path
                        d="M65 35 C70 25, 85 30, 100 28 C115 30, 130 25, 135 35 C140 40, 135 45, 130 50 L70 50 C65 45, 60 40, 65 35 Z"
                        fill="#A0522D"
                        animate={{
                            d: [
                                'M65 35 C70 25, 85 30, 100 28 C115 30, 130 25, 135 35 C140 40, 135 45, 130 50 L70 50 C65 45, 60 40, 65 35 Z',
                                'M63 33 C68 23, 87 32, 100 30 C113 32, 132 23, 137 33 C138 38, 137 43, 132 48 L68 48 C63 43, 58 38, 63 33 Z',
                                'M65 35 C70 25, 85 30, 100 28 C115 30, 130 25, 135 35 C140 40, 135 45, 130 50 L70 50 C65 45, 60 40, 65 35 Z',
                            ],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Ahoge (hair strand) with bouncy animation */}
                    <motion.path
                        d="M100 25 Q102 15 105 10 Q107 8 105 12 Q103 20 100 25"
                        fill="#A0522D"
                        animate={{
                            d: [
                                'M100 25 Q102 15 105 10 Q107 8 105 12 Q103 20 100 25',
                                'M100 25 Q108 12 112 8 Q115 6 112 10 Q105 18 100 25',
                                'M100 25 Q95 12 92 8 Q90 6 92 10 Q97 18 100 25',
                                'M100 25 Q102 15 105 10 Q107 8 105 12 Q103 20 100 25',
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Eyes with enhanced blinking */}
                    <motion.g>
                        <ellipse cx="88" cy="50" rx="8" ry="10" fill="#FFFFFF" />
                        <ellipse cx="112" cy="50" rx="8" ry="10" fill="#FFFFFF" />
                        {/* Pupils with sparkle effect */}
                        <motion.g
                            animate={{
                                scaleY: [1, 0.1, 1],
                                scaleX: [1, 0.9, 1],
                            }}
                            transition={{
                                duration: 0.15,
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: 'easeInOut',
                            }}
                            style={{ transformOrigin: '88px 50px' }}
                        >
                            <circle cx="88" cy="50" r="4" fill="#4A90E2" />
                            <circle cx="86" cy="48" r="1.5" fill="#FFFFFF" />
                        </motion.g>
                        <motion.g
                            animate={{
                                scaleY: [1, 0.1, 1],
                                scaleX: [1, 0.9, 1],
                            }}
                            transition={{
                                duration: 0.15,
                                repeat: Infinity,
                                repeatDelay: 3,
                                delay: 0.1,
                                ease: 'easeInOut',
                            }}
                            style={{ transformOrigin: '112px 50px' }}
                        >
                            <circle cx="112" cy="50" r="4" fill="#4A90E2" />
                            <circle cx="110" cy="48" r="1.5" fill="#FFFFFF" />
                        </motion.g>
                    </motion.g>

                    {/* Eyebrows with expression */}
                    <motion.path
                        d="M82 42 Q88 40 94 42"
                        stroke="#8B4513"
                        strokeWidth="2"
                        fill="none"
                        animate={{
                            d: ['M82 42 Q88 40 94 42', 'M82 41 Q88 39 94 41', 'M82 42 Q88 40 94 42'],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.path
                        d="M106 42 Q112 40 118 42"
                        stroke="#8B4513"
                        strokeWidth="2"
                        fill="none"
                        animate={{
                            d: ['M106 42 Q112 40 118 42', 'M106 41 Q112 39 118 41', 'M106 42 Q112 40 118 42'],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Nose */}
                    <circle cx="100" cy="58" r="1" fill="#F4A896" />

                    {/* Mouth with expression changes */}
                    <motion.path
                        d="M95 65 Q100 70 105 65"
                        stroke="#FF6B8A"
                        strokeWidth="2"
                        fill="none"
                        animate={{
                            d: [
                                'M95 65 Q100 70 105 65',
                                'M96 66 Q100 68 104 66',
                                'M94 64 Q100 72 106 64',
                                'M95 65 Q100 70 105 65',
                            ],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Blush */}
                    <motion.ellipse
                        cx="75"
                        cy="58"
                        rx="4"
                        ry="3"
                        fill="#FFB6C1"
                        animate={{
                            opacity: [0.3, 0.7, 0.3],
                            rx: [4, 5, 4],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.ellipse
                        cx="125"
                        cy="58"
                        rx="4"
                        ry="3"
                        fill="#FFB6C1"
                        animate={{
                            opacity: [0.3, 0.7, 0.3],
                            rx: [4, 5, 4],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Body */}
                    <motion.rect
                        x="75"
                        y="85"
                        width="50"
                        height="60"
                        rx="25"
                        fill="#FF69B4"
                        animate={{
                            width: [50, 52, 50],
                            height: [60, 58, 60],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Arms with waving motion */}
                    <motion.ellipse
                        cx="55"
                        cy="105"
                        rx="8"
                        ry="20"
                        fill="#FDB5A6"
                        animate={{
                            rotate: [0, 15, -10, 0],
                            x: [0, 3, -2, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        style={{ transformOrigin: '55px 90px' }}
                    />
                    <motion.ellipse
                        cx="145"
                        cy="105"
                        rx="8"
                        ry="20"
                        fill="#FDB5A6"
                        animate={{
                            rotate: [0, -15, 10, 0],
                            x: [0, -3, 2, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.5,
                        }}
                        style={{ transformOrigin: '145px 90px' }}
                    />

                    {/* Legs */}
                    <motion.ellipse
                        cx="88"
                        cy="165"
                        rx="8"
                        ry="25"
                        fill="#4169E1"
                        animate={{
                            ry: [25, 27, 25],
                            cy: [165, 163, 165],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.ellipse
                        cx="112"
                        cy="165"
                        rx="8"
                        ry="25"
                        fill="#4169E1"
                        animate={{
                            ry: [25, 27, 25],
                            cy: [165, 163, 165],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    />

                    {/* Feet */}
                    <ellipse cx="88" cy="195" rx="12" ry="6" fill="#8B4513" />
                    <ellipse cx="112" cy="195" rx="12" ry="6" fill="#8B4513" />

                    {/* Magical sparkles around character */}
                    <motion.g
                        animate={{
                            rotate: [0, 360],
                            scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ transformOrigin: '100px 100px' }}
                    >
                        <circle cx="160" cy="80" r="2" fill="#FFD700" />
                        <circle cx="40" cy="120" r="2" fill="#FF69B4" />
                        <circle cx="160" cy="160" r="2" fill="#00CED1" />
                        <circle cx="40" cy="60" r="2" fill="#98FB98" />
                    </motion.g>
                </svg>
            </motion.div>
        </motion.div>
    );
}
