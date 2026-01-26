'use client';

import { useState } from 'react';
import { useNotifications } from '@/components/providers/NotificationProvider';

export function NotificationPrompt() {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not supported, already decided, or dismissed
  if (!isSupported || permission !== 'default' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    await requestPermission();
  };

  return (
    <div className="p-4 rounded-lg border border-blue-800/50 bg-blue-950/30 flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm text-blue-200">
          Enable notifications to get alerted when someone replies to your messages.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Later
        </button>
        <button
          onClick={handleEnable}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
        >
          Enable
        </button>
      </div>
    </div>
  );
}
