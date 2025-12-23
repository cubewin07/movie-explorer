import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const featureCardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, type: 'spring', bounce: 0.3 },
    }),
    hover: {
        scale: 1.04,
        y: -8,
        boxShadow: '0 8px 32px 0 rgba(59,130,246,0.15)',
        backgroundColor: '#f0f7ff',
        borderColor: '#3b82f6',
        transition: { type: 'spring', stiffness: 300, damping: 18 },
    },
    'hover-dark': {
        scale: 1.04,
        y: -8,
        boxShadow: '0 8px 32px 0 rgba(99,102,241,0.18)',
        backgroundColor: '#1e293b',
        borderColor: '#6366f1',
        transition: { type: 'spring', stiffness: 300, damping: 18 },
    },
};

const featureIconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.15, rotate: 10, transition: { type: 'spring', stiffness: 300 } },
};

export default function UpcomingFeatureCard({ feature, index }) {
    const isDarkMode =
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return (
        <motion.div
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-transparent transition-all duration-300"
            custom={index}
            variants={featureCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={isDarkMode ? 'hover-dark' : 'hover'}
        >
            <motion.div
                className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto"
                variants={featureIconVariants}
                initial="initial"
                whileHover="hover"
            >
                <div className="text-blue-600 dark:text-blue-400">{feature.icon}</div>
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
            <Badge variant="secondary" className="text-xs">
                {feature.eta}
            </Badge>
        </motion.div>
    );
}
