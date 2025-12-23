import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { User, Edit2, Camera } from 'lucide-react';

/**
 * ProfileHeader Component
 * Displays user avatar, username, email, and bio with edit functionality
 */
export default function ProfileHeader({ user, onEdit, avatarPreview }) {
    return (
        <div className="flex flex-col items-center gap-4 md:w-1/3 w-full">
            {/* Avatar */}
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
                    onClick={() => onEdit(user)}
                >
                    <Camera className="w-5 h-5 text-purple-500" />
                </Button>
            </div>

            {/* User Info */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">{user.username}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                <p className="mt-2 text-base text-gray-700 dark:text-gray-200 max-w-xs mx-auto">{user.bio}</p>
            </div>

            {/* Edit Button */}
            <Button
                className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-full shadow hover:from-pink-600 hover:to-purple-700"
                onClick={() => onEdit(user)}
            >
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
        </div>
    );
}
