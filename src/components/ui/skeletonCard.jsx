function SkeletonCard({ delay = 0 }) {
    return (
        <div className="animate-pulse flex items-start gap-4" style={{ animationDelay: `${delay}s` }}>
            <div className="w-[100px] h-[150px] bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="space-y-2 flex-1">
                <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="w-3/4 h-3 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
        </div>
    );
}

export default SkeletonCard;
