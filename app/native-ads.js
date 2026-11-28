// Rewarded ads for the native app through AdMob. Installs
// window.LumenAdProvider, which lumen-rewards.js prefers over its stand-in
// card. Bundled by scripts/build-app-www.js into www/lumen-native-ads.js.
import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, RewardAdPluginEvents } from '@capacitor-community/admob';

// Google's demo rewarded units always serve a test ad and never charge an
// advertiser. Playtest builds (window.LUMEN_PLAYTEST, set by the build script)
// use them so the owner's own plays never count as real traffic; release
// builds use the real units. Android keeps the demo unit until its AdMob app exists.
const DEMO_UNIT = {
  ios: 'ca-app-pub-3940256099942544/1712485313',
  android: 'ca-app-pub-3940256099942544/5224354917',
};
const LIVE_UNIT = {
  ios: 'ca-app-pub-5322824922578152/7065862871',
  android: DEMO_UNIT.android,
};
const REWARDED_UNIT = window.LUMEN_PLAYTEST ? DEMO_UNIT : LIVE_UNIT;

if (Capacitor.isNativePlatform()) {
  const adId = REWARDED_UNIT[Capacitor.getPlatform()];
  let loaded = false;

  // Consent first (Google UMP, shown only where the law requires it), then the
  // iOS tracking prompt, then the SDK. Resolves false when ads may not be
  // requested at all; a failing consent lookup still lets the SDK start.
  async function start() {
    try {
      let consent = await AdMob.requestConsentInfo();
      if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
        consent = await AdMob.showConsentForm();
      }
      if (!consent.canRequestAds) return false;
    } catch (err) {
      console.warn('AdMob consent', err);
    }
    try {
      const tracking = await AdMob.trackingAuthorizationStatus();
      if (tracking.status === 'notDetermined') await AdMob.requestTrackingAuthorization();
    } catch { /* Android has no tracking prompt */ }
    try {
      await AdMob.initialize();
      return true;
    } catch (err) {
      console.warn('AdMob init', err);
      return false;
    }
  }

  // Keeps one rewarded ad ready so the player does not wait at the out card.
  async function load() {
    if (loaded) return true;
    try {
      await AdMob.prepareRewardVideoAd({ adId });
      loaded = true;
    } catch (err) {
      console.warn('AdMob load', err);
    }
    return loaded;
  }

  const ready = start();
  ready.then((ok) => ok && load());

  window.LumenAdProvider = {
    // Resolves true only when the ad was watched to the reward; closing it
    // early rejects in the plugin and gives nothing. The plugin resolves the
    // moment the reward is earned, while the ad is still on screen, so the
    // result waits for the ad to close before the game reacts to it.
    async showRewarded() {
      if (!(await ready) || !(await load())) return false;
      loaded = false;
      const closed = new Promise((resolve) => {
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => resolve()).then((handle) => closed.then(() => handle.remove()));
      });
      try {
        await AdMob.showRewardVideoAd();
        await closed;
        return true;
      } catch {
        return false;
      } finally {
        load();
      }
    },
  };
}
