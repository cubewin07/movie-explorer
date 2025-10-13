import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WatchlistCard = ({ item, onRemove, info = false }) => {
  const navigate = useNavigate();
  const isTVSeries = item.type === 'tv';
  const displayTitle = item.title || item.name;
  const redirectPath = isTVSeries ? `/tv/${item.id}` : `/movie/${item.id}`;

  const handleRemoveFromWatchlist = (e, data) => {
    e.stopPropagation();
    onRemove?.(data);
  };

  return (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
          },
        },
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.15, ease: 'easeOut' },
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      }}
      whileTap={{ scale: 0.98 }}
      exit={{
        opacity: 0,
        y: 50,
        scale: 0.8,
        transition: { duration: 0.2 },
      }}
      onClick={() => navigate(redirectPath)}
      className="group relative bg-card border border-border rounded-xl overflow-hidden flex flex-col cursor-pointer shadow-md hover:shadow-xl"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10 pointer-events-none"></div>

      {/* Quick action overlay */}
      <div className="absolute inset-x-0 top-0 h-64 sm:h-56 md:h-60 lg:h-64 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm p-2.5 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-30">
        <span className="bg-black/80 text-white text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium backdrop-blur-sm">
          {isTVSeries ? 'TV Series' : 'Movie'}
        </span>
      </div>

      {isTVSeries && item.totalSeasons && (
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30">
          <span className="bg-blue-600/90 text-white text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium backdrop-blur-sm shadow-lg">
            {item.totalSeasons} Seasons
          </span>
        </div>
      )}

      <div className="relative overflow-hidden">
        <img
          src={item.image || '/placeholder.svg'}
          alt={displayTitle}
          className="w-full h-64 sm:h-56 md:h-60 lg:h-64 object-cover transition-transform duration-700 hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Rating badge */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-30">
          <span className="flex items-center gap-0.5 sm:gap-1 bg-yellow-400/90 text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 sm:h-3.5 sm:w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {item.rating}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-grow relative z-30">
        <div className="flex items-start gap-2">
          <h3 className="text-sm sm:text-base font-bold line-clamp-2 flex-grow min-h-[2.5rem] sm:min-h-[3rem]">
            {displayTitle}
          </h3>
        </div>

        <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">{item.year}</div>

        <div className="flex gap-1 sm:gap-1.5 flex-wrap mt-0.5 sm:mt-1 min-h-[1.5rem]">
          {item.extra?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full transition-colors duration-200 hover:bg-blue-200 dark:hover:bg-blue-800/70"
            >
              {tag}
            </span>
          ))}
          {item.extra?.length > 3 && (
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              +{item.extra.length - 3}
            </span>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative z-40 mt-auto ${info ? 'hidden' : ''}`}
        >
          <Button
            size="sm"
            variant="outline"
            className="group/btn mt-auto text-[10px] sm:text-xs py-1 sm:py-2 h-auto w-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-all duration-200 relative overflow-hidden border-red-200 dark:border-red-800/50 hover:border-red-400 dark:hover:border-red-600 hover:shadow-lg hover:shadow-red-500/20"
            onClick={(e) => {
              handleRemoveFromWatchlist(e, {
                id: item.id,
                type: item.type === 'tv' ? 'SERIES' : 'MOVIE',
              });
            }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-red-200/30 dark:via-red-400/20 to-transparent"></span>
            <span className="flex items-center gap-1 sm:gap-1.5 relative z-10">
              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500 group-hover/btn:text-red-600 dark:group-hover/btn:text-red-400" />
              <span className="font-medium">Remove</span>
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WatchlistCard;
