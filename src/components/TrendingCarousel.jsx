import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// ...imports remain unchanged
export function TrendingCarousel({ items }) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrent((prev) => (prev + 1) % items.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [items.length]);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
        }),
    };

    const next = () => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % items.length);
    };
    const prev = () => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + items.length) % items.length);
    };

    return (
        <section className="relative py-12 md:py-20 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl shadow-lg overflow-hidden">
            <div className="relative max-w-4xl mx-auto min-h-[360px] flex items-center">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 },
                            scale: { duration: 0.4 },
                        }}
                        className="absolute inset-0 w-full h-full flex items-center"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8 w-full px-8">
                            <img
                                src={items[current].image}
                                alt={items[current].title}
                                className="w-48 h-72 object-cover rounded-xl shadow-lg"
                            />
                            <div className="flex-1">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {items[current].title}
                                </h2>
                                {items[current].year && (
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2 mr-2">
                                        {items[current].year}
                                    </span>
                                )}
                                {items[current].rating && (
                                    <span className="inline-block bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow mb-2">
                                        ★ {items[current].rating}
                                    </span>
                                )}
                                <p className="text-gray-700 mb-4">{items[current].description}</p>

                                {items[current].extra && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {items[current].extra.map((e, i) => (
                                            <span
                                                key={i}
                                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                            >
                                                {e}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-4 mt-4">
                                    {/* View Details – Gradient + Icon + Hover Glow */}
                                    <button
                                        onClick={() => console.log('View details:', items[current])}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold 
                   text-white bg-gradient-to-r from-blue-500 to-cyan-500 
                   shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300
                   dark:from-blue-600 dark:to-cyan-600"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 17h5l-1.405-1.405M21 21l-6-6m0 0a7 7 0 10-9.9 0 7 7 0 009.9 0z"
                                            />
                                        </svg>
                                        View Details
                                    </button>

                                    {/* Add to List – Outline + Icon + Improved Hover */}
                                    <button
                                        onClick={() => console.log('Add to list:', items[current])}
                                        className="flex items-center gap-2 px-5 py-2 border border-blue-500 text-blue-600 
                   text-sm font-medium rounded-lg bg-transparent 
                   hover:bg-blue-50 dark:hover:bg-blue-900/20 
                   hover:shadow transition-all duration-300"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add to List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-6 mt-8 relative z-10">
                <button onClick={prev} className="p-2 rounded-full bg-white/80 hover:bg-blue-100 shadow transition">
                    <ArrowLeft className="w-5 h-5 text-blue-600" />
                </button>
                <div className="flex gap-2">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > current ? 1 : -1);
                                setCurrent(idx);
                            }}
                            className={`w-3 h-3 rounded-full transition-all ${
                                idx === current ? 'bg-blue-600 scale-125' : 'bg-blue-200 hover:bg-blue-400'
                            }`}
                        />
                    ))}
                </div>
                <button onClick={next} className="p-2 rounded-full bg-white/80 hover:bg-blue-100 shadow transition">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                </button>
            </div>
        </section>
    );
}
