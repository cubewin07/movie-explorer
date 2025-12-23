import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthen } from '../../../context/AuthenProvider';
import { useProfileStats } from '../../../hooks/profile/useProfileStats';
import { useProfileEdit } from '../../../hooks/profile/useProfileEdit';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileEditDialog from './ProfileEditDialog';

const defaultUserData = {
    bio: 'Tell us about yourself...',
    stats: {
        watchlist: 0,
        reviews: 0,
        favorites: 0,
    },
    recent: []
};

/**
 * Profile Component
 * Main profile page displaying user information and statistics
 */
export default function Profile() {
    const { user: authUser } = useAuthen();

    // Calculate stats from auth user
    const stats = useProfileStats(authUser);

    // Profile edit state management
    const editState = useProfileEdit({
        ...defaultUserData,
        avatar: authUser?.avatar || '',
        username: authUser?.username || 'Guest',
        email: authUser?.email || '',
        bio: authUser?.bio || defaultUserData.bio,
        stats,
        recent: authUser?.recent || defaultUserData.recent,
    });

    const [user, setUser] = useState({
        ...defaultUserData,
        avatar: authUser?.avatar || '',
        username: authUser?.username || 'Guest',
        email: authUser?.email || '',
        bio: authUser?.bio || defaultUserData.bio,
        stats,
        recent: authUser?.recent || defaultUserData.recent,
    });

    const handleEditClick = (currentUser) => {
        editState.handleEdit(currentUser);
    };

    const handleSaveProfile = () => {
        // Update user with edited data (only bio is updated as per original logic)
        setUser(prev => ({
            ...prev,
            bio: editState.editData.bio,
            username: editState.editData.username,
            email: editState.editData.email,
        }));
        editState.handleClose();
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
                {/* Profile Header */}
                <ProfileHeader
                    user={user}
                    onEdit={handleEditClick}
                    avatarPreview={editState.avatarPreview}
                />

                {/* Profile Stats & Recent Activity */}
                <ProfileStats
                    stats={user.stats}
                    recent={user.recent}
                />
            </motion.div>

            {/* Edit Profile Dialog */}
            <ProfileEditDialog
                isOpen={editState.editOpen}
                onClose={editState.handleClose}
                editData={editState.editData}
                onEditDataChange={editState.updateEditData}
                avatarPreview={editState.avatarPreview}
                onAvatarChange={editState.handleAvatarChange}
                onSave={handleSaveProfile}
            />
        </motion.div>
    );
}
