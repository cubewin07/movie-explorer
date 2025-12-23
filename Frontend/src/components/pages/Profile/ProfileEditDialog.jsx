import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { User } from 'lucide-react';

/**
 * ProfileEditDialog Component
 * Modal dialog for editing profile information
 */
export default function ProfileEditDialog({
    isOpen,
    onClose,
    editData,
    onEditDataChange,
    avatarPreview,
    onAvatarChange,
    onSave,
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave();
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                        onClick={onClose}
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Avatar Upload */}
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
                                    onChange={onAvatarChange}
                                />
                                <span className="text-xs text-gray-400">Click avatar to change</span>
                            </div>

                            {/* Username Field */}
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={editData.username || ''}
                                    onChange={(e) =>
                                        onEditDataChange({ ...editData, username: e.target.value })
                                    }
                                    className="mt-1"
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editData.email || ''}
                                    onChange={(e) =>
                                        onEditDataChange({ ...editData, email: e.target.value })
                                    }
                                    className="mt-1"
                                />
                            </div>

                            {/* Bio Field */}
                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Input
                                    id="bio"
                                    value={editData.bio || ''}
                                    onChange={(e) =>
                                        onEditDataChange({ ...editData, bio: e.target.value })
                                    }
                                    className="mt-1"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end pt-4">
                                <Button type="button" variant="outline" onClick={onClose}>
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
    );
}
