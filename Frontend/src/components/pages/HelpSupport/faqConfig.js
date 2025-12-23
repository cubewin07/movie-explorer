import {
    Zap,
    Search,
    Settings,
    Shield,
    Film,
} from 'lucide-react';

export const faqData = [
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

export const contactMethods = [
    {
        icon: 'Mail',
        title: 'Email Support',
        description: 'Get help via email',
        contact: 'tanthang071208@gmail.com',
        response: 'Usually responds within 24 hours',
        color: 'text-blue-600 dark:text-blue-400',
    },
    {
        icon: 'MessageCircle',
        title: 'Live Chat',
        description: 'Chat with our support team',
        contact: 'Available 24/7',
        response: 'Instant response',
        color: 'text-green-600 dark:text-green-400',
    },
    {
        icon: 'Phone',
        title: 'Phone Support',
        description: 'Call us directly',
        contact: '+84 362 068 280',
        response: 'Mon-Fri, 9AM-6PM EST',
        color: 'text-purple-600 dark:text-purple-400',
    },
];

export const quickActions = [
    {
        icon: 'BookOpen',
        title: 'User Guide',
        description: 'Learn how to use all features',
        link: '#',
    },
    {
        icon: 'Download',
        title: 'Download App',
        description: 'Get our mobile app',
        link: '#',
    },
    {
        icon: 'Globe',
        title: 'API Documentation',
        description: 'For developers',
        link: '#',
    },
    {
        icon: 'Star',
        title: 'Feature Requests',
        description: 'Suggest new features',
        link: '#',
    },
];
