import { cn } from "@/lib/utils"

/**
 * Enhanced Skeleton component with modern gradient animations
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Skeleton variant ('default', 'shimmer', 'wave')
 * @param {number} props.delay - Animation delay in seconds
 * @param {boolean} props.rounded - Whether to use rounded corners
 */
function Skeleton({
  className,
  variant = 'default',
  delay = 0,
  rounded = true,
  ...props
}) {
  const baseClasses = cn(
    "relative overflow-hidden",
    {
      'rounded-md': rounded,
      'rounded-none': !rounded,
    },
    className
  );

  const variants = {
    default: "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse",
    shimmer: "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800",
    wave: "bg-slate-200 dark:bg-slate-800"
  };

  if (variant === 'shimmer') {
    return (
      <div 
        className={cn(baseClasses, variants[variant])} 
        style={{ animationDelay: `${delay}s` }}
        {...props}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div 
        className={cn(baseClasses, variants[variant])} 
        style={{ animationDelay: `${delay}s` }}
        {...props}
      >
        <div className="absolute inset-0 animate-[wave_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-600/50 to-transparent" />
      </div>
    );
  }

  return (
    <div 
      className={cn(baseClasses, variants[variant])} 
      style={{ animationDelay: `${delay}s` }}
      {...props} 
    />
  );
}

export { Skeleton }
