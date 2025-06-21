import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
            <div className="relative max-w-4xl mx-auto min-h-[320px] flex items-center">
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
                                    <div className="flex flex-wrap gap-2">
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
