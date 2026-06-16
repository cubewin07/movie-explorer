import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass, Sparkles, CheckCircle2 } from 'lucide-react';

const Motion = motion;

const variantStyles = {
    refreshing: {
        container: 'border-amber-200/80 bg-amber-50/85 text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/25 dark:text-amber-100',
        dot: 'bg-amber-500',
        icon: Hourglass,
    },
    unchanged: {
        container: 'border-sky-200/80 bg-sky-50/85 text-sky-900 dark:border-sky-500/40 dark:bg-sky-900/25 dark:text-sky-100',
        dot: 'bg-sky-500',
        icon: Hourglass,
    },
    updated: {
        container: 'border-emerald-200/80 bg-emerald-50/85 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/25 dark:text-emerald-100',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
    },
};

function buildMessage({ phase, lastAddedTitle }) {
    const titleSuffix = lastAddedTitle ? ` from “${lastAddedTitle}”` : ' from your watchlist';

    if (phase === 'refreshing') {
        return {
            title: 'Refreshing your picks…',
            body: `We're ranking new recommendations${titleSuffix} right now.`,
        };
    }

    if (phase === 'unchanged') {
        return {
            title: 'Picks are warming up',
            body: `New titles${titleSuffix} will appear once the recommender finishes its pass. The list below will stay up to date.`,
        };
    }

    if (phase === 'updated') {
        return {
            title: 'Fresh picks are in',
            body: `Your recommendations just refreshed${titleSuffix}.`,
        };
    }

    return null;
}

export default function RecommendationFreshnessBanner({ phase, lastAddedTitle }) {
    const styles = variantStyles[phase];
    if (!styles) {
        return null;
    }

    const message = buildMessage({ phase, lastAddedTitle });
    if (!message) {
        return null;
    }

    const Icon = styles.icon;

    return (
        <AnimatePresence initial={false}>
            <Motion.div
                key={`freshness-${phase}`}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                role="status"
                aria-live="polite"
                className={`mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${styles.container}`}
            >
                <Motion.span
                    aria-hidden="true"
                    className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                        <Icon className="h-4 w-4" />
                        <span>{message.title}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed opacity-90">{message.body}</p>
                </div>
            </Motion.div>
        </AnimatePresence>
    );
}
