import { motion } from 'framer-motion';
import {
    Mail,
    MessageCircle,
    Phone,
} from 'lucide-react';

/**
 * ContactCard Component
 * Displays individual contact method card
 */
const iconMap = {
    Mail: Mail,
    MessageCircle: MessageCircle,
    Phone: Phone,
};

export default function ContactCard({ method, index }) {
    const IconComponent = iconMap[method.icon];

    return (
        <motion.div
            className="group bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900/50 p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 text-center hover:shadow-2xl transition-all duration-200"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                duration: 0.6, 
                delay: 0.1 * index + 0.6,
                type: 'spring',
                stiffness: 100
            }}
            whileHover={{ 
                y: -4, 
                scale: 1.02,
                transition: { duration: 0.15 }
            }}
        >
            <motion.div 
                className={`${method.color} mb-6 mx-auto w-fit p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-200`}
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ duration: 0.15 }}
            >
                {IconComponent && <IconComponent className="w-6 h-6" />}
            </motion.div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {method.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {method.description}
            </p>
            <div className="space-y-2">
                <p className="font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {method.contact}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {method.response}
                </p>
            </div>
        </motion.div>
    );
}
