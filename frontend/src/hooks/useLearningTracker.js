import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useLearningTracker() {
  const { user } = useAuth();
  
  // Track timestamps instead of a ticking counter
  const lastActiveTime = useRef(Date.now());
  const pendingSeconds = useRef(0);

  useEffect(() => {
    if (!user) return;

    // Reset the timer when the component mounts
    lastActiveTime.current = Date.now();

    const syncTime = async () => {
      // 1. If the user is actively viewing the page, calculate elapsed time
      if (!document.hidden) {
        const now = Date.now();
        const elapsed = Math.floor((now - lastActiveTime.current) / 1000);
        
        if (elapsed > 0) {
          pendingSeconds.current += elapsed;
          lastActiveTime.current = now; // Reset the baseline timestamp
        }
      }

      // 2. Sync to Supabase if we have seconds to report
      const secsToSync = pendingSeconds.current;
      if (secsToSync > 0) {
        pendingSeconds.current = 0; // Optimistic reset to prevent double-syncing
        
        try {
          await supabase.rpc('increment_learning_time', {
            user_id_param: user.id,
            added_seconds: secsToSync
          });
        } catch (err) {
          console.error("Failed to sync learning time:", err);
          // Optional: Re-add the seconds if the network request fails
          // pendingSeconds.current += secsToSync; 
        }
      }
    };

    // Sync every 60 seconds (Browser throttling won't affect timestamp accuracy)
    const syncInterval = setInterval(syncTime, 60000);

    // Handle the user switching tabs or minimizing the browser
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away: Calculate exact time spent and queue it
        const elapsed = Math.floor((Date.now() - lastActiveTime.current) / 1000);
        if (elapsed > 0) {
          pendingSeconds.current += elapsed;
        }
        syncTime(); // Immediately fire to database
      } else {
        // User came back: Restart the clock
        lastActiveTime.current = Date.now();
      }
    };

    // Handle the user closing the browser tab completely
    const handleBeforeUnload = () => {
      if (!document.hidden) {
        const elapsed = Math.floor((Date.now() - lastActiveTime.current) / 1000);
        if (elapsed > 0) pendingSeconds.current += elapsed;
      }
      
      if (pendingSeconds.current > 0) {
        // Fire-and-forget sync right as the tab closes
        supabase.rpc('increment_learning_time', {
          user_id_param: user.id,
          added_seconds: pendingSeconds.current
        }).then(); 
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup phase
    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      syncTime(); 
    };
  }, [user]);
}