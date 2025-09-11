import { useEffect, useState } from 'react';

function useThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        return (
            localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
        );
    });

    useEffect(() => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add('dark');
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return [isDark, setIsDark];
}

export { useThemeToggle };
