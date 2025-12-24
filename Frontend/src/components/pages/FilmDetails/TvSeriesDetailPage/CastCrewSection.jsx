import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

export default function CastCrewSection({
    cast,
    crew,
    isLoadingCredits,
    isErrorCredits,
}) {
    return (
        <div className="space-y-8">
            {/* Cast Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Cast</h2>
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
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
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
            </div>

            {/* Crew Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Crew</h2>
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
                    <motion.ul
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        {crew.map((person) => (
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
                                        className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-indigo-200 dark:border-indigo-700 shadow"
                                    />
                                ) : (
                                    <User className="w-14 h-14 mb-2 text-indigo-400 bg-indigo-100 dark:bg-indigo-900 rounded-full p-2" />
                                )}
                                <span className="font-semibold text-sm text-center truncate w-full">
                                    {person.name}
                                </span>
                                <span className="text-xs text-muted-foreground text-center truncate w-full">
                                    {person.job}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </div>
        </div>
    );
}
