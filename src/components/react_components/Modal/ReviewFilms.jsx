import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Calendar,
  Globe,
  X,
  Eye,
  Clock,
  Film,
  Play,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { FilmModalContext } from '@/context/FilmModalProvider';

const genreColorMap = {
  Action: 'bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-500/25',
  Adventure: 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg shadow-green-500/25',
  Animation: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/25',
  Comedy: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/25',
  Crime: 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg shadow-red-500/25',
  Documentary: 'bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/25',
  Drama: 'bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/25',
  Family: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25',
  Fantasy: 'bg-gradient-to-r from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/25',
  History: 'bg-gradient-to-r from-stone-400 to-stone-600 text-white shadow-lg shadow-stone-500/25',
  Horror: 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg shadow-red-500/25',
  Music: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/25',
  Mystery: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg shadow-gray-500/25',
  Romance: 'bg-gradient-to-r from-pink-400 to-pink-600 text-white shadow-lg shadow-pink-500/25',
  'Science Fiction': 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25',
  Thriller: 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg shadow-pink-500/25',
  War: 'bg-gradient-to-r from-zinc-400 to-zinc-600 text-white shadow-lg shadow-zinc-500/25',
  Western: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/25',
};

export default function MovieReviewModal(props) {
  const {
    title,
    id,
    name,
    original_title,
    original_name,
    first_air_date,
    release_date,
    genres = [],
    poster_path,
    vote_average = 0,
    vote_count = 0,
    overview = 'No overview available.',
    original_language,
    runtime,
    image,
  } = props;

  const releaseDate = release_date || first_air_date;
  console.log(releaseDate);
  const { setIsOpen } = useContext(FilmModalContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const posterUrl = image
    ? image
    : poster_path
      ? `https://image.tmdb.org/t/p/w500${poster_path}`
      : '/no-image-available.png';

  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
    window.dispatchEvent(new Event('film-modal-close'));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Movie details modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleClose}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={id || title || name || 'modal'}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: -50, scale: 0.95, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: 50, scale: 0.95, rotateX: 15 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            duration: 0.4,
          }}
          className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-background via-background to-background/95 border border-border/50 text-foreground shadow-2xl shadow-black/20 rounded-2xl backdrop-blur-xl ring-1 ring-white/10 flex flex-col"
        >
          <CardContent className="p-0 relative overflow-hidden flex flex-col flex-1">
            {/* Close Button */}
            <motion.div
              className="absolute top-4 right-4 z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white border-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Banner */}
            <div className="relative h-48 sm:h-64 overflow-hidden">
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <img
                  src={posterUrl}
                  alt={title || name || 'Movie poster'}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => (e.currentTarget.src = '/no-image-available.png')}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20" />
              </motion.div>

              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-600" />
                </div>
              )}

              <motion.div
                className="absolute bottom-0 left-0 right-0 p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {title || name || original_title || original_name}
                </motion.h2>

                {vote_average > 0 && (
                  <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-semibold shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span>{vote_average.toFixed(1)}</span>
                    <span className="text-xs opacity-80">({vote_count})</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Content Section */}
            <motion.div
              className="p-6 space-y-6 overflow-y-auto flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <motion.div
                  className="flex-shrink-0 mx-auto sm:mx-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  whileHover={{ scale: 1.03, rotateY: 3, transition: { duration: 0.2 } }}
                  style={{ perspective: '1000px' }}
                >
                  <div className="relative group">
                    <img
                      src={posterUrl}
                      alt={title || name || 'Movie poster'}
                      className="w-32 h-48 sm:w-40 sm:h-60 object-cover rounded-xl shadow-2xl border border-white/10 transition-all duration-300 group-hover:shadow-3xl"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>

                <motion.div
                  className="flex-1 space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.div
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                  >
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {original_language && (
                        <motion.div 
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-xs" 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          {original_language.toUpperCase()}
                        </motion.div>
                      )}
                      {runtime && (
                        <motion.div 
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium text-xs" 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(runtime / 60)}h {runtime % 60}m
                        </motion.div>
                      )}
                      {releaseDate && (
                        <motion.div 
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-xs" 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(releaseDate).toLocaleDateString()}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Genres */}
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Genres
                      </h3>
                    </div>
                    <motion.div
                      className="flex flex-wrap gap-2"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.08 } },
                      }}
                    >
                      {genres.map((genre, index) => (
                        <motion.span
                          key={`${genre}-${index}`}
                          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 cursor-default ${
                            genreColorMap[genre] ||
                            'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg shadow-gray-500/25'
                          }`}
                          variants={{
                            hidden: { opacity: 0, y: 15, scale: 0.8 },
                            visible: { opacity: 1, y: 0, scale: 1 },
                          }}
                          whileHover={{
                            scale: 1.05,
                            y: -1,
                            transition: { duration: 0.15 },
                          }}
                        >
                          {genre}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    className="flex justify-start pt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => {
                        if (id) {
                          navigate(title ? `/movie/${id}` : `/tv/${id}`);
                          setIsOpen(false);
                        }
                      }}
                    >
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl shadow-purple-500/25 border-0 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 px-6 py-2.5 rounded-xl font-semibold">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                        <Play className="h-3 w-3 ml-2" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Overview */}
              <motion.div
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl p-6 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ scale: 1.005, transition: { duration: 0.15 } }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Overview
                  </h3>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {overview}
                </p>
              </motion.div>


            </motion.div>
          </CardContent>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
