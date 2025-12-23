import { motion } from 'framer-motion';
import {
    HelpCircle,
    MessageCircle,
    Mail,
    Search,
    BookOpen,
    Download,
    Globe,
    Star,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Breadcrumb from '../Discovery/Breadcrumb';
import FAQSection from './FAQSection';
import ContactCard from './ContactCard';
import { faqData, contactMethods, quickActions } from './faqConfig';
import { useHelpSearch } from './useHelpSearch';

/**
 * HelpSupport Page Component
 * Main page for help, support, and FAQ information
 */
export default function HelpSupport() {
    const { searchQuery, setSearchQuery, filteredFAQs, resultsCount } = useHelpSearch(faqData);

    const iconMap = {
        BookOpen: BookOpen,
        Download: Download,
        Globe: Globe,
        Star: Star,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Breadcrumb
                        items={[
                            { name: 'Home', to: '/' },
                            { name: 'Help & Support', to: '/help-support' },
                        ]}
                    />
                </div>

                {/* Hero Section */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                    >
                        <HelpCircle className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Help & Support
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Find answers to your questions, get help with issues, and learn how to make the most of Movie
                        Explorer.
                    </p>
                </motion.div>

                {/* Search Section */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search for help topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-3 text-lg"
                        />
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.section
                    className="mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="text-center mb-12">
                        <motion.div
                            className="inline-flex items-center gap-3 mb-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Quick Actions
                            </h2>
                        </motion.div>
                        <motion.p
                            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            Access helpful resources and tools to get the most out of your experience
                        </motion.p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => {
                            const IconComponent = iconMap[action.icon];
                            return (
                                <motion.a
                                    key={index}
                                    href={action.link}
                                    className="group bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900/50 p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 text-center hover:shadow-2xl transition-all duration-200 block"
                                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ 
                                        duration: 0.6, 
                                        delay: 0.1 * index + 0.5,
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
                                        className="text-blue-600 dark:text-blue-400 mb-6 mx-auto w-fit p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                        whileHover={{ scale: 1.08, rotate: 5 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {IconComponent && <IconComponent className="w-5 h-5" />}
                                    </motion.div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                        {action.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                        {action.description}
                                    </p>
                                    <motion.div
                                        className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
                                        initial={{ x: 0 }}
                                        whileHover={{ x: 3 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <span className="text-sm">Learn More</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.div>
                                </motion.a>
                            );
                        })}
                    </div>
                </motion.section>

                {/* Contact Methods */}
                <motion.section
                    className="mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="text-center mb-12">
                        <motion.div
                            className="inline-flex items-center gap-3 mb-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Get in Touch
                            </h2>
                        </motion.div>
                        <motion.p
                            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            Choose your preferred way to reach out to our support team
                        </motion.p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {contactMethods.map((method, index) => (
                            <ContactCard key={index} method={method} index={index} />
                        ))}
                    </div>
                </motion.section>

                {/* FAQ Section */}
                <FAQSection
                    filteredFAQs={filteredFAQs}
                    searchQuery={searchQuery}
                    resultsCount={resultsCount}
                />

                {/* Call to Action */}
                <motion.div
                    className="relative text-center bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/50 rounded-3xl p-12 sm:p-16 shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden"
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 100 }}
                >
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-xl opacity-15"></div>
                    
                    <div className="relative z-10">
                        <motion.div
                            className="inline-flex items-center gap-3 mb-6"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                                <HelpCircle className="w-8 h-8 text-white" />
                            </div>
                        </motion.div>
                        
                        <motion.h3 
                            className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            Still Need Help?
                        </motion.h3>
                        
                        <motion.p 
                            className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                        >
                            Can't find what you're looking for? Our dedicated support team is here to help you 24/7 with personalized assistance.
                        </motion.p>
                        
                        <motion.div 
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0, duration: 0.5 }}
                        >
                            <motion.button
                                className="group px-8 py-4 rounded-2xl text-white font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300/50 dark:focus:ring-blue-800/50 relative overflow-hidden"
                                whileHover={{ 
                                    scale: 1.03, 
                                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)',
                                    transition: { duration: 0.15 }
                                }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                <div className="relative flex items-center gap-3">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>Start Live Chat</span>
                                </div>
                            </motion.button>
                            
                            <motion.button
                                className="group px-8 py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-slate-700/90 border-2 border-gray-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-200"
                                whileHover={{ 
                                    scale: 1.02,
                                    borderColor: 'rgb(59 130 246)',
                                    transition: { duration: 0.15 }
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5" />
                                    <span>Send Email</span>
                                </div>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
