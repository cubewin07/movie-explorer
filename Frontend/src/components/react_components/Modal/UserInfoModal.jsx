import React from 'react';

const UserInfoModal = ({ isOpen, onClose, userInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">User Information</h2>
        {userInfo ? (
          <div>
            <p><strong>ID:</strong> {userInfo.id}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Username:</strong> {userInfo.username}</p>
            <p><strong>Status:</strong> {userInfo.status || 'N/A'}</p>
            <div>
              <h3 className="font-semibold mt-4">Watchlist:</h3>
              <p><strong>Movies:</strong> {userInfo.watchlist.moviesId.join(', ') || 'None'}</p>
              <p><strong>Series:</strong> {userInfo.watchlist.seriesId.join(', ') || 'None'}</p>
            </div>
          </div>
        ) : (
          <p>Loading user information...</p>
        )}
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UserInfoModal;