import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Motion = motion;

function buildMessage({ phase, lastAddedTitle }) {
    const titleSuffix = lastAddedTitle ? `"${lastAddedTitle}"` : 'a title';

    if (phase === 'refreshing') {
        return `Digesting ${titleSuffix} — your picks will refresh soon`;
    }

    if (phase === 'unchanged') {
        return `Processing ${titleSuffix}. Picks update once recompute finishes.`;
    }

    if (phase === 'updated') {
        return `Fresh picks ready — shaped by ${titleSuffix}`;
    }

    return null;
}

export default function RecommendationFreshnessBanner({ phase, lastAddedTitle }) {
    const message = buildMessage({ phase, lastAddedTitle });
    if (!message) {
        return null;
    }

    const isActive = phase === 'refreshing';

    return (
        <AnimatePresence initial={false} mode="wait">
            <Motion.div
                key={`freshness-${phase}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                role="status"
                aria-live="polite"
                className="mb-5 flex items-center gap-2.5 overflow-hidden"
            >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                    {isActive && (
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
                    )}
                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-emerald-400/50'}`} />
                </span>

                <span className="text-[13px] leading-relaxed text-slate-500 dark:text-emerald-200/70">
                    {message}
                </span>

                {isActive && (
                    <Sparkles className="h-3 w-3 shrink-0 text-emerald-400/60 animate-pulse" />
                )}
            </Motion.div>
        </AnimatePresence>
    );
}