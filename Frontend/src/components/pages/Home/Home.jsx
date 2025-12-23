import { useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CalendarDays, Star as StarIcon, Tv } from 'lucide-react';
import Section from './Section';
import FeaturedHeroSection from './FeaturedHeroSection';
import HomeLoadingSkeleton from './HomeLoadingSkeleton';
import useHomePageData from './useHomePageData';
import useCarouselItems from './useCarouselItems';
import { TrendingCarousel } from '@/components/TrendingCarousel';
import { FilmModalContext } from '@/context/FilmModalProvider';

/**
 * Home page component
 * Displays featured content, trending items, and various content sections
 * Orchestrates data fetching, loading states, and section rendering
 */
function Home() {
    const { setIsOpen, setContext } = useContext(FilmModalContext);
    
    // Fetch all home page data
    const {
        featuredContent,
        newReleases,
        topRatedMovies,
        popularTVShows,
        trendingData,
        genreMap,
        isLoading,
    } = useHomePageData();

    // Create carousel items from trending data
    const carouselItems = useCarouselItems(trendingData, genreMap);

    // Show loading skeleton while fetching
    if (isLoading) {
        return <HomeLoadingSkeleton />;
    }

    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-8 px-2 sm:px-4 md:px-8">
            {/* Featured Hero Banner */}
            <FeaturedHeroSection featuredContent={featuredContent} />

            {/* Trending Carousel */}
            {carouselItems.length > 0 && (
                <section className="mb-8">
                    <AnimatePresence>
                        <TrendingCarousel items={carouselItems} />
                    </AnimatePresence>
                </section>
            )}

            {/* New Releases */}
            <Section
                title="New Releases"
                items={newReleases}
                isLoading={false}
                icon={<CalendarDays className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
                viewAllType="movie"
                viewAllSort="popularity.desc"
                genreMap={genreMap}
                setContext={setContext}
                setIsOpen={setIsOpen}
            />

            {/* Top Rated */}
            <Section
                title="Top Rated"
                items={topRatedMovies}
                isLoading={false}
                icon={<StarIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />}
                viewAllType="movie"
                viewAllSort="vote_average.desc"
                genreMap={genreMap}
                setContext={setContext}
                setIsOpen={setIsOpen}
            />

            {/* Popular TV Shows */}
            <Section
                title="Popular TV Shows"
                items={popularTVShows}
                isLoading={false}
                icon={<Tv className="w-6 h-6 text-purple-500 dark:text-purple-400" />}
                viewAllType="tv"
                viewAllSort="popularity.desc"
                genreMap={genreMap}
                setContext={setContext}
                setIsOpen={setIsOpen}
            />
        </div>
    );
}

export default Home;