import SkeletonCard from '@/components/ui/skeletonCard';

function HomeLoadingSkeleton() {
    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-8 px-2 sm:px-4 md:px-8">
            {/* Featured Hero Skeleton */}
            <section className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden mb-8 shadow-xl bg-gray-200 dark:bg-slate-800 animate-pulse">
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="max-w-2xl space-y-4">
                        <div className="h-10 bg-gray-300 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-5/6"></div>
                        <div className="flex gap-3 mt-6">
                            <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded w-32"></div>
                            <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded w-40"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trending Carousel Skeleton */}
            <section className="mb-8">
                <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            </section>

            {/* Section Skeletons */}
            {['New Releases', 'Top Rated', 'Popular TV Shows'].map((title) => (
                <section key={title} className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-48 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="flex gap-x-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard
                                key={i}
                                delay={i}
                                variant="movie"
                                animation="shimmer"
                                className="w-[180px] md:w-[200px] h-80 flex-shrink-0"
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

export default HomeLoadingSkeleton;
