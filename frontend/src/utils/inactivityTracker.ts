let inactivityTimer: NodeJS.Timeout | null = null;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export const setupInactivityTracker = (onInactive: () => void) => {
  const resetTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    inactivityTimer = setTimeout(onInactive, INACTIVITY_TIMEOUT);
  };

  // Reset timer on user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  const handleActivity = () => {
    resetTimer();
  };

  // Add event listeners
  activityEvents.forEach(event => {
    document.addEventListener(event, handleActivity);
  });

  // Initial setup
  resetTimer();

  // Cleanup function
  return () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    activityEvents.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
  };
};
