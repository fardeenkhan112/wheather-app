import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [reconnectedSinceOffline, setReconnectedSinceOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnectedSinceOffline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setReconnectedSinceOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const acknowledgeReconnection = () => {
    setReconnectedSinceOffline(false);
  };

  return {
    isOnline,
    reconnectedSinceOffline,
    acknowledgeReconnection,
  };
}
