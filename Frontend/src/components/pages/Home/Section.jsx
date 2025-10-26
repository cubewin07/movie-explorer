import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import MovieCard from './HomeMovieCard';
import SkeletonCard from '@/components/ui/SkeletonCard';

// ✅ New Component: Section (moved from renderSection)
function Section({ title, items, isLoading, icon, viewAllType, viewAllSort, genreMap, setContext, setIsOpen }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('div[class*="w-[180px]"]') || el.querySelector('div[class*="w-[200px]"]');
    const cardWidth = card ? card.offsetWidth + 16 : 200;
    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  };

  return (
    <section className="mb-12">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {icon} {title}
        </h2>
        <motion.button
          onClick={() =>
            navigate(viewAllType === 'tv' ? '/tvseries' : '/movies', {
              state: { type: viewAllType, sortBy: viewAllSort },
            })
          }
          className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1"
          whileHover="hovered"
          whileTap={{ scale: 0.97 }}
          initial="rest"
          animate="rest"
          variants={{}}
        >
          <motion.span
            variants={{
              rest: { x: 0 },
              hovered: { x: -6 },
            }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            View All
          </motion.span>
          <motion.span
            variants={{
              rest: { x: 0 },
              hovered: { x: 6 },
            }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </motion.button>
      </motion.div>

      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className="flex flex-nowrap overflow-x-auto gap-x-4 py-2 scrollbar-hide scroll-smooth"
          onScroll={checkScroll}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard
                  key={i}
                  delay={i}
                  variant="movie"
                  animation="shimmer"
                  className="w-[180px] md:w-[200px] h-80 flex-shrink-0"
                />
              ))
            : items?.map((item, idx) => (
                <MovieCard
                  key={`${item.id}-${viewAllType}-${idx}`}
                  movie={item}
                  type={viewAllType}
                  index={idx}
                  genreMap={genreMap}
                  setContext={setContext}
                  setIsOpen={setIsOpen}
                />
              ))}
        </div>

        {/* Left Button */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-full p-2 shadow transition-all duration-200
              ${isHovered ? (canScrollLeft ? 'opacity-100' : 'opacity-50 grayscale cursor-not-allowed') : 'opacity-0 pointer-events-none'}
              ${isHovered && canScrollLeft ? 'hover:-translate-x-1' : ''}
          `}
          style={{ transition: 'opacity 0.2s, transform 0.2s' }}
          disabled={!canScrollLeft}
          tabIndex={-1}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Button */}
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-full p-2 shadow transition-all duration-200
              ${isHovered ? (canScrollRight ? 'opacity-100' : 'opacity-50 grayscale cursor-not-allowed') : 'opacity-0 pointer-events-none'}
              ${isHovered && canScrollRight ? 'hover:translate-x-1' : ''}
          `}
          style={{ transition: 'opacity 0.2s, transform 0.2s' }}
          disabled={!canScrollRight}
          tabIndex={-1}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default Section;