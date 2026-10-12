import ringtoneSound from '../../assets/ringtone.mp3';
import alertSound from '../../assets/alert.mp3';
import drimStyleLogo from '../../assets/DrimStylelogo.png';

let isAudioUnlocked = false;

// Function to unlock audio autoplay on user gesture
export const unlockAudio = () => {
  if (isAudioUnlocked) return;
  try {
    const silent = new Audio(ringtoneSound);
    silent.volume = 0.01;
    silent.play().then(() => {
      silent.pause();
      silent.currentTime = 0;
      isAudioUnlocked = true;
      console.log('[Sound] Audio unlocked for real-time notifications');
    }).catch(() => {});
  } catch (e) {}
};

if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    unlockAudio();
    window.removeEventListener('click', handleInteraction);
    window.removeEventListener('touchstart', handleInteraction);
    window.removeEventListener('keydown', handleInteraction);
  };
  window.addEventListener('click', handleInteraction, { passive: true });
  window.addEventListener('touchstart', handleInteraction, { passive: true });
  window.addEventListener('keydown', handleInteraction, { passive: true });
}

// Play either ringtone or alert sound
export const playNotificationSound = async (type = 'ringtone') => {
  try {
    const soundSrc = type === 'alert' ? alertSound : ringtoneSound;
    const audio = new Audio(soundSrc);
    audio.volume = 1.0;
    await audio.play();
    console.log(`[Sound] Successfully played ${type} sound`);
  } catch (err) {
    console.warn(`[Sound] Autoplay policy prevented playback of ${type}:`, err);
  }
};

// Request browser notification permission if not yet decided
export const requestBrowserNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      return 'denied';
    }
  }
  return Notification.permission;
};

// Deduplication map to prevent multiple alerts within 10 seconds for the same booking
const recentAlerts = new Map();

/**
 * Dispatches real-time sound and browser notification for booking events.
 * Guarantees no duplicate playback / notification within 10 seconds.
 */
export const handleRealtimeBookingAlert = ({ type, booking, role = 'salon' }) => {
  if (!booking) return;
  const bookingId = booking._id || booking.id || 'unknown';
  const alertKey = `${type}_${bookingId}`;

  const now = Date.now();
  if (recentAlerts.has(alertKey) && now - recentAlerts.get(alertKey) < 10000) {
    console.log(`[Alert] Suppressed duplicate alert: ${alertKey}`);
    return;
  }
  recentAlerts.set(alertKey, now);

  // Clean stale keys
  for (const [k, time] of recentAlerts.entries()) {
    if (now - time > 20000) recentAlerts.delete(k);
  }

  const isCreated = type === 'BOOKING_CREATED';
  const soundType = isCreated ? 'ringtone' : 'alert';

  // 1. Play sound
  playNotificationSound(soundType);

  // 2. Native browser notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      let title = '';
      let body = '';
      const tag = `${isCreated ? 'booking' : 'cancel'}-${bookingId}`;

      if (isCreated) {
        title = role === 'admin'
          ? `New Booking: ${booking.salonName || 'Partner Salon'} 🎉`
          : `New Booking Received! 🎉`;
        body = `${booking.customerName || 'Customer'} booked for ${booking.time || ''} on ${booking.dateKey || ''} (#${bookingId})`;
      } else {
        title = `Booking Cancelled ⚠️`;
        body = `Booking #${bookingId} for ${booking.customerName || 'Customer'} has been cancelled.`;
      }

      const notif = new Notification(title, {
        body,
        icon: drimStyleLogo || '/DrimStylelogo.png',
        badge: drimStyleLogo || '/DrimStylelogo.png',
        tag,
        renotify: true
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('[Notification] Error showing browser notification:', err);
    }
  }
};
