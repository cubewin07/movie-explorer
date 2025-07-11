import { cn } from '@/lib/utils';
import { useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const SidebarProvider = ({ children, open: openProp, setOpen: setOpenProp, animate = true }) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return <SidebarContext.Provider value={{ open, setOpen, animate }}>{children}</SidebarContext.Provider>;
};

export const Sidebar = ({ children, open, setOpen, animate }) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = (props) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar {...props} />
        </>
    );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                'h-full px-2 sm:px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[250px] flex-shrink-0',
                className,
            )}
            animate={{
                width: animate ? (open ? '250px' : '80px') : '250px',
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({ className, children, ...props }) => {
    const { open, setOpen } = useSidebar();
    return (
        <>
            <div
                className={cn(
                    'h-12 sm:h-10 px-2 sm:px-4 py-2 sm:py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full',
                )}
                {...props}
            >
                <div className="flex justify-end z-20 w-full">
                    <Menu
                        className="text-neutral-800 dark:text-neutral-200 cursor-pointer w-6 h-6 sm:w-5 sm:h-5"
                        onClick={() => setOpen(!open)}
                    />
                </div>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: 'easeInOut',
                            }}
                            className={cn(
                                'fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-4 sm:p-6 md:p-10 z-[100] flex flex-col justify-between',
                                className,
                            )}
                        >
                            <div
                                className="absolute right-4 sm:right-6 md:right-10 top-4 sm:top-6 md:top-10 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                                onClick={() => setOpen(!open)}
                            >
                                <X className="w-6 h-6 sm:w-5 sm:h-5" />
                            </div>
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export const SidebarLink = ({ link, className, active, ...props }) => {
    const { open, animate } = useSidebar();

    const iconWithColor =
        link.icon &&
        React.cloneElement(link.icon, {
            className: cn(
                link.icon.props.className,
                active ? 'text-primary' : 'text-muted-foreground',
                'transition-colors duration-150',
            ),
        });

    return (
        <Link
            to={link.href}
            className={cn(
                'flex items-center justify-center md:justify-start gap-2 group/sidebar py-2 px-2 sm:px-3',
                className,
                !open ? 'ml-[-20px]' : '',
            )}
            {...props}
        >
            {iconWithColor}
            <motion.span
                animate={{
                    display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 !p-0 !m-0 
                truncate max-w-[130px] overflow-hidden whitespace-nowrap"
            >
                {link.label}
            </motion.span>
        </Link>
    );
};
