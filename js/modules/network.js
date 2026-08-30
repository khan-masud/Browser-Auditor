/**
 * Network & Connection Leak Inspection Engine
 * Non-tech friendly descriptions with raw IP/protocol telemetry.
 */

export async function getWebRTCLeak() {
  return new Promise((resolve) => {
    try {
      const RTCPeer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
      
      if (!RTCPeer) {
        return resolve({
          id: 'webrtc_leak',
          title: 'WebRTC Real IP Leak Protection',
          category: 'network',
          status: 'secure',
          verdict: 'Fully Shielded (WebRTC Disabled)',
          summary: 'WebRTC video/audio communication is disabled, completely preventing real IP exposure.',
          impact: 'Safe. Websites cannot see your real IP address even behind a VPN.',
          action: 'No action required. Protection is optimal.',
          rawTelemetry: 'RTCPeerConnection: Unavailable'
        });
      }

      const servers = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun.cloudflare.com:3478' }
        ]
      };

      const pc = new RTCPeer(servers);
      const candidates = [];
      let completed = false;

      const finish = () => {
        if (completed) return;
        completed = true;
        try { pc.close(); } catch (e) {}

        const localIps = candidates.filter(ip => 
          ip.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/) || ip.endsWith('.local')
        );
        const publicIps = candidates.filter(ip => 
          !ip.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/) && !ip.endsWith('.local')
        );

        if (candidates.length === 0) {
          return resolve({
            id: 'webrtc_leak',
            title: 'WebRTC Real IP Leak Protection',
            category: 'network',
            status: 'secure',
            verdict: 'Protected (Zero IP Candidates Leaked)',
            summary: 'Your browser blocks WebRTC from advertising your local network or public IP addresses.',
            impact: 'Safe. Your true location and network cannot be leaked to websites.',
            action: 'No action needed. WebRTC protection is optimal.',
            rawTelemetry: 'Candidates Captured: 0 | ICE Status: Blocked'
          });
        }

        const isExposed = localIps.length > 0 || publicIps.length > 0;
        const candidateSummary = candidates.join(', ');

        if (isExposed) {
          return resolve({
            id: 'webrtc_leak',
            title: 'WebRTC Real IP Leak Protection',
            category: 'network',
            status: 'warning',
            verdict: 'Real Network IP Addresses Exposed',
            summary: `Websites can discover your real device network addresses (${candidates.length} found) bypassing basic proxies.`,
            impact: 'High Privacy Risk. If you use a VPN, WebRTC can leak your true ISP connection details.',
            action: 'Install a WebRTC blocker extension or enable WebRTC privacy routing in your browser settings.',
            rawTelemetry: `Exposed Candidates: ${candidateSummary}`
          });
        }

        return resolve({
          id: 'webrtc_leak',
          title: 'WebRTC Real IP Leak Protection',
          category: 'network',
          status: 'secure',
          verdict: 'Anonymized (mDNS Hostnames)',
          summary: 'Your local IP addresses are scrambled into random names (.local) so websites cannot see your real network.',
          impact: 'Safe. Local network architecture is hidden.',
          action: 'No action required.',
          rawTelemetry: `Anonymized mDNS Candidates: ${candidateSummary}`
        });
      };

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          finish();
          return;
        }
        const cand = event.candidate.candidate;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|(?:[0-9a-fA-F]{1,4}:){1,7}:?|:(?::[0-9a-fA-F]{1,4}){1,7}|[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){1,7}|[0-9a-fA-F-]+\.local)/;
        const match = ipRegex.exec(cand);
        if (match && match[1] && !candidates.includes(match[1])) {
          candidates.push(match[1]);
        }
      };

      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => finish());
      setTimeout(finish, 1200);

    } catch (err) {
      resolve({
        id: 'webrtc_leak',
        title: 'WebRTC Real IP Leak Protection',
        category: 'network',
        status: 'secure',
        verdict: 'Protected / Blocked',
        summary: 'WebRTC IP probing was prevented by your security setup.',
        impact: 'Safe.',
        action: 'No action required.',
        rawTelemetry: `Error: ${err.message}`
      });
    }
  });
}

export async function getLocalNetworkIsolation() {
  const testPorts = [9050, 8080, 27017];
  let scanBlocked = true;
  let probedCount = 0;

  await Promise.all(testPorts.map(async (port) => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 400);
      await fetch(`http://127.0.0.1:${port}/`, { method: 'GET', mode: 'no-cors', signal: ctrl.signal });
      clearTimeout(t);
      probedCount++;
    } catch (e) {
      if (e.name === 'AbortError' || e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        scanBlocked = true;
      }
    }
  }));

  const isGuarded = probedCount === 0;

  return {
    id: 'local_isolation',
    title: 'Local Device Network Port Shield',
    category: 'network',
    status: isGuarded ? 'secure' : 'warning',
    verdict: isGuarded ? 'Localhost & LAN Guarded' : 'Private Network Access Unrestricted',
    summary: isGuarded
      ? 'Websites are blocked from background port scanning local software or smart devices on your local network.'
      : 'Websites can probe local TCP services and localhost ports on your computer.',
    impact: isGuarded ? 'Safe. Private Network Access (PNA) restrictions prevent unauthorized background port scans.' : 'Moderate Security Risk.',
    action: isGuarded ? 'No action needed.' : 'Enable Private Network Access protections in browser flags.',
    rawTelemetry: `Loopback Probes: ${testPorts.length} Ports Checked | Open/Accessible: ${probedCount}`
  };
}

export async function getReferrerPolicy() {
  const referrer = document.referrer;
  const policy = document.referrerPolicy || 'strict-origin-when-cross-origin';
  const hasMeta = !!document.querySelector('meta[name="referrer"]');
  const isExposed = referrer && referrer.length > 0 && !referrer.startsWith(window.location.origin);

  return {
    id: 'referrer_policy',
    title: 'Browsing History Referrer Leak',
    category: 'network',
    status: isExposed ? 'warning' : 'secure',
    verdict: isExposed ? 'Cross-Origin URL Header Leaked' : `Protected (${policy})`,
    summary: isExposed 
      ? 'Websites can see the full URL and query parameters of the page you previously visited.'
      : 'Cross-origin referrer headers are strictly stripped to prevent leaking browsing history.',
    impact: isExposed ? 'Moderate Privacy Risk. Search queries or tokenized URL links might be exposed.' : 'Safe.',
    action: isExposed ? 'Set your browser referrer policy to "strict-origin-when-cross-origin" or install a referrer stripper extension.' : 'No action required.',
    rawTelemetry: `Active Policy: ${policy} | Meta Tag: ${hasMeta} | Referrer Value: ${referrer || 'Stripped / Empty'}`
  };
}

export async function getNetworkTelemetry() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) {
    return {
      id: 'network_telemetry',
      title: 'Internet Speed & Connection Telemetry',
      category: 'network',
      status: 'secure',
      verdict: 'Speed & Network Info Hidden',
      summary: 'Your exact internet bandwidth and network speed are kept private.',
      impact: 'Safe.',
      action: 'No action required.',
      rawTelemetry: 'Network Information API: Disabled'
    };
  }

  const details = [];
  if (conn.effectiveType) details.push(`Tier: ${conn.effectiveType}`);
  if (conn.downlink) details.push(`Speed: ${conn.downlink} Mbps`);
  if (conn.rtt) details.push(`Ping: ${conn.rtt}ms`);

  return {
    id: 'network_telemetry',
    title: 'Internet Speed & Connection Telemetry',
    category: 'network',
    status: 'warning',
    verdict: 'Connection Speed & Ping Broadcasted',
    summary: `Websites can see your internet speed (${conn.downlink || 'N/A'} Mbps) and latency (${conn.rtt || 'N/A'}ms).`,
    impact: 'Low to Moderate Risk. Provides subtle timing data used to recognize your device.',
    action: 'Privacy-focused browsers disable this API by default.',
    rawTelemetry: `API Output: ${details.join(' | ')}`
  };
}

export async function getWireHeadersExposure() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch('/api/inspect-headers', { signal: ctrl.signal });
    clearTimeout(t);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const headers = data.headers || {};

    const clientHints = Object.keys(headers).filter(h => h.startsWith('sec-ch-ua'));
    const lang = headers['accept-language'] || 'None';
    const ua = headers['user-agent'] || 'None';
    const isExposed = clientHints.length > 0;

    return {
      id: 'wire_headers',
      title: 'HTTP Wire Headers & Client Hints',
      category: 'network',
      status: isExposed ? 'warning' : 'secure',
      verdict: isExposed ? `${clientHints.length} Client Hints Transmitted` : 'Minimal Wire Headers (Standardized)',
      summary: isExposed
        ? `Your browser sends extra Client Hints headers (${clientHints.join(', ')}) in every HTTP network request revealing OS and brand versions.`
        : 'Your browser transmits a minimal, standardized set of HTTP wire headers.',
      impact: isExposed ? 'Moderate Risk. Client hints provide high-entropy device tracking data over the wire.' : 'Safe.',
      action: isExposed ? 'Use privacy browsers that strip Client Hints or enable ResistFingerprinting.' : 'No action required.',
      rawTelemetry: `Client Hints: ${clientHints.join(', ') || 'None'} | Accept-Language: ${lang} | User-Agent: ${ua}`
    };
  } catch (err) {
    return {
      id: 'wire_headers',
      title: 'HTTP Wire Headers & Client Hints',
      category: 'network',
      status: 'info',
      verdict: 'Echo API Unavailable',
      summary: 'Wire request header inspection requires an active backend server endpoint.',
      impact: 'Informational only.',
      action: 'Start node server.js to enable wire header introspection.',
      rawTelemetry: `Backend Echo Status: Offline / Unreachable (${err.message})`
    };
  }
}

export async function getVpnAndAsnTelemetry() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch('/api/ip-intel', { signal: ctrl.signal });
    clearTimeout(t);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const isLocal = data.isLoopback;

    return {
      id: 'ip_intel',
      title: 'IP Routing & Gateway Intelligence',
      category: 'network',
      status: 'secure',
      verdict: isLocal ? 'Localhost Protected Environment' : `WAN Gateway: ${data.ip}`,
      summary: isLocal
        ? 'Traffic is originating from a local isolated loopback interface.'
        : `Traffic is routed via external WAN IP (${data.ip}). Ensure VPN protection is active on public networks.`,
      impact: 'Safe. Connection route inspected.',
      action: 'No action needed.',
      rawTelemetry: `IP: ${data.ip} | Type: ${data.connectionType} | Protocol: ${(data.detectedProtocols || []).join(', ')}`
    };
  } catch (err) {
    return {
      id: 'ip_intel',
      title: 'IP Routing & Gateway Intelligence',
      category: 'network',
      status: 'info',
      verdict: 'IP Routing Unverified',
      summary: 'Gateway IP verification requires active backend connection.',
      impact: 'Informational.',
      action: 'No action needed.',
      rawTelemetry: `Intel API: ${err.message}`
    };
  }
}

export async function runNetworkTests() {
  const [webrtc, isolation, referrer, telemetry, wireHeaders, ipIntel] = await Promise.all([
    getWebRTCLeak(),
    getLocalNetworkIsolation(),
    getReferrerPolicy(),
    getNetworkTelemetry(),
    getWireHeadersExposure(),
    getVpnAndAsnTelemetry()
  ]);
  return [webrtc, isolation, referrer, telemetry, wireHeaders, ipIntel];
}
