import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function Breadcrumb({ items }) {
    return (
        <div className="sticky top-16 z-40 mb-4 px-4 py-2 bg-white/70 dark:bg-slate-900/10 backdrop-blur-md border-gray-200 dark:border-slate-700/20 shadow-sm rounded">
            <nav className="text-sm text-gray-700 dark:text-gray-300" aria-label="Breadcrumb">
                {items.map((crumb, idx) => (
                    <span key={idx}>
                        {idx > 0 && <span className="mx-1 text-gray-400 dark:text-gray-500">/</span>}
                        <NavLink
                            to={crumb.to}
                            className={cn(
                                'hover:underline transition-colors',
                                idx === items.length - 1
                                    ? 'font-semibold text-gray-900 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-400',
                            )}
                        >
                            {crumb.name}
                        </NavLink>
                    </span>
                ))}
            </nav>
        </div>
    );
}

export default Breadcrumb;
