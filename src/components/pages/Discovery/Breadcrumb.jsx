import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

function Breadcrumb({ items }) {
    return (
        <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            {items.map((crumb, idx) => (
                <span key={idx}>
                    {idx > 0 && <span className="mx-1">/</span>}
                    <NavLink
                        to={crumb.to}
                        className={cn(
                            'hover:underline',
                            idx === items.length - 1 ? 'font-semibold text-gray-900 dark:text-white' : '',
                        )}
                    >
                        {crumb.name}
                    </NavLink>
                </span>
            ))}
        </nav>
    );
}

export default Breadcrumb;
