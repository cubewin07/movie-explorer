import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, Play, Star, Calendar, Tv, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const WatchlistCard = ({ item, onRemove, info = false, readOnly = false }) => {
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
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20,
          },
        },
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
      exit={{
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 },
      }}
      onClick={() => navigate(redirectPath)}
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[2/3]">
        {/* Main Image */}
        <img
          src={item.image || '/placeholder.svg'}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        
        {/* Play Button Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 backdrop-blur-md p-4 md:p-5 rounded-full border-2 border-white/40 shadow-xl"
          >
            <Play className="h-4 w-4 md:h-6 md:w-6 text-white fill-white" />
          </motion.div>
        </motion.div>

        {/* Top Badges */}
        <div className="absolute top-2 md:top-3 left-2 md:left-3 right-2 md:right-3 flex items-start justify-between z-20">
          {/* Type Badge */}
          <Badge className="bg-black/80 hover:bg-black/90 text-white text-[10px] md:text-xs backdrop-blur-sm border-0 shadow-lg">
            {isTVSeries ? (
              <>
                <Tv className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
                Series
              </>
            ) : (
              <>
                <Film className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
                Movie
              </>
            )}
          </Badge>

          {/* Seasons Badge for TV Series */}
          {isTVSeries && item.totalSeasons && (
            <Badge className="bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] md:text-xs backdrop-blur-sm border-0 shadow-lg">
              {item.totalSeasons} {item.totalSeasons === 1 ? 'Season' : 'Seasons'}
            </Badge>
          )}
        </div>

        {/* Rating Badge */}
        {item.rating && (
          <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 z-20">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1 bg-yellow-400/95 text-gray-900 text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 md:py-1.5 rounded-full shadow-lg backdrop-blur-sm"
            >
              <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-current" />
              <span>{item.rating}</span>
            </motion.div>
          </div>
        )}

        {/* Title Overlay on Image (Mobile) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:hidden">
          <h3 className="text-white font-bold text-sm line-clamp-2 drop-shadow-lg">
            {displayTitle}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-2.5 flex-grow">
        {/* Title (Desktop) */}
        <div className="hidden md:block">
          <h3 className="text-gray-900 dark:text-white font-bold text-sm md:text-base line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] leading-tight">
            {displayTitle}
          </h3>
        </div>

        {/* Year */}
        {item.year && (
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span className="text-[10px] md:text-xs font-medium">{item.year}</span>
          </div>
        )}

        {/* Genre Tags */}
        {item.extra && item.extra.length > 0 && (
          <div className="flex gap-1 md:gap-1.5 flex-wrap">
            {item.extra.slice(0, 3).map((tag, index) => (
              <motion.span
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium border border-blue-200 dark:border-blue-800 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                {tag}
              </motion.span>
            ))}
            {item.extra.length > 3 && (
              <span className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 px-1.5 py-0.5 flex items-center">
                +{item.extra.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Remove Button */}
        <AnimatePresence>
          {!info && !readOnly && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-auto pt-2"
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full text-[10px] md:text-xs h-8 md:h-9 
                  text-red-600 dark:text-red-400 
                  border-red-200 dark:border-red-800 
                  hover:bg-red-50 dark:hover:bg-red-950 
                  hover:border-red-300 dark:hover:border-red-700 
                  hover:text-red-700 dark:hover:text-red-300
                  transition-all duration-200 
                  group/btn relative overflow-hidden
                  shadow-sm hover:shadow-md"
                onClick={(e) => {
                  handleRemoveFromWatchlist(e, {
                    id: item.id,
                    type: item.type === 'tv' ? 'SERIES' : 'MOVIE',
                  });
                }}
              >
                {/* Animated background */}
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-red-100/30 dark:via-red-900/30 to-transparent"></span>
                
                {/* Button content */}
                <motion.span 
                  className="flex items-center gap-1.5 md:gap-2 relative z-10"
                  whileHover={{ x: -2 }}
                >
                  <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span className="font-semibold">Remove</span>
                </motion.span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Read-only indicator */}
        {readOnly && (
          <div className="mt-auto pt-2 text-center">
            <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 italic">
              View Only
            </span>
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl ring-2 ring-blue-400/50 dark:ring-blue-500/50"></div>
      </div>
    </motion.div>
  );
};

export default WatchlistCard;