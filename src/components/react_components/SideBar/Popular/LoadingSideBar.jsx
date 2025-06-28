function LoadingSideBar() {
    return (
        <div className="flex flex-col gap-3 sm:gap-5">
            {Array(3)
                .fill(0)
                .map((_, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4">
                        {/* Poster skeleton */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg skeleton" />

                        {/* Text content */}
                        <div className="flex flex-col justify-between w-full">
                            <div className="space-y-2">
                                <div className="h-3 sm:h-4 w-2/3 skeleton rounded" />
                                <div className="h-2 w-1/2 skeleton rounded" />
                            </div>
                            <div className="h-4 sm:h-5 w-14 sm:w-16 skeleton rounded" />
                        </div>
                    </div>
                ))}
            <div className="h-6 sm:h-8 w-full skeleton rounded" />
        </div>
    );
}

export default LoadingSideBar;
