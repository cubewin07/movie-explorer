import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

/**
 * MovieCastCrewSection Component
 * Displays cast and crew information for movies
 * Features:
 * - Shows first 10 cast members
 * - Shows crew by department (Director, Producer, etc.) for movies
 * - Different from TVSeriesDetailPage crew section
 */
export function MovieCastCrewSection({
    isLoadingCredits,
    isErrorCredits,
    cast,
    crew,
    onCastChange = null,
    onCrewChange = null,
}) {
    // For movies, organize crew by department (unique to movies)
    const crewByDepartment = crew.reduce((acc, person) => {
        const dept = person.department || 'Other';
        if (!acc[dept]) {
            acc[dept] = [];
        }
        acc[dept].push(person);
        return acc;
    }, {});

    // Get top departments for movies
    const topDepartments = ['Directing', 'Production', 'Writing', 'Camera'];
    const sortedDepartments = Object.keys(crewByDepartment)
        .sort((a, b) => {
            const aIndex = topDepartments.indexOf(a);
            const bIndex = topDepartments.indexOf(b);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        })
        .slice(0, 4); // Show top 4 departments

    return (
        <>
            {/* Cast Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cast</h2>
                {isLoadingCredits ? (
                    <LoadingState 
                        title="Loading Cast"
                        subtitle="Getting cast information..."
                        fullScreen={false}
                        className="py-8"
                    />
                ) : isErrorCredits ? (
                    <ErrorState 
                        title="Cast Not Available"
                        message="Failed to load cast information"
                        subtitle="There was an issue loading the cast details"
                        fullScreen={false}
                        showHomeButton={false}
                        retryText="Retry"
                        className="py-8"
                    />
                ) : cast.length === 0 ? (
                    <div className="py-6 text-muted-foreground">No cast info.</div>
                ) : (
                    <motion.ul
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        {cast.map((person) => (
                            <motion.li
                                key={person.id}
                                className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 shadow transition hover:bg-blue-100 hover:shadow-lg hover:border-blue-400 dark:hover:bg-slate-700 dark:hover:border-blue-400 text-slate-900 dark:text-white border border-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                {person.profile_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                        alt={person.name}
                                        className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-blue-200 dark:border-blue-700 shadow"
                                    />
                                ) : (
                                    <User className="w-14 h-14 mb-2 text-blue-400 bg-blue-100 dark:bg-blue-900 rounded-full p-2" />
                                )}
                                <span className="font-semibold text-sm text-center truncate w-full">
                                    {person.name}
                                </span>
                                <span className="text-xs text-muted-foreground text-center truncate w-full">
                                    {person.character}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </section>

            {/* Crew Section by Department (Movie-Specific) */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Crew</h2>
                {isLoadingCredits ? (
                    <LoadingState 
                        title="Loading Crew"
                        subtitle="Getting crew information..."
                        fullScreen={false}
                        className="py-8"
                    />
                ) : isErrorCredits ? (
                    <ErrorState 
                        title="Crew Not Available"
                        message="Failed to load crew information"
                        subtitle="There was an issue loading the crew details"
                        fullScreen={false}
                        showHomeButton={false}
                        retryText="Retry"
                        className="py-8"
                    />
                ) : crew.length === 0 ? (
                    <div className="py-6 text-muted-foreground">No crew info.</div>
                ) : (
                    <div className="space-y-6">
                        {sortedDepartments.map((department) => (
                            <motion.div
                                key={department}
                                className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                                    {department}
                                </h3>
                                <motion.ul
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, staggerChildren: 0.05 }}
                                >
                                    {crewByDepartment[department].slice(0, 8).map((person) => (
                                        <motion.li
                                            key={`${person.id}-${person.job}`}
                                            className="flex flex-col items-center bg-white dark:bg-slate-600 rounded-lg p-3 shadow transition hover:bg-indigo-100 hover:shadow-lg dark:hover:bg-slate-500 text-slate-900 dark:text-white border border-transparent"
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {person.profile_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                    alt={person.name}
                                                    className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-indigo-200 dark:border-indigo-700 shadow"
                                                />
                                            ) : (
                                                <User className="w-12 h-12 mb-2 text-indigo-400 bg-indigo-100 dark:bg-indigo-900 rounded-full p-2" />
                                            )}
                                            <span className="font-semibold text-xs text-center truncate w-full">
                                                {person.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground text-center truncate w-full">
                                                {person.job}
                                            </span>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}

export default MovieCastCrewSection;
