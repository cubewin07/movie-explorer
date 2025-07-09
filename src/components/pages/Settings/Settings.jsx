import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, User, Mail, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthen } from '@/context/AuthenProvider';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { Toaster, toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Settings() {
    const { user, logout } = useAuthen();
    const [isDark, setIsDark] = useThemeToggle();
    const [theme, setTheme] = useState(isDark ? 'dark' : 'light');
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const logoutTimeoutRef = useRef(null);

    const handleThemeChange = (val) => {
        setTheme(val);
        setIsDark(val === 'dark');
    };

    const handleProfileChange = (e) => {
        setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1200); // Simulate save
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        // Show toast with undo
        const id = toast('You have been logged out', {
            action: {
                label: 'Undo',
                onClick: () => {
                    clearTimeout(logoutTimeoutRef.current);
                    toast.success('Logout cancelled');
                },
            },
            duration: 5000,
        });
        // Actually logout after delay if not undone
        logoutTimeoutRef.current = setTimeout(() => {
            toast.dismiss(id);
            logout();
        }, 5000);
    };

    return (
        <div className="max-w-2xl mx-auto w-full px-2 sm:px-6 py-10 flex flex-col gap-10">
            {/* Profile Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 flex flex-col gap-6"
            >
                <motion.h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                    <User className="w-6 h-6 text-blue-500 dark:text-blue-400" /> Profile
                </motion.h2>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={profile.username}
                            onChange={handleProfileChange}
                            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleProfileChange}
                            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled
                        />
                    </div>
                </div>
            </motion.section>

            {/* Theme Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 flex flex-col gap-6"
            >
                <motion.h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Sun className="w-6 h-6 text-yellow-400" /> Theme
                </motion.h2>
                <div className="flex gap-4">
                    <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                        onClick={() => handleThemeChange('light')}
                    >
                        <Sun className="w-5 h-5" /> Light
                    </Button>
                    <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                        onClick={() => handleThemeChange('dark')}
                    >
                        <Moon className="w-5 h-5" /> Dark
                    </Button>
                    <Button
                        variant={theme === 'system' ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                        onClick={() => handleThemeChange('system')}
                        disabled
                    >
                        <Monitor className="w-5 h-5" /> System
                    </Button>
                </div>
            </motion.section>

            {/* Account Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 flex flex-col gap-6"
            >
                <motion.h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Mail className="w-6 h-6 text-green-500 dark:text-green-400" /> Account
                </motion.h2>
                <div className="flex gap-4 flex-wrap">
                    <Button variant="outline" className="flex items-center gap-2" onClick={handleLogout}>
                        <LogOut className="w-5 h-5" /> Logout
                    </Button>
                    <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5" /> Delete Account
                    </Button>
                </div>
            </motion.section>

            {/* Save/Cancel */}
            <motion.div
                className="flex gap-4 justify-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Button variant="outline" className="px-6">
                    Cancel
                </Button>
                <Button onClick={handleSave} className="px-6" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </motion.div>

            {/* Logout Confirmation Modal */}
            <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
                <DialogContent>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogDescription>Are you sure you want to log out?</DialogDescription>
                    <div className="flex gap-4 justify-end mt-6">
                        <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmLogout}>
                            Logout
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
