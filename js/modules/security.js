/**
 * Security Posture & Sandbox Integrity Engine
 * Plain language verdicts with raw telemetry.
 */

export async function getSpectreIsolation() {
  const isIsolated = window.crossOriginIsolated === true;
  const hasSharedArrayBuffer = typeof window.SharedArrayBuffer !== 'undefined';

  if (isIsolated) {
    return {
      id: 'spectre_isolation',
      title: 'Spectre Processor Side-Channel Defense',
      category: 'security',
      status: 'secure',
      verdict: 'Strictly Isolated Sandbox',
      summary: 'Your browser prevents malicious tabs from stealing passwords or data from other tabs via CPU micro-timing attacks.',
      impact: 'Safe. Modern cross-origin isolation (COOP/COEP) is active.',
      action: 'Optimal security configuration.',
      rawTelemetry: 'crossOriginIsolated: True | SharedArrayBuffer: Safe'
    };
  }

  if (hasSharedArrayBuffer) {
    return {
      id: 'spectre_isolation',
      title: 'Spectre Processor Side-Channel Defense',
      category: 'security',
      status: 'danger',
      verdict: 'High-Precision Timers Unprotected',
      summary: 'High-precision CPU timers are accessible in an unisolated window, elevating CPU side-channel attack susceptibility.',
      impact: 'High Security Risk. Vulnerable to memory cache timing extraction.',
      action: 'Ensure your browser is updated to the latest security patch.',
      rawTelemetry: 'crossOriginIsolated: False | SharedArrayBuffer: Exposed'
    };
  }

  return {
    id: 'spectre_isolation',
    title: 'Spectre Processor Side-Channel Defense',
    category: 'security',
    status: 'secure',
    verdict: 'Timers Clamped & Protected',
    summary: 'High-precision timers are rounded to safe intervals, preventing CPU cache side-channel attacks.',
    impact: 'Safe.',
    action: 'No action required.',
    rawTelemetry: 'crossOriginIsolated: False | SharedArrayBuffer: Restricted'
  };
}

export async function getAutomationSignatures() {
  const isWebdriver = navigator.webdriver === true;
  const isPluginZero = navigator.plugins && navigator.plugins.length === 0 && !/Mobi|Android/i.test(navigator.userAgent);
  const hasSeleniumArtifact = typeof window.cdc_adoQpoasnfa76pfcZLmcfl_Array !== 'undefined' || typeof window.__nightmare !== 'undefined' || typeof window.callPhantom !== 'undefined';
  const hasHeadlessChrome = /HeadlessChrome/.test(navigator.userAgent);

  const isAutomated = isWebdriver || hasSeleniumArtifact || hasHeadlessChrome || (isPluginZero && typeof window.chrome !== 'undefined');

  if (isAutomated) {
    const reasons = [];
    if (isWebdriver) reasons.push('navigator.webdriver=true');
    if (hasSeleniumArtifact) reasons.push('Selenium/Puppeteer artifact');
    if (hasHeadlessChrome) reasons.push('Headless UA');
    if (isPluginZero) reasons.push('Zero plugins in Chromium');

    return {
      id: 'automation_status',
      title: 'Automated Bot / Scraping Flag',
      category: 'security',
      status: 'warning',
      verdict: 'Automated Bot / Headless Flag Active',
      summary: 'Your browser environment reveals automated scraper or bot framework indicators.',
      impact: 'Security Alert. Cloudflare, bank portals, and CAPTCHA systems may challenge or block access.',
      action: 'Open your browser in normal user profile mode without remote debugging or test runners.',
      rawTelemetry: `Flags: ${reasons.join(', ')}`
    };
  }

  return {
    id: 'automation_status',
    title: 'Automated Bot / Scraping Flag',
    category: 'security',
    status: 'secure',
    verdict: 'Normal Human User Profile',
    summary: 'No robot or headless automated testing flags are detected.',
    impact: 'Safe. Websites recognize your browser as a genuine human user.',
    action: 'No action needed.',
    rawTelemetry: 'navigator.webdriver: False | Plugins: Valid | Selenium Hooks: Clean'
  };
}

export async function getEngineDiscrepancyProbe() {
  const ua = navigator.userAgent;
  const hasV8 = typeof Error.captureStackTrace === 'function';
  const hasGecko = typeof InstallTrigger !== 'undefined' || (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('-moz-appearance: none'));
  const hasWebKit = (typeof window !== 'undefined' && typeof window.ApplePaySession !== 'undefined') || (typeof window !== 'undefined' && typeof window.GestureEvent !== 'undefined');

  const claimsFirefox = /Firefox\//i.test(ua);
  const claimsSafari = /Safari\//i.test(ua) && !/Chrome\//i.test(ua) && !/Chromium\//i.test(ua);
  const claimsChrome = /Chrome\//i.test(ua);

  let isDiscrepancy = false;
  let detail = 'Consistent runtime environment';

  if (claimsFirefox && hasV8) {
    isDiscrepancy = true;
    detail = 'User-Agent claims Firefox (Gecko), but V8 JavaScript engine primitives were detected.';
  } else if (claimsSafari && hasV8 && !/CriOS/i.test(ua)) {
    isDiscrepancy = true;
    detail = 'User-Agent claims Apple Safari (JavaScriptCore), but Chromium V8 engine was detected.';
  } else if (claimsChrome && hasGecko) {
    isDiscrepancy = true;
    detail = 'User-Agent claims Google Chrome, but Gecko layout engine features were detected.';
  }

  return {
    id: 'engine_discrepancy',
    title: 'JavaScript Engine & User-Agent Integrity',
    category: 'security',
    status: isDiscrepancy ? 'warning' : 'secure',
    verdict: isDiscrepancy ? 'Spoofed User-Agent Detected' : 'Engine & Identity Consistent',
    summary: isDiscrepancy
      ? 'Your browser reported a User-Agent string that contradicts its actual internal JavaScript engine.'
      : 'Your browser reported User-Agent matches the internal JavaScript and layout engine capabilities.',
    impact: isDiscrepancy ? 'Moderate Risk. Anti-fraud systems easily detect spoofed user-agent extensions.' : 'Safe.',
    action: isDiscrepancy ? 'Disable conflicting User-Agent switcher extensions.' : 'No action needed.',
    rawTelemetry: `Engine Flags: V8=${hasV8}, Gecko=${hasGecko}, WebKit=${hasWebKit} | Details: ${detail}`
  };
}

export async function getPermissionsPolicy() {
  if (!navigator.permissions || !navigator.permissions.query) {
    return {
      id: 'permissions_policy',
      title: 'Silent Permission Queries',
      category: 'security',
      status: 'secure',
      verdict: 'Permissions Query Restricted',
      summary: 'Websites cannot silently query which permissions you have previously granted.',
      impact: 'Safe.',
      action: 'No action needed.',
      rawTelemetry: 'Permissions API: Restricted'
    };
  }

  const names = ['geolocation', 'notifications', 'camera', 'microphone', 'clipboard-read'];
  const states = [];
  for (const n of names) {
    try {
      const p = await navigator.permissions.query({ name: n });
      states.push(`${n}: ${p.state}`);
    } catch(e) {}
  }

  return {
    id: 'permissions_policy',
    title: 'Silent Permission Queries',
    category: 'security',
    status: 'secure',
    verdict: 'Sandboxed Permissions',
    summary: 'Websites must explicitly prompt you before accessing your webcam, microphone, or location.',
    impact: 'Safe. No silent hardware access is permitted.',
    action: 'No action required.',
    rawTelemetry: `Permission States: ${states.join(', ') || 'All default prompt/denied'}`
  };
}

export async function getExtensionArtifactsFingerprint() {
  const probeTargets = [
    { name: 'Ethereum/Web3 Wallet', check: () => typeof window.ethereum !== 'undefined' },
    { name: 'Solana Wallet (Phantom/Solflare)', check: () => typeof window.solana !== 'undefined' },
    { name: 'OKX / Bitget Crypto Wallet', check: () => typeof window.okxwallet !== 'undefined' || typeof window.bitkeep !== 'undefined' },
    { name: 'TronLink Wallet', check: () => typeof window.tronWeb !== 'undefined' },
    { name: '1Password Injected Artifact', check: () => typeof window.__1password !== 'undefined' },
    { name: 'Grammarly DOM Injected Artifact', check: () => typeof window.Grammarly !== 'undefined' || !!document.querySelector('[data-grammarly-shadow-root]') }
  ];

  const detected = [];
  probeTargets.forEach(target => {
    try {
      if (target.check()) {
        detected.push(target.name);
      }
    } catch (e) {}
  });

  const isExposed = detected.length > 0;

  return {
    id: 'extension_artifacts',
    title: 'Injected Extension & Wallet Artifacts',
    category: 'security',
    status: isExposed ? 'warning' : 'secure',
    verdict: isExposed ? `${detected.length} Extension Injections Detected` : 'Zero Injected Artifacts (Clean DOM)',
    summary: isExposed
      ? `Websites can identify installed browser extensions or cryptocurrency wallets (${detected.join(', ')}) through injected window objects.`
      : 'No third-party extensions or cryptocurrency wallet objects are leaking into the webpage environment.',
    impact: isExposed ? 'Moderate Privacy Risk. Leaks installed software inventory to websites.' : 'Safe.',
    action: isExposed ? 'Restrict extension permissions or switch crypto wallet default injection to "On-Demand".' : 'No action needed.',
    rawTelemetry: isExposed ? `Injected Artifacts: ${detected.join(', ')}` : 'Injected Window Artifacts: None Detected'
  };
}

export async function runSecurityTests() {
  const [spectre, automation, engine, permissions, extensions] = await Promise.all([
    getSpectreIsolation(),
    getAutomationSignatures(),
    getEngineDiscrepancyProbe(),
    getPermissionsPolicy(),
    getExtensionArtifactsFingerprint()
  ]);
  return [spectre, automation, engine, permissions, extensions];
}
