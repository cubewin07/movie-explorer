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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '../Discovery/Breadcrumb';

const faqCategories = [
    {
        title: 'Getting Started',
        icon: <Zap className="w-5 h-5" />,
        questions: [
            {
                question: 'How do I create an account?',
                answer: "Click the 'Sign Up' button in the top right corner. You can register using your email address or connect with your Google account for a faster setup.",
            },
            {
                question: 'How do I add movies to my watchlist?',
                answer: "Browse movies and TV shows, then click the 'Add to Watchlist' button on any title's detail page. You must be logged in to use this feature.",
            },
            {
                question: 'Can I use the app without creating an account?',
                answer: 'Yes! You can browse and search for movies and TV shows without an account. However, features like watchlists, ratings, and personalized recommendations require an account.',
            },
        ],
    },
    {
        title: 'Browsing & Discovery',
        icon: <Search className="w-5 h-5" />,
        questions: [
            {
                question: 'How do I search for specific movies or shows?',
                answer: 'Use the search bar in the top navigation. You can search by title, actor, director, or genre. The search is real-time and will show results as you type.',
            },
            {
                question: 'How do I filter movies by genre?',
                answer: "On the main page, you'll see genre filters. Click on any genre to see all movies and shows in that category. You can also combine multiple genres.",
            },
            {
                question: "What's the difference between 'Popular' and 'Trending'?",
                answer: "'Popular' shows the most watched content overall, while 'Trending' shows what's currently gaining popularity and being discussed online.",
            },
        ],
    },
    {
        title: 'Account & Settings',
        icon: <Settings className="w-5 h-5" />,
        questions: [
            {
                question: 'How do I change my password?',
                answer: "Go to your profile settings by clicking on your avatar in the top right corner, then select 'Change Password' from the account settings menu.",
            },
            {
                question: 'Can I delete my account?',
                answer: 'Yes, you can delete your account from the profile settings. Please note that this action is permanent and will remove all your data including watchlists and ratings.',
            },
            {
                question: 'How do I update my profile information?',
                answer: "Navigate to your profile settings and click on 'Edit Profile'. You can update your display name, email, and profile picture there.",
            },
        ],
    },
    {
        title: 'Technical Issues',
        icon: <Shield className="w-5 h-5" />,
        questions: [
            {
                question: 'The app is loading slowly. What can I do?',
                answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, try using a different browser.',
            },
            {
                question: "I'm seeing error messages. What should I do?",
                answer: 'Take a screenshot of the error message and contact our support team. Include details about what you were doing when the error occurred.',
            },
            {
                question: "The app doesn't work on my mobile device.",
                answer: "Our app is designed to work on all modern browsers. Make sure you're using the latest version of your browser and have a stable internet connection.",
            },
        ],
    },
];

const contactMethods = [
    {
        icon: <Mail className="w-6 h-6" />,
        title: 'Email Support',
        description: 'Get help via email',
        contact: 'support@movieexplorer.com',
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
        contact: '+1 (555) 123-4567',
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
    const [expandedQuestions, setExpandedQuestions] = useState({});

    const toggleQuestion = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setExpandedQuestions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const filteredFAQs = faqCategories
        .map((category) => ({
            ...category,
            questions: category.questions.filter(
                (q) =>
                    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        }))
        .filter((category) => category.questions.length > 0);

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
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <motion.div
                                key={index}
                                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                                whileHover={{ y: -5, scale: 1.02 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                            >
                                <div className="text-blue-600 dark:text-blue-400 mb-3">{action.icon}</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Contact Methods */}
                <motion.section
                    className="mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Get in Touch</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactMethods.map((method, index) => (
                            <motion.div
                                key={index}
                                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg text-center"
                                whileHover={{ y: -5, scale: 1.02 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                            >
                                <div className={`${method.color} mb-3`}>{method.icon}</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{method.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{method.description}</p>
                                <p className="font-medium text-gray-900 dark:text-white mb-1">{method.contact}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{method.response}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* FAQ Section */}
                <motion.section
                    className="mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Frequently Asked Questions
                    </h2>

                    {searchQuery && (
                        <div className="mb-6 text-center">
                            <Badge variant="secondary" className="text-sm">
                                {filteredFAQs.reduce((total, category) => total + category.questions.length, 0)} results
                                found
                            </Badge>
                        </div>
                    )}

                    <div className="space-y-6">
                        {filteredFAQs.map((category, categoryIndex) => (
                            <motion.div
                                key={categoryIndex}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-white">{category.icon}</div>
                                        <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {category.questions.map((faq, questionIndex) => {
                                        const key = `${categoryIndex}-${questionIndex}`;
                                        const isExpanded = expandedQuestions[key];

                                        return (
                                            <motion.div
                                                key={questionIndex}
                                                className="px-6 py-4"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <button
                                                    onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                                                    className="flex items-center justify-between w-full text-left hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg p-2 -m-2 transition-colors"
                                                >
                                                    <h4 className="font-medium text-gray-900 dark:text-white pr-4">
                                                        {faq.question}
                                                    </h4>
                                                    <div className="text-gray-400 dark:text-gray-500">
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <motion.div
                                                        className="mt-3 pl-2"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {faq.answer}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
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
                    className="text-center bg-white dark:bg-slate-800 rounded-2xl p-8 sm:p-12 shadow-lg"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Still Need Help?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                        Can't find what you're looking for? Our support team is here to help you 24/7.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Start Live Chat
                        </Button>
                        <Button variant="outline" className="px-6 py-3">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
