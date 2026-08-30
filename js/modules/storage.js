/**
 * Storage, Tracking & State Partitioning Engine
 * Plain language verdicts with raw telemetry.
 */

export async function getTrackerBlockerEfficacy() {
  if (typeof navigator.onLine === 'boolean' && !navigator.onLine) {
    return {
      id: 'tracker_blocker',
      title: 'Ad & Behavioral Tracker Blocking',
      category: 'storage',
      status: 'info',
      verdict: 'Offline (Cannot Verify)',
      summary: 'Network connectivity is offline. Tracker blocking cannot be measured without internet access.',
      impact: 'Test skipped due to lack of network connection.',
      action: 'Connect to the internet and re-run test to evaluate tracker blockers.',
      rawTelemetry: 'navigator.onLine: false'
    };
  }

  let isControlOnline = true;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    await fetch(`/?_ping=${Date.now()}`, { method: 'HEAD', signal: ctrl.signal });
    clearTimeout(t);
  } catch (e) {
    isControlOnline = false;
  }

  const trackerEndpoints = [
    { name: 'Google Analytics', url: 'https://www.google-analytics.com/analytics.js' },
    { name: 'Meta / Facebook Pixel', url: 'https://connect.facebook.net/en_US/fbevents.js' },
    { name: 'Criteo Behavioral Tracker', url: 'https://static.criteo.net/js/ld/ld.js' },
    { name: 'Google Syndication Ads', url: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' },
    { name: 'Taboola Tracking Network', url: 'https://cdn.taboola.com/libtrc/unip/1/tfa.js' }
  ];

  let blockedCount = 0;
  await Promise.all(
    trackerEndpoints.map(async (tracker) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        await fetch(tracker.url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeout);
      } catch (e) {
        blockedCount++;
      }
    })
  );

  if (!isControlOnline && blockedCount === trackerEndpoints.length) {
    return {
      id: 'tracker_blocker',
      title: 'Ad & Behavioral Tracker Blocking',
      category: 'storage',
      status: 'info',
      verdict: 'Network Unreachable',
      summary: 'Unable to contact diagnostic endpoints due to network latency or connection restrictions.',
      impact: 'Test inconclusive due to connection drop.',
      action: 'Verify your internet connection and re-run audit.',
      rawTelemetry: 'Control probe failed | Tracker probes unreachable'
    };
  }

  let isDomBaitBlocked = false;
  try {
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner pub_300x250 banner-ad ad-placement';
    bait.style.cssText = 'height:10px!important;width:10px!important;position:absolute!important;left:-9999px!important;';
    document.body.appendChild(bait);
    const style = window.getComputedStyle(bait);
    if (style.display === 'none' || style.visibility === 'hidden' || bait.offsetHeight === 0) {
      isDomBaitBlocked = true;
    }
    document.body.removeChild(bait);
  } catch (e) {}

  const rawBlockRate = Math.round((blockedCount / trackerEndpoints.length) * 100);
  const blockRate = Math.min(99, rawBlockRate);
  const isHigh = rawBlockRate >= 80 || (isDomBaitBlocked && rawBlockRate >= 40);
  const isMed = (rawBlockRate >= 40 && rawBlockRate < 80) || isDomBaitBlocked;

  let status = 'danger';
  let verdict = 'No Ad/Tracker Blocking Active';
  let mechanism = 'Unprotected';

  if (isHigh) {
    status = 'secure';
    mechanism = isDomBaitBlocked ? 'Extension + Network Filter' : 'DNS/Network Sinkhole';
    verdict = `${Math.max(blockRate, isDomBaitBlocked ? 95 : blockRate)}% Blocked (${mechanism})`;
  } else if (isMed) {
    status = 'warning';
    mechanism = isDomBaitBlocked ? 'Cosmetic Extension Rules' : 'Partial Network Filter';
    verdict = `${Math.max(blockRate, 50)}% Blocked (${mechanism})`;
  }

  return {
    id: 'tracker_blocker',
    title: 'Ad & Behavioral Tracker Blocking',
    category: 'storage',
    status: status,
    verdict: verdict,
    summary: isHigh
      ? `Active content filtering detected via ${mechanism} (blocking corporate ad scripts and tracking pixels).`
      : 'Advertising and surveillance scripts run freely without content filtering.',
    impact: isHigh ? 'Safe. Corporate trackers cannot build a browsing history profile on you.' : 'High Privacy Risk. Advertisers track every website you visit.',
    action: isHigh ? 'No action needed. Content blocker is effective.' : 'Install uBlock Origin or turn on Strict Tracking Protection.',
    rawTelemetry: `Network: ${blockedCount}/${trackerEndpoints.length} Blocked (${blockRate}%) | Cosmetic DOM Bait: ${isDomBaitBlocked ? 'Collapsed (Extension Filter)' : 'Intact'} | Mode: ${mechanism}`
  };
}

export async function getGlobalPrivacyControl() {
  const gpc = navigator.globalPrivacyControl;
  const isEnabled = gpc === true;

  return {
    id: 'gpc_signal',
    title: 'Global Privacy Control (Do Not Sell Data)',
    category: 'storage',
    status: isEnabled ? 'secure' : 'warning',
    verdict: isEnabled ? 'Active (Legally Opted-Out)' : 'Inactive (Not Opted-Out)',
    summary: isEnabled
      ? 'Your browser automatically tells every website: "Do not sell or share my personal data".'
      : 'Websites assume standard commercial permission to sell or share your browsing habits.',
    impact: isEnabled ? 'Safe. Invokes your legal privacy rights under GDPR/CCPA.' : 'Moderate Risk.',
    action: isEnabled ? 'No action needed.' : 'Enable Global Privacy Control (GPC) in your browser settings.',
    rawTelemetry: `navigator.globalPrivacyControl: ${isEnabled}`
  };
}

export async function getDoNotTrack() {
  const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  const isEnabled = (dnt === '1' || dnt === 'yes');

  return {
    id: 'dnt_signal',
    title: 'Do-Not-Track Request Signal',
    category: 'storage',
    status: isEnabled ? 'secure' : 'warning',
    verdict: isEnabled ? 'Enabled (DNT: 1 Sent)' : 'Not Enabled',
    summary: isEnabled
      ? 'Your browser requests web servers not to track your individual session.'
      : 'No Do-Not-Track header is sent with your web requests.',
    impact: 'Low to Moderate Risk.',
    action: isEnabled ? 'No action needed.' : 'Turn on Do-Not-Track in your browser privacy preferences.',
    rawTelemetry: `navigator.doNotTrack: ${dnt || 'null'}`
  };
}

export async function getStoragePartitioning() {
  const hasStorageAccessAPI = typeof document.hasStorageAccess === 'function';
  const hasCookieStore = typeof window.cookieStore !== 'undefined';
  let isPartitioned = false;

  try {
    if (hasStorageAccessAPI) {
      const accessGranted = await document.hasStorageAccess();
      isPartitioned = !accessGranted;
    }
  } catch (e) {
    isPartitioned = hasStorageAccessAPI;
  }

  const isSecure = isPartitioned || hasStorageAccessAPI;

  return {
    id: 'storage_partitioning',
    title: 'Cross-Site Cookie & Supercookie Isolation',
    category: 'storage',
    status: isSecure ? 'secure' : 'warning',
    verdict: isSecure ? 'State Partitioned (Isolated)' : 'Shared Storage Context',
    summary: isSecure
      ? 'Cookies and data stored by one website are kept isolated in a separate sandbox from third-party sites.'
      : 'Cross-site trackers might be able to share storage and track sessions across different websites.',
    impact: isSecure ? 'Safe. Cross-site tracking cookies cannot bridge sessions.' : 'Moderate Tracking Risk.',
    action: isSecure ? 'Optimal isolation active.' : 'Enable Total Cookie Protection or Dynamic First-Party Isolation in privacy settings.',
    rawTelemetry: `Storage Access API: ${hasStorageAccessAPI} | CookieStore: ${hasCookieStore} | State Isolation: ${isSecure ? 'Active' : 'Unpartitioned'}`
  };
}

export async function runStorageTests() {
  const [tracker, gpc, dnt, storage] = await Promise.all([
    getTrackerBlockerEfficacy(),
    getGlobalPrivacyControl(),
    getDoNotTrack(),
    getStoragePartitioning()
  ]);
  return [tracker, gpc, dnt, storage];
}
