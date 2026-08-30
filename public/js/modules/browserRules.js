/**
 * Browser-Specific Hardening Intelligence Database
 * Accurate categorization: Browser Settings vs Extensions vs Engine Limitations.
 */

export function detectBrowserFamily(browserInfoOrUA) {
  if (browserInfoOrUA && typeof browserInfoOrUA === 'object' && browserInfoOrUA.family) {
    return browserInfoOrUA.family;
  }

  const ua = typeof browserInfoOrUA === 'string' ? browserInfoOrUA : navigator.userAgent;
  if (navigator.brave || ua.includes('Brave/')) return 'brave';
  if (ua.includes('TorBrowser')) return 'tor';
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Firefox/') || typeof InstallTrigger !== 'undefined') return 'firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'safari';
  if (ua.includes('Chrome/')) return 'chrome';
  return 'other';
}

export const BROWSER_RULES = {
  tracker_blocker: {
    weight: 25,
    isActionable: (family) => ['brave', 'firefox', 'chrome', 'edge', 'safari'].includes(family),
    directives: {
      chrome: 'Extension required: Chrome has no built-in ad blocker. Install uBlock Origin or AdGuard from Chrome Web Store.',
      brave: 'Settings: Go to brave://settings/shields and set Trackers & ads blocking to "Aggressive".',
      firefox: 'Settings: Go to Settings > Privacy & Security and set Enhanced Tracking Protection to "Strict".',
      edge: 'Extension required: Edge built-in tracking prevention does not block all ad scripts. Install uBlock Origin from Edge Add-ons.',
      safari: 'Extension required: Install a Safari Content Blocker (like AdGuard or Wipr) from the App Store.',
      tor: 'No action needed. Tor Browser blocks third-party trackers by design.',
      other: 'Extension required: Install uBlock Origin to block tracking scripts.'
    }
  },

  webrtc_leak: {
    weight: 20,
    isActionable: (family) => ['brave', 'firefox', 'chrome', 'edge'].includes(family),
    directives: {
      chrome: 'Extension or VPN required: Chrome settings cannot disable WebRTC. Use a VPN with WebRTC Leak Protection or install the "WebRTC Control" extension.',
      brave: 'Settings: Go to brave://settings/shields > WebRTC IP handling policy > Select "Disable non-proxied UDP".',
      firefox: 'Settings: Type about:config in address bar, search for media.peerconnection.enabled and set it to false.',
      edge: 'Extension or VPN required: Edge settings cannot disable WebRTC. Install "WebRTC Control" extension or enable VPN protection.',
      safari: 'Settings: Go to Settings > Safari > Advanced > Ensure "Hide IP address from Trackers" is active.',
      tor: 'No action needed. WebRTC is disabled by default in Tor.',
      other: 'Enable WebRTC leak protection in your VPN client or install a WebRTC toggle extension.'
    }
  },

  canvas_2d: {
    weight: 20,
    isActionable: (family) => ['brave', 'firefox', 'tor', 'safari'].includes(family),
    directives: {
      chrome: 'Engine limitation: Standard Chromium has no canvas farbling setting. Switch to Brave or Firefox for native canvas randomization.',
      brave: 'Settings: Go to brave://settings/shields and set "Fingerprinting blocking" to "Strict (may break sites)".',
      firefox: 'Settings: Type about:config in address bar, search for privacy.resistFingerprinting and set it to true.',
      edge: 'Engine limitation: Chromium engine does not support native canvas randomization.',
      safari: 'Settings: Go to Settings > Advanced and enable "Advanced Tracking and Fingerprinting Protection".',
      tor: 'No action needed. Tor Browser enforces canvas drawing prompts by default.',
      other: 'Engine limitation: Anti-fingerprinting requires specialized browser engines.'
    }
  },

  webgl_info: {
    weight: 15,
    isActionable: (family) => ['firefox', 'tor', 'brave', 'safari'].includes(family),
    directives: {
      chrome: 'Engine limitation: Chrome broadcasts your unmasked GPU model by design. Cannot be hidden via Chrome settings.',
      brave: 'Settings: Set Fingerprint Protection to "Strict" in brave://settings/shields to randomize WebGL parameters.',
      firefox: 'Settings: Set privacy.resistFingerprinting to true in about:config to spoof generic graphics parameters.',
      edge: 'Engine limitation: Graphics hardware identification cannot be disabled in Edge settings.',
      safari: 'Settings: Enable Advanced Fingerprinting Protection in Safari Advanced Settings.',
      tor: 'No action needed. Tor masks all GPU identifiers to generic software renderers.',
      other: 'Engine limitation: Requires privacy-hardened browser.'
    }
  },

  audio_context: {
    weight: 15,
    isActionable: (family) => ['brave', 'firefox', 'tor', 'safari'].includes(family),
    directives: {
      chrome: 'Engine limitation: Chrome lacks audio noise injection. Switch to Brave or hardened Firefox.',
      brave: 'Settings: Strict Shields in brave://settings/shields automatically injects noise into AudioContext.',
      firefox: 'Settings: Set privacy.resistFingerprinting to true in about:config to clamp audio buffers and add noise.',
      edge: 'Engine limitation: AudioContext DSP noise injection is not supported in Chromium settings.',
      safari: 'Settings: AudioContext noise is restricted in Safari private browsing with Advanced Tracking Protection.',
      tor: 'No action needed. AudioContext is randomized or disabled in Tor.',
      other: 'Engine limitation: Requires privacy browser engine.'
    }
  },

  gpc_signal: {
    weight: 10,
    isActionable: (family) => ['brave', 'firefox', 'chrome', 'edge'].includes(family),
    directives: {
      chrome: 'Extension required: Chrome has no GPC toggle in settings. Install the "Global Privacy Control" extension from Chrome Web Store.',
      brave: 'Settings: Go to brave://settings/shields and ensure "Global Privacy Control (GPC)" is switched On.',
      firefox: 'Settings: Go to Settings > Privacy & Security > Check "Tell websites not to sell or share my data (GPC)".',
      edge: 'Extension required: Edge only has legacy DNT. Install the GPC extension from Edge Add-ons.',
      safari: 'Settings: Enabled automatically in Safari Private Browsing on macOS Sonoma / iOS 17+.',
      tor: 'No action needed. GPC signals are transmitted by default.',
      other: 'Install GPC extension or enable in preferences.'
    }
  },

  storage_partitioning: {
    weight: 15,
    isActionable: (family) => ['chrome', 'edge', 'firefox', 'brave', 'safari'].includes(family),
    directives: {
      chrome: 'Settings: Go to chrome://settings/cookies and select "Block third-party cookies".',
      brave: 'Settings: Go to brave://settings/shields and ensure "Block cross-site cookies" is active.',
      firefox: 'Settings: Settings > Privacy & Security > Set Tracking Protection to "Strict" for Total Cookie Protection.',
      edge: 'Settings: Go to edge://settings/content/cookies and toggle "Block third-party cookies".',
      safari: 'Settings: Go to Settings > Safari > Privacy & Security > Enable "Prevent Cross-Site Tracking".',
      tor: 'No action needed. Total first-party domain isolation is active by default.',
      other: 'Settings: Enable third-party cookie blocking in settings.'
    }
  },

  font_metrics: {
    weight: 10,
    isActionable: (family) => ['firefox', 'tor', 'brave', 'safari'].includes(family),
    directives: {
      chrome: 'Engine limitation: Chrome allows web pages to measure system fonts. Cannot be blocked in Chrome settings.',
      brave: 'Settings: Set Fingerprinting blocking to "Strict" in brave://settings/shields to standardize font metrics.',
      firefox: 'Settings: Set privacy.resistFingerprinting to true in about:config to restrict font visibility to standard fonts.',
      edge: 'Engine limitation: System font enumeration cannot be disabled in Edge settings.',
      safari: 'Settings: Safari standardizes font lists under Advanced Tracking Protection.',
      tor: 'No action needed. Font list is strictly standardized in Tor.',
      other: 'Engine limitation.'
    }
  },

  battery_sensors: {
    weight: 10,
    isActionable: true,
    directives: {
      chrome: 'Update: Update Chrome to the latest version to deprecate legacy Battery Status API.',
      brave: 'No action needed. Battery Status API is disabled by default in Brave.',
      firefox: 'No action needed. Battery API is completely removed in modern Firefox.',
      edge: 'Update: Update Microsoft Edge to ensure battery telemetry is deprecated.',
      safari: 'No action needed. Safari does not support the Battery Status API.',
      tor: 'No action needed. Battery API is absent.',
      other: 'Update browser to latest version.'
    }
  },

  media_devices: {
    weight: 10,
    isActionable: true,
    directives: {
      chrome: 'Settings: Go to chrome://settings/content > Camera & Microphone > Set to "Don\'t allow sites to see your camera/mic".',
      brave: 'Settings: Go to brave://settings/content > Reset all site permissions for Camera and Microphone.',
      firefox: 'Settings: Go to Settings > Privacy & Security > Permissions > Settings for Camera/Mic > Check "Block new requests".',
      edge: 'Settings: Go to edge://settings/content > Manage Camera and Microphone permissions.',
      safari: 'Settings: Go to Settings > Websites > Camera/Microphone > Change to "Deny" for untrusted sites.',
      tor: 'No action needed. Media device enumeration is sandboxed.',
      other: 'Settings: Revoke media device permissions in site settings.'
    }
  },

  hardware_cpu_memory: {
    weight: 10,
    isActionable: (family) => ['firefox', 'tor'].includes(family),
    directives: {
      chrome: 'Engine limitation: Chromium natively reports CPU threads and RAM. Cannot be changed in Chrome settings.',
      brave: 'Engine limitation: CPU concurrency and memory are reported by the Chromium core.',
      firefox: 'Settings: Set privacy.resistFingerprinting to true in about:config to clamp CPU cores to 2.',
      edge: 'Engine limitation: Hardware specs are reported directly from Windows OS.',
      safari: 'Settings: Safari clamps CPU concurrency in Private Browsing.',
      tor: 'No action needed. CPU cores are clamped to 2 by default.',
      other: 'Engine limitation: Inherent to underlying OS architecture.'
    }
  },

  display_geometry: {
    weight: 10,
    isActionable: (family) => ['firefox', 'tor'].includes(family),
    directives: {
      chrome: 'Hardware limitation: Screen resolution is your physical monitor size. Cannot be letterboxed in Chrome.',
      brave: 'Hardware limitation: Window dimensions reflect monitor size. Avoid maximizing to unique resolutions.',
      firefox: 'Settings: Set privacy.resistFingerprinting.letterboxing to true in about:config to letterbox window geometry.',
      edge: 'Hardware limitation: Screen resolution is read directly from Windows display settings.',
      safari: 'Settings: Window size standardization is applied in strict privacy profiles.',
      tor: 'No action needed. Tor Browser enforces letterboxing by default.',
      other: 'Hardware limitation.'
    }
  },

  spectre_isolation: {
    weight: 15,
    isActionable: true,
    directives: {
      chrome: 'Update: Ensure Chrome is updated to latest version and Site Isolation is active.',
      brave: 'Update: Ensure Brave is updated to the latest version.',
      firefox: 'Settings: Ensure Fission (Site Isolation) is active in Settings > Privacy & Security.',
      edge: 'Update: Ensure Microsoft Edge is updated to latest security patch.',
      safari: 'Update: Keep macOS / iOS updated to latest security patch.',
      tor: 'No action needed. High-resolution timers are strictly clamped.',
      other: 'Keep browser updated to latest release.'
    }
  },

  automation_status: {
    weight: 10,
    isActionable: true,
    directives: {
      chrome: 'Launch: Launch Chrome directly without --remote-debugging-port or selenium webdriver automation flags.',
      brave: 'Launch: Run Brave in normal user profile mode without automated controllers.',
      firefox: 'Launch: Launch Firefox normally without Marionette or test runner hooks.',
      edge: 'Launch: Launch Edge without automated test controllers.',
      safari: 'Settings: Disable "Allow Remote Automation" in Safari Develop menu.',
      tor: 'No action needed.',
      other: 'Run browser in genuine user mode.'
    }
  },

  permissions_policy: {
    weight: 10,
    isActionable: true,
    directives: {
      chrome: 'Settings: Go to chrome://settings/content and click "Reset permissions" on untrusted websites.',
      brave: 'Settings: Go to brave://settings/content and reset stored website permissions.',
      firefox: 'Settings: Go to Settings > Privacy & Security > Permissions > Clear stored site permissions.',
      edge: 'Settings: Go to edge://settings/content and clear permissions granted to websites.',
      safari: 'Settings: Go to Settings > Websites and review permissions granted.',
      tor: 'No action needed. Permissions are reset on every new session.',
      other: 'Settings: Reset stored site permissions.'
    }
  },

  referrer_policy: {
    weight: 10,
    isActionable: (family) => ['brave', 'firefox', 'safari', 'chrome', 'edge'].includes(family),
    directives: {
      chrome: 'Extension required: Chrome has no referrer stripping toggle. Install the "Smart Referer" extension from Chrome Web Store.',
      brave: 'No action needed. Brave Shields automatically strips referrer query parameters across origins.',
      firefox: 'Settings: Set network.http.referer.XOriginPolicy to 2 (send only full URL on same-origin) in about:config.',
      edge: 'Extension required: Install a referrer-stripping extension from Edge Add-ons.',
      safari: 'No action needed. Safari automatically strips cross-origin referrers under ITP.',
      tor: 'No action needed. Referrer headers are stripped across origins.',
      other: 'Extension required: Use strict-origin referrer policy extensions.'
    }
  },

  network_telemetry: {
    weight: 5,
    isActionable: (family) => ['firefox', 'brave', 'tor'].includes(family),
    directives: {
      chrome: 'Engine limitation: Network Information API is native to Chromium and cannot be disabled in Chrome settings.',
      brave: 'Settings: Network telemetry is blocked under strict shield configurations in Brave.',
      firefox: 'Settings: Set dom.netinfo.enabled to false in about:config.',
      edge: 'Engine limitation: Inherent Chromium network feature.',
      safari: 'No action needed. Safari does not implement the Network Information API.',
      tor: 'No action needed. Network Information API is disabled.',
      other: 'Engine limitation.'
    }
  },

  local_isolation: {
    weight: 10,
    isActionable: true,
    directives: {
      chrome: 'Settings: Keep "Private Network Access" checks active in chrome://flags (default).',
      brave: 'No action needed. Localhost probing is restricted by default in Brave.',
      firefox: 'No action needed. Cross-origin loopback isolation is enforced by default in Firefox.',
      edge: 'Settings: Default private network protection is active in Edge.',
      safari: 'No action needed. Local network access is sandboxed.',
      tor: 'No action needed.',
      other: 'Keep private network security active.'
    }
  },

  extension_artifacts: {
    weight: 10,
    isActionable: true,
    directives: {
      chrome: 'Review Extensions: Check chrome://extensions and disable crypto wallets or untrusted extensions from running automatically on all sites.',
      brave: 'Settings: Go to brave://settings/web3 and set default cryptocurrency wallet to "None" or manage site access.',
      firefox: 'Review Add-ons: Go to about:addons and restrict extension site access permissions.',
      edge: 'Review Extensions: Open edge://extensions and manage extension site access permissions.',
      safari: 'Settings: Go to Settings > Extensions and enable extensions only for selected websites.',
      tor: 'No action needed. Tor Browser strictly isolates and prevents extension injections.',
      other: 'Review installed extensions and revoke broad website permissions.'
    }
  },

  wire_headers: {
    weight: 10,
    isActionable: (family) => ['brave', 'firefox', 'tor'].includes(family),
    directives: {
      chrome: 'Engine limitation: Client hints (Sec-CH-UA) are broadcast by default in Chromium.',
      brave: 'Settings: Brave Shields automatically minimizes Client Hint headers.',
      firefox: 'Settings: Enable privacy.resistFingerprinting in about:config to standardize HTTP wire headers.',
      edge: 'Engine limitation: Inherent Chromium Client Hints architecture.',
      safari: 'Settings: Safari transmits minimal standardized request headers.',
      tor: 'No action needed. All HTTP request headers are strictly normalized.',
      other: 'Use hardened browser profiles to minimize request header entropy.'
    }
  },

  ip_intel: {
    weight: 10,
    isActionable: true,
    directives: {
      chrome: 'Network: Use an encrypted VPN or privacy proxy to mask public WAN IP routing.',
      brave: 'Settings: Enable Tor Private Window in Brave (Alt+Shift+N) or connect via VPN.',
      firefox: 'Network: Use Mozilla VPN or a trusted WireGuard/OpenVPN tunnel.',
      edge: 'Network: Enable Microsoft Edge Secure Network VPN in privacy settings.',
      safari: 'Settings: Enable iCloud Private Relay under Apple ID > iCloud settings.',
      tor: 'No action needed. Traffic is automatically routed through onion relays.',
      other: 'Connect through a privacy-preserving VPN or proxy.'
    }
  },

  engine_discrepancy: {
    weight: 15,
    isActionable: true,
    directives: {
      chrome: 'Configuration: Disable User-Agent spoofing extensions that cause engine discrepancies.',
      brave: 'Configuration: Run standard Brave Shields rather than aggressive User-Agent switchers.',
      firefox: 'Configuration: Keep Firefox User-Agent aligned with native Gecko architecture.',
      edge: 'Configuration: Avoid User-Agent modifications that clash with Chromium engine internals.',
      safari: 'Configuration: Maintain standard Safari WebKit configuration.',
      tor: 'No action needed. Engine signatures and UA are harmonized by design.',
      other: 'Ensure User-Agent matches runtime JavaScript engine capabilities.'
    }
  }
};

export function enrichTestWithBrowserRules(test, browserInfo) {
  const family = detectBrowserFamily(browserInfo);
  const rule = BROWSER_RULES[test.id];

  // If already secure/safe, display "No action needed."
  if (test.status === 'secure') {
    return {
      ...test,
      isActionable: false,
      potentialGain: 0,
      browserFamily: family,
      action: 'No action needed.'
    };
  }

  if (!rule) {
    return {
      ...test,
      isActionable: false,
      potentialGain: 0,
      browserFamily: family,
      action: test.action || 'No action required.'
    };
  }

  let actionable = false;
  if (typeof rule.isActionable === 'function') {
    actionable = rule.isActionable(family);
  } else {
    actionable = !!rule.isActionable;
  }

  const isFixNeeded = test.status === 'danger' || test.status === 'warning';
  const potentialGain = (actionable && isFixNeeded) ? rule.weight : 0;

  // Exact browser-specific directive
  const directive = (rule.directives && (rule.directives[family] || rule.directives.other)) || test.action || 'No action required.';

  return {
    ...test,
    isActionable: actionable && isFixNeeded,
    potentialGain: potentialGain,
    browserFamily: family,
    action: directive
  };
}
