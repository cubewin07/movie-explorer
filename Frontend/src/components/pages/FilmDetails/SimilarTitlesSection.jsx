import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, Sparkles, Clapperboard } from 'lucide-react';
import MovieCard from '@/components/ui/MovieCard';

const Motion = motion;

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function resolveImage(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') {
        return '/placeholder.svg';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    return `${TMDB_IMAGE_BASE}${imagePath}`;
}

function normalizeSimilarItem(item) {
    const dateValue = item?.dateValue || item?.release_date || item?.first_air_date || '';

    return {
        id: item?.tmdbId || item?.id,
        title: item?.title || item?.name || 'Untitled',
        year: dateValue ? String(dateValue).slice(0, 4) : undefined,
        image: resolveImage(item?.backgroundImg || item?.poster_path || item?.backdrop_path),
        rating: item?.vote_average ? Number(item.vote_average).toFixed(1) : undefined,
    };
}

function SimilarSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 p-4">
            <div className="flex gap-4">
                <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="flex-1 space-y-3 py-2">
                    <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

const indicatorStyles = {
    auth: {
        border: 'border-emerald-300/70 dark:border-emerald-500/40',
        from: 'from-emerald-50',
        to: 'to-cyan-100/70',
        darkFrom: 'dark:from-emerald-900/25',
        darkTo: 'dark:to-cyan-900/20',
        iconWrap: 'bg-gradient-to-br from-emerald-500 to-cyan-500',
        glow: 'bg-emerald-400/30 dark:bg-emerald-500/25',
        chip: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/50',
    },
    error: {
        border: 'border-rose-300/70 dark:border-rose-500/40',
        from: 'from-rose-50',
        to: 'to-orange-100/70',
        darkFrom: 'dark:from-rose-900/25',
        darkTo: 'dark:to-orange-900/20',
        iconWrap: 'bg-gradient-to-br from-rose-500 to-orange-500',
        glow: 'bg-rose-400/30 dark:bg-rose-500/25',
        chip: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700/50',
    },
    empty: {
        border: 'border-amber-300/70 dark:border-amber-500/40',
        from: 'from-amber-50',
        to: 'to-yellow-100/70',
        darkFrom: 'dark:from-amber-900/25',
        darkTo: 'dark:to-yellow-900/20',
        iconWrap: 'bg-gradient-to-br from-amber-500 to-yellow-500',
        glow: 'bg-amber-400/30 dark:bg-amber-500/25',
        chip: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/50',
    },
};

function PremiumIndicator({ variant, mediaType }) {
    const mediaLabel = mediaType === 'tv' ? 'TV series' : 'movies';

    const indicatorMap = {
        auth: {
            title: `Unlock Similar ${mediaLabel}`,
            description: `Sign in to see personalized similar ${mediaLabel} with richer recommendations and smarter matching.`,
            chipText: 'Member feature',
            icon: Lock,
        },
        error: {
            title: 'Temporary Signal Loss',
            description: `We could not fetch similar ${mediaLabel} right now. Please try again in a few moments.`,
            chipText: 'Connection issue',
            icon: AlertTriangle,
        },
        empty: {
            title: `No Similar ${mediaLabel} Yet`,
            description: `We did not find close matches for this title yet. Check back soon as new recommendations are synced.`,
            chipText: 'Updating library',
            icon: Clapperboard,
        },
    };

    const styles = indicatorStyles[variant] || indicatorStyles.empty;
    const data = indicatorMap[variant] || indicatorMap.empty;
    const Icon = data.icon;

    return (
        <Motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.from} ${styles.to} ${styles.darkFrom} ${styles.darkTo} p-5 sm:p-6 shadow-lg`}
        >
            <Motion.div
                aria-hidden="true"
                className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-2xl ${styles.glow}`}
                animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative flex items-start gap-4">
                <Motion.div
                    className={`shrink-0 rounded-xl p-3 text-white shadow-md ${styles.iconWrap}`}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Icon className="h-5 w-5" />
                </Motion.div>

                <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{data.title}</h3>
                    <p className="mt-1 text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {data.description}
                    </p>

                    <Motion.div
                        className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${styles.chip}`}
                        animate={{ opacity: [0.85, 1, 0.85] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{data.chipText}</span>
                    </Motion.div>
                </div>
            </div>
        </Motion.div>
    );
}

export default function SimilarTitlesSection({
    items = [],
    isLoading = false,
    isError = false,
    requiresAuth = false,
    mediaType = 'movie',
}) {
    const navigate = useNavigate();

    if (requiresAuth) {
        return <PremiumIndicator variant="auth" mediaType={mediaType} />;
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <SimilarSkeleton key={`similar-skeleton-${index}`} />
                ))}
            </div>
        );
    }

    if (isError) {
        return <PremiumIndicator variant="error" mediaType={mediaType} />;
    }

    const normalizedItems = (Array.isArray(items) ? items : [])
        .map(normalizeSimilarItem)
        .filter((item) => item.id);

    if (normalizedItems.length === 0) {
        return <PremiumIndicator variant="empty" mediaType={mediaType} />;
    }

    const routePrefix = mediaType === 'tv' ? '/tv' : '/movie';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normalizedItems.slice(0, 10).map((item) => (
                <MovieCard
                    key={item.id}
                    title={item.title}
                    year={item.year}
                    rating={item.rating}
                    image={item.image}
                    type={mediaType}
                    onClick={() => navigate(`${routePrefix}/${item.id}`)}
                />
            ))}
        </div>
    );
}
