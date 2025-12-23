import { useState } from 'react';

const defaultUserData = {
    bio: 'Tell us about yourself...',
    username: 'Guest',
    email: '',
};

/**
 * Custom hook to manage profile editing state and logic
 * @param {Object} initialUser - Initial user data
 * @returns {Object} Edit state and handlers
 */
export function useProfileEdit(initialUser) {
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState({ ...defaultUserData });
    const [avatarPreview, setAvatarPreview] = useState('');

    const handleEdit = (user) => {
        setEditData({ ...user });
        setAvatarPreview('');
        setEditOpen(true);
    };

    const handleClose = () => {
        setEditOpen(false);
        setEditData({ ...defaultUserData });
        setAvatarPreview('');
    };

    const handleSave = (onSave) => {
        onSave(editData);
        handleClose();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setAvatarPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const updateEditData = (updates) => {
        setEditData(prev => ({ ...prev, ...updates }));
    };

    return {
        editOpen,
        setEditOpen,
        editData,
        setEditData,
        avatarPreview,
        setAvatarPreview,
        handleEdit,
        handleClose,
        handleSave,
        handleAvatarChange,
        updateEditData,
    };
}
