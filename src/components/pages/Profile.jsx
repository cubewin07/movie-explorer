import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog } from '../ui/dialog';
import { User, Star, Heart, Eye, Edit2, Camera } from 'lucide-react';

const mockUser = {
    avatar: '',
    username: 'MovieBuff123',
    email: 'moviebuff@example.com',
    bio: 'Cinephile. TV show binger. Reviewer. Always looking for the next great story.',
    stats: {
        watchlist: 34,
        reviews: 12,
        favorites: 8,
    },
    recent: [
        { type: 'watched', title: 'Inception', date: '2024-06-01' },
        { type: 'reviewed', title: 'Dune: Part Two', date: '2024-05-28' },
        { type: 'favorited', title: 'The Matrix', date: '2024-05-20' },
    ],
};

export default function Profile() {
    const [user, setUser] = useState(mockUser);
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState({ ...mockUser });
    const [avatarPreview, setAvatarPreview] = useState('');

    const handleEdit = () => {
        setEditData({ ...user });
        setAvatarPreview('');
        setEditOpen(true);
    };

    const handleSave = () => {
        setUser({ ...editData, avatar: avatarPreview || editData.avatar });
        setEditOpen(false);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setAvatarPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 px-4 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="w-full max-w-3xl mx-auto bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-8 items-center"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
            >
                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center gap-4 md:w-1/3 w-full">
                    <div className="relative group">
                        {user.avatar || avatarPreview ? (
                            <img
                                src={avatarPreview || user.avatar}
                                alt="avatar"
                                className="w-32 h-32 rounded-full object-cover border-4 border-purple-300 dark:border-purple-700 shadow-lg"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-200 to-blue-200 dark:from-slate-800 dark:to-purple-900 flex items-center justify-center border-4 border-purple-300 dark:border-purple-700 shadow-lg">
                                <User className="w-16 h-16 text-purple-400 dark:text-purple-300" />
                            </div>
                        )}
                        <Button
                            size="icon"
                            className="absolute bottom-2 right-2 bg-white/80 dark:bg-slate-800/80 border border-purple-300 dark:border-purple-700 shadow group-hover:scale-110 transition"
                            onClick={handleEdit}
                        >
                            <Camera className="w-5 h-5 text-purple-500" />
                        </Button>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">{user.username}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="mt-2 text-base text-gray-700 dark:text-gray-200 max-w-xs mx-auto">{user.bio}</p>
                    </div>
                    <Button
                        className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-full shadow hover:from-pink-600 hover:to-purple-700"
                        onClick={handleEdit}
                    >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                </div>

                {/* Stats & Recent Activity */}
                <div className="flex-1 flex flex-col gap-8 w-full">
                    {/* Stats */}
                    <div className="flex gap-4 justify-center md:justify-start">
                        <Card className="flex flex-col items-center px-6 py-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-800 dark:to-purple-900 shadow rounded-xl">
                            <Eye className="w-6 h-6 text-blue-500 mb-1" />
                            <span className="text-lg font-bold">{user.stats.watchlist}</span>
                            <span className="text-xs text-gray-500">Watchlist</span>
                        </Card>
                        <Card className="flex flex-col items-center px-6 py-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-800 dark:to-purple-900 shadow rounded-xl">
                            <Star className="w-6 h-6 text-yellow-400 mb-1" />
                            <span className="text-lg font-bold">{user.stats.reviews}</span>
                            <span className="text-xs text-gray-500">Reviews</span>
                        </Card>
                        <Card className="flex flex-col items-center px-6 py-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-800 dark:to-purple-900 shadow rounded-xl">
                            <Heart className="w-6 h-6 text-pink-500 mb-1" />
                            <span className="text-lg font-bold">{user.stats.favorites}</span>
                            <span className="text-xs text-gray-500">Favorites</span>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
                            Recent Activity
                        </h3>
                        <ul className="space-y-2">
                            {user.recent.map((item, idx) => (
                                <motion.li
                                    key={idx}
                                    className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 rounded-lg px-4 py-2 shadow-sm"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx, duration: 0.5 }}
                                >
                                    {item.type === 'watched' && <Eye className="w-4 h-4 text-blue-500" />}
                                    {item.type === 'reviewed' && <Star className="w-4 h-4 text-yellow-400" />}
                                    {item.type === 'favorited' && <Heart className="w-4 h-4 text-pink-500" />}
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{item.title}</span>
                                    <Badge className="ml-auto bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-purple-100 text-xs font-semibold px-2 py-0.5">
                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                    </Badge>
                                    <span className="text-xs text-gray-400 ml-2">{item.date}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {editOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setEditOpen(false)}
                        />
                        {/* Modal Content */}
                        <motion.div
                            className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-auto shadow-xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-300">
                                Edit Profile
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSave();
                                }}
                                className="space-y-4"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                                        {avatarPreview || editData.avatar ? (
                                            <img
                                                src={avatarPreview || editData.avatar}
                                                alt="avatar preview"
                                                className="w-20 h-20 rounded-full object-cover border-2 border-purple-400 shadow"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center border-2 border-purple-400 shadow">
                                                <User className="w-10 h-10 text-purple-400" />
                                            </div>
                                        )}
                                    </Label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <span className="text-xs text-gray-400">Click avatar to change</span>
                                </div>
                                <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={editData.username}
                                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="bio">Bio</Label>
                                    <Input
                                        id="bio"
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
