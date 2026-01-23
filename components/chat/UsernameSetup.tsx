'use client';

import { useState } from 'react';

interface UsernameSetupProps {
  walletAddress: string;
  onUsernameSet: (username: string) => void;
  currentUsername?: string | null;
}

export function UsernameSetup({ walletAddress, onUsernameSet, currentUsername }: UsernameSetupProps) {
  const [username, setUsername] = useState(currentUsername || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!currentUsername;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to set username');
        return;
      }

      onUsernameSet(data.username);
    } catch {
      setError('Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/30">
      <h3 className="text-lg font-medium mb-2">
        {isEditing ? 'Change Username' : 'Choose a Username'}
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        {isEditing
          ? 'Enter a new username below.'
          : 'Pick a username to start posting in the forum.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            maxLength={20}
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            3-20 characters, letters, numbers, and underscores only
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || username.length < 3 || username === currentUsername}
          className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Username' : 'Set Username'}
        </button>
      </form>
    </div>
  );
}
