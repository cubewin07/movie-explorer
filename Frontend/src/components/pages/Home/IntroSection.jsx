import { motion } from 'framer-motion';
import { Sparkles, Users, Film, Heart } from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay }}
        whileHover={{ y: -5 }}
    >
        <div className="mb-4 p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
);

const IntroSection = () => {
    return (
        <section className="relative py-20 px-4 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        More Than Just a Movie List
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Immerse yourself in a world of cinema. Track your journey, connect with friends, 
                        and discover hidden gems through our curated experience.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureItem 
                        icon={Film} 
                        title="Vast Library" 
                        description="Access comprehensive details for millions of movies and TV shows instantly."
                        delay={0.1}
                    />
                    <FeatureItem 
                        icon={Sparkles} 
                        title="Smart Discovery" 
                        description="Get personalized recommendations based on your unique taste profile."
                        delay={0.2}
                    />
                    <FeatureItem 
                        icon={Users} 
                        title="Social Cinema" 
                        description="Share reviews, create watch parties, and follow friends' cinematic journeys."
                        delay={0.3}
                    />
                    <FeatureItem 
                        icon={Heart} 
                        title="Curated Lists" 
                        description="Build your watchlist and organize your favorites into custom collections."
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
};

export default IntroSection;
