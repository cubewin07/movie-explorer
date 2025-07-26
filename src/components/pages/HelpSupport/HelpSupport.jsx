import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HelpCircle,
    MessageCircle,
    Mail,
    Phone,
    Clock,
    Search,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Settings,
    User,
    Star,
    Film,
    Tv,
    Heart,
    Download,
    Globe,
    Shield,
    Zap,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '../Discovery/Breadcrumb';

const faqData = [
    {
        category: 'Getting Started',
        icon: <Zap className="w-5 h-5" />,
        items: [
            {
                question: 'How do I create an account?',
                answer: "Click the 'Sign Up' button in the top right corner. You can register using your email address or connect with your Google account for a faster setup. Once registered, you'll have access to personalized features like watchlists and recommendations.",
            },
            {
                question: 'How do I add movies to my watchlist?',
                answer: "Browse movies and TV shows, then click the 'Add to Watchlist' button on any title's detail page. You must be logged in to use this feature. Your watchlist will be saved and accessible from your profile page.",
            },
            {
                question: 'Can I use the app without creating an account?',
                answer: 'Yes! You can browse and search for movies and TV shows without an account. However, features like watchlists, ratings, and personalized recommendations require an account to save your preferences.',
            },
            {
                question: 'How do I navigate the website?',
                answer: 'Use the navigation bar at the top to access different sections: Home for trending content, Movies for film browsing, TV Shows for series, Coming Soon for upcoming releases, and your Watchlist for saved content.',
            },
        ],
    },
    {
        category: 'Browsing & Discovery',
        icon: <Search className="w-5 h-5" />,
        items: [
            {
                question: 'How do I search for specific movies or shows?',
                answer: 'Use the search bar in the top navigation. You can search by title, actor, director, or genre. The search is real-time and will show results as you type. Click on any result to view detailed information.',
            },
            {
                question: 'How do I filter movies by genre?',
                answer: "On the main page, you'll see genre filters. Click on any genre to see all movies and shows in that category. You can also combine multiple genres for more specific results.",
            },
            {
                question: "What's the difference between 'Popular' and 'Trending'?",
                answer: "'Popular' shows the most watched content overall based on viewership data, while 'Trending' shows what's currently gaining popularity and being discussed online in real-time.",
            },
            {
                question: 'How do I find similar movies?',
                answer: "On any movie or TV show detail page, scroll down to find the 'Similar' section. This shows recommendations based on the content you're currently viewing.",
            },
        ],
    },
    {
        category: 'Account & Settings',
        icon: <Settings className="w-5 h-5" />,
        items: [
            {
                question: 'How do I change my password?',
                answer: "Go to your profile settings by clicking on your avatar in the top right corner, then select 'Change Password' from the account settings menu. You'll need to enter your current password for security.",
            },
            {
                question: 'Can I delete my account?',
                answer: 'Yes, you can delete your account from the profile settings. Please note that this action is permanent and will remove all your data including watchlists, ratings, and preferences.',
            },
            {
                question: 'How do I update my profile information?',
                answer: "Navigate to your profile settings and click on 'Edit Profile'. You can update your display name, email, profile picture, and other personal information there.",
            },
            {
                question: 'How do I manage my watchlist?',
                answer: 'Access your watchlist from the navigation menu. You can remove items by clicking the remove button, reorder them by dragging, or filter them by type (movies vs TV shows).',
            },
        ],
    },
    {
        category: 'Technical Issues',
        icon: <Shield className="w-5 h-5" />,
        items: [
            {
                question: 'The app is loading slowly. What can I do?',
                answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, try using a different browser or updating your current browser to the latest version.',
            },
            {
                question: "I'm seeing error messages. What should I do?",
                answer: 'Take a screenshot of the error message and contact our support team. Include details about what you were doing when the error occurred, your browser type, and any steps that led to the error.',
            },
            {
                question: "The app doesn't work on my mobile device.",
                answer: "Our app is designed to work on all modern browsers. Make sure you're using the latest version of your browser and have a stable internet connection. Try clearing your browser cache and cookies.",
            },
            {
                question: 'Images are not loading properly.',
                answer: 'This could be due to a slow internet connection or temporary server issues. Try refreshing the page or waiting a few minutes. If the problem continues, contact our support team.',
            },
        ],
    },
    {
        category: 'Content & Features',
        icon: <Film className="w-5 h-5" />,
        items: [
            {
                question: 'Where does the movie data come from?',
                answer: 'We use The Movie Database (TMDB) API to provide comprehensive movie and TV show information including ratings, cast, crew, trailers, and release dates.',
            },
            {
                question: 'How often is the content updated?',
                answer: "Our content is updated in real-time from TMDB. New movies and TV shows are added as soon as they're available in the database, and ratings are updated continuously.",
            },
            {
                question: 'Can I watch movies directly on the site?',
                answer: "Currently, we provide information about movies and TV shows, but we don't stream content directly. We focus on helping you discover and track content you want to watch.",
            },
            {
                question: 'How do I get notified about new releases?',
                answer: "We're working on notification features! Soon you'll be able to set alerts for specific movies, TV shows, or actors to get notified when new content is available.",
            },
        ],
    },
];

const contactMethods = [
    {
        icon: <Mail className="w-6 h-6" />,
        title: 'Email Support',
        description: 'Get help via email',
        contact: 'tanthang071208@gmail.com',
        response: 'Usually responds within 24 hours',
        color: 'text-blue-600 dark:text-blue-400',
    },
    {
        icon: <MessageCircle className="w-6 h-6" />,
        title: 'Live Chat',
        description: 'Chat with our support team',
        contact: 'Available 24/7',
        response: 'Instant response',
        color: 'text-green-600 dark:text-green-400',
    },
    {
        icon: <Phone className="w-6 h-6" />,
        title: 'Phone Support',
        description: 'Call us directly',
        contact: '+84 362 068 280',
        response: 'Mon-Fri, 9AM-6PM EST',
        color: 'text-purple-600 dark:text-purple-400',
    },
];

const quickActions = [
    {
        icon: <BookOpen className="w-5 h-5" />,
        title: 'User Guide',
        description: 'Learn how to use all features',
        link: '#',
    },
    {
        icon: <Download className="w-5 h-5" />,
        title: 'Download App',
        description: 'Get our mobile app',
        link: '#',
    },
    {
        icon: <Globe className="w-5 h-5" />,
        title: 'API Documentation',
        description: 'For developers',
        link: '#',
    },
    {
        icon: <Star className="w-5 h-5" />,
        title: 'Feature Requests',
        description: 'Suggest new features',
        link: '#',
    },
];

export default function HelpSupport() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFAQs = faqData
        .map((category) => ({
            ...category,
            items: category.items.filter(
                (item) =>
                    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        }))
        .filter((category) => category.items.length > 0);

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
                                <Zap className="w-6 h-6 text-white" />
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
                        {quickActions.map((action, index) => (
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
                                    {action.icon}
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
                        ))}
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
                            <motion.div
                                key={index}
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
                                    {method.icon}
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
                        ))}
                    </div>
                </motion.section>

                {/* FAQ Section with Enhanced UI */}
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
                                {filteredFAQs.reduce((total, category) => total + category.items.length, 0)} results
                                found
                            </Badge>
                        </div>
                    )}

                    <div className="space-y-8">
                        {filteredFAQs.map((category, categoryIndex) => (
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
                                            <div className="text-white">{category.icon}</div>
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
                        ))}
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
