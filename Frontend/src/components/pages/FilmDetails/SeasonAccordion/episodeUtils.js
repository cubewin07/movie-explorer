/**
 * Utility functions for episode data handling and validation
 */

/**
 * Check if an episode's air date is in the future
 * @param {string} dateStr - Date string in ISO format (YYYY-MM-DD)
 * @returns {boolean} - True if date is in the future
 */
export const isFutureDate = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  const airDate = new Date(dateStr);
  return airDate > today;
};

/**
 * Check if an episode is missing an image
 * @param {object} episode - Episode object from TMDB API
 * @returns {boolean} - True if still_path is missing
 */
export const isImageMissing = (episode) => {
  return !episode?.still_path;
};

/**
 * Get the episode status type
 * @param {object} episode - Episode object
 * @returns {string} - Status: 'missing', 'future', or 'available'
 */
export const getEpisodeStatus = (episode) => {
  if (isImageMissing(episode)) return 'missing';
  if (isFutureDate(episode.air_date)) return 'future';
  return 'available';
};

/**
 * Get styling classes for episode card based on status
 * @param {object} episode - Episode object
 * @returns {object} - Object with borderClass, bgClass, shadowClass
 */
export const getEpisodeCardStyles = (episode) => {
  const isMissing = isImageMissing(episode);
  const isFuture = isFutureDate(episode.air_date);

  return {
    borderClass: isMissing
      ? 'border-amber-200 dark:border-amber-700/50'
      : isFuture
      ? 'border-indigo-200 dark:border-indigo-700/50'
      : 'border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600',
    bgClass: isMissing
      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10'
      : isFuture
      ? 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10'
      : 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700',
    shadowClass: isMissing
      ? 'shadow-amber-100 dark:shadow-amber-900/20'
      : isFuture
      ? 'shadow-indigo-100 dark:shadow-indigo-900/20'
      : 'hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20',
  };
};

/**
 * Get styling classes for date/time text based on episode status
 * @param {object} episode - Episode object
 * @returns {string} - Tailwind classes for text color
 */
export const getDateTimeTextClass = (episode) => {
  const isMissing = isImageMissing(episode);
  const isFuture = isFutureDate(episode.air_date);

  return isMissing
    ? 'font-semibold text-amber-700 dark:text-amber-400'
    : isFuture
    ? 'font-medium text-indigo-700 dark:text-indigo-400'
    : 'text-slate-500 dark:text-slate-400';
};

/**
 * Build TMDB image URL for episode still
 * @param {string} stillPath - Still path from TMDB
 * @returns {string} - Full image URL
 */
export const getEpisodeImageUrl = (stillPath) => {
  return `https://image.tmdb.org/t/p/w300${stillPath}`;
};

/**
 * Get badge configuration for episode status
 * @param {object} episode - Episode object
 * @returns {object|null} - Badge config with icon, text, and class, or null if no badge
 */
export const getEpisodeBadgeConfig = (episode) => {
  const isMissing = isImageMissing(episode);
  const isFuture = isFutureDate(episode.air_date);

  if (isMissing) {
    return {
      type: 'coming',
      icon: 'Clock',
      label: 'Coming Soon',
      class: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900',
    };
  }

  if (isFuture) {
    return {
      type: 'airs',
      icon: 'Star',
      label: 'Airs Soon',
      class: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white',
    };
  }

  return {
    type: 'available',
    icon: 'Eye',
    label: 'Available',
    class: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300',
  };
};

/**
 * Format episode display name
 * @param {object} episode - Episode object
 * @returns {string} - Formatted name with episode number
 */
export const formatEpisodeName = (episode) => {
  return `${episode.episode_number}. ${episode.name}`;
};

/**
 * Get fallback episode overview
 * @param {string} overview - Episode overview from API
 * @returns {string} - Overview or fallback message
 */
export const getEpisodeOverview = (overview) => {
  return overview || 'No description available for this episode.';
};
