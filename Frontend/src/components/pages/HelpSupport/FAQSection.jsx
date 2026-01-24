import { motion } from 'framer-motion';
import { HelpCircle, Zap, Search, Settings, Shield, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * FAQSection Component
 * Displays FAQ categories with expandable questions and answers
 */
export default function FAQSection({ filteredFAQs, searchQuery, resultsCount }) {
    const iconMap = {
        Zap,
        Search,
        Settings,
        Shield,
        Film,
    };
    return (
        <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
        >
            <div className="text-center mb-12">
                <motion.div
                    className="inline-flex items-center gap-3 mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                        <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Frequently Asked Questions
                    </h2>
                </motion.div>
                <motion.p
                    className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                >
                    Find answers to common questions about using our movie explorer platform
                </motion.p>
            </div>

            {searchQuery && (
                <div className="mb-6 text-center">
                    <Badge variant="secondary" className="text-sm">
                        {resultsCount} results found
                    </Badge>
                </div>
            )}

            <div className="space-y-8">
                {filteredFAQs.map((category, categoryIndex) => {
                    const IconComponent = iconMap[category.iconName];
                    return (
                        <motion.div
                            key={categoryIndex}
                            className="bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900/50 rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                                duration: 0.6, 
                                delay: categoryIndex * 0.15,
                                type: 'spring',
                                stiffness: 100
                            }}
                            whileHover={{ 
                                scale: 1.01,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                transition: { duration: 0.15 }
                            }}
                        >
                            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 px-8 py-6 border-b border-gray-200/50 dark:border-slate-600/50">
                                <div className="flex items-center gap-4">
                                    <motion.div 
                                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg"
                                        whileHover={{ scale: 1.05, rotate: 3 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <div className="text-white">
                                            {IconComponent && <IconComponent className="w-5 h-5" />}
                                        </div>
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                            {category.category}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {category.items.length} helpful answers
                                        </p>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: categoryIndex * 0.15 + 0.3 }}
                                    >
                                        <Badge 
                                            variant="secondary" 
                                            className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-0 shadow-sm"
                                        >
                                            {category.items.length} Q&A
                                        </Badge>
                                    </motion.div>
                                </div>
                            </div>

                            <div className="p-2">
                                {category.items.map((faq, questionIndex) => (
                                    <motion.div
                                        key={questionIndex}
                                        className="mb-3 last:mb-0"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ 
                                            delay: categoryIndex * 0.15 + questionIndex * 0.1 + 0.4,
                                            duration: 0.4
                                        }}
                                    >
                                        <div className="collapse collapse-arrow bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border border-gray-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-150">
                                            <input
                                                type="radio"
                                                name={`accordion-${categoryIndex}`}
                                                defaultChecked={questionIndex === 0}
                                            />
                                            <div className="collapse-title text-base font-semibold text-gray-800 dark:text-gray-200 py-5 px-6 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                                    {faq.question}
                                                </div>
                                            </div>
                                            <div className="collapse-content bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-slate-800/30 dark:to-slate-900/30 border-t border-gray-200/50 dark:border-slate-600/50">
                                                <div className="pt-4 pb-6 px-6">
                                                    <motion.p 
                                                        className="text-gray-700 dark:text-gray-300 leading-relaxed"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {faq.answer}
                                                    </motion.p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filteredFAQs.length === 0 && searchQuery && (
                <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Try searching with different keywords or browse our FAQ categories above.
                    </p>
                </motion.div>
            )}
        </motion.section>
    );
}
