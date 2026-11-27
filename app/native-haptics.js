// Haptic cues for the native app through the Capacitor Haptics plugin, since
// WKWebView has no navigator.vibrate. lumen-feedback.js calls these by kind.
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

if (Capacitor.isNativePlatform()) {
  const quiet = () => {};
  window.LumenHaptics = {
    tap: () => Haptics.impact({ style: ImpactStyle.Light }).catch(quiet),
    solved: () => Haptics.notification({ type: NotificationType.Success }).catch(quiet),
    out: () => Haptics.notification({ type: NotificationType.Warning }).catch(quiet),
  };
}
