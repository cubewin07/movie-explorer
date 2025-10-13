import { useEffect, useState } from 'react';
import FriendsView from './FriendsView';

export default function FriendsList({ onFriendSelect }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isSmallScreen) return null;

  return (
    <FriendsView onFriendSelect={onFriendSelect} compact />
  );
}