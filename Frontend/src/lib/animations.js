/**
 * Reusable animation variants for framer-motion
 */

export const shakeVariants = {
    shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.5,
            ease: 'easeInOut',
        },
    },
};

export const inputShakeVariants = {
    normal: {
        x: 0,
    },
    shake: {
        x: [0, -8, 8, -8, 8, 0],
        transition: {
            duration: 0.4,
            ease: 'easeInOut',
        },
    },
};
