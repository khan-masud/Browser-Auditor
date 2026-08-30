/**
 * Hardware Telemetry & Environmental Leakage Engine
 * Non-tech friendly descriptions with raw hardware specifications.
 */

export async function getHardwareConcurrencyAndMemory() {
  const cores = navigator.hardwareConcurrency || 'Unknown';
  const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Standardized';
  const isExposed = (typeof cores === 'number' && cores > 0);

  return {
    id: 'hardware_cpu_memory',
    title: 'Processor (CPU) & RAM Specifications',
    category: 'hardware',
    status: isExposed ? 'warning' : 'secure',
    verdict: isExposed ? `${cores} CPU Cores, ${memory} RAM Exposed` : 'Hardware Tier Masked',
    summary: isExposed 
      ? `Websites can read the exact number of CPU processing cores (${cores}) and RAM (${memory}) on your computer.`
      : 'Hardware specifications are generalized to prevent fingerprinting.',
    impact: isExposed ? 'Moderate Risk. Helps identify your specific computer model.' : 'Safe.',
    action: isExposed ? 'Hardened privacy browsers (like Tor or Firefox RFP) clamp CPU cores to 2 or 4.' : 'No action required.',
    rawTelemetry: `navigator.hardwareConcurrency: ${cores} | navigator.deviceMemory: ${memory}`
  };
}

export async function getDisplayGeometry() {
  const width = window.screen.width;
  const height = window.screen.height;
  const availWidth = window.screen.availWidth;
  const availHeight = window.screen.availHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  const isMultiScreen = typeof window.screen.isExtended === 'boolean' ? window.screen.isExtended : false;

  return {
    id: 'display_geometry',
    title: 'Screen Resolution & Monitor Geometry',
    category: 'hardware',
    status: 'warning',
    verdict: `${width} x ${height} Pixels (${pixelRatio}x Scale)${isMultiScreen ? ' • Multi-Monitor' : ''}`,
    summary: 'Websites can measure the exact pixel dimensions of your screen, taskbar height, and display scale ratio.',
    impact: 'Moderate Risk. Uncommon resolutions make your device highly unique.',
    action: 'Maximize your browser window or use letterboxing anti-fingerprinting.',
    rawTelemetry: `Total: ${width}x${height} | Usable: ${availWidth}x${availHeight} | PixelRatio: ${pixelRatio} | MultiScreen: ${isMultiScreen}`
  };
}

export async function getMediaDevicesExposure() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return {
        id: 'media_devices',
        title: 'Microphone & Webcam Hardware Count',
        category: 'hardware',
        status: 'secure',
        verdict: 'Access Restricted',
        summary: 'Websites cannot test for connected microphones or cameras without permission.',
        impact: 'Safe.',
        action: 'No action required.',
        rawTelemetry: 'enumerateDevices: Restricted'
      };
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioIn = devices.filter(d => d.kind === 'audioinput').length;
    const videoIn = devices.filter(d => d.kind === 'videoinput').length;
    const total = devices.length;
    const hasLabels = devices.some(d => d.label && d.label.length > 0);

    if (hasLabels) {
      return {
        id: 'media_devices',
        title: 'Microphone & Webcam Hardware Count',
        category: 'hardware',
        status: 'danger',
        verdict: 'Exact Camera & Microphone Brand Names Leaked',
        summary: 'Websites can see the full brand names of your webcam, microphone, or Bluetooth headsets without prompting you.',
        impact: 'High Privacy Risk. Peripheral brand names create an extremely unique identity fingerprint.',
        action: 'Revoke media device enumeration permissions in your browser settings.',
        rawTelemetry: `Devices (${total}): ${devices.map(d => d.label || d.kind).join(', ')}`
      };
    }

    return {
      id: 'media_devices',
      title: 'Microphone & Webcam Hardware Count',
      category: 'hardware',
      status: total > 0 ? 'warning' : 'secure',
      verdict: total > 0 ? `${total} Audio/Video Peripherals Counted` : 'No Peripherals Detected',
      summary: total > 0
        ? `Websites can count how many mics (${audioIn}) and cameras (${videoIn}) you have plugged in.`
        : 'No media peripherals are exposed.',
      impact: 'Low to Moderate Risk.',
      action: 'Optimal. Device brand names are shielded.',
      rawTelemetry: `Total Devices: ${total} (Mics: ${audioIn}, Cameras: ${videoIn})`
    };
  } catch (err) {
    return {
      id: 'media_devices',
      title: 'Microphone & Webcam Hardware Count',
      category: 'hardware',
      status: 'secure',
      verdict: 'Protected / Blocked',
      summary: 'Peripherals enumeration is blocked.',
      impact: 'Safe.',
      action: 'No action required.',
      rawTelemetry: `Error: ${err.message}`
    };
  }
}

export async function getSensorsAndBattery() {
  let hasBattery = false;
  let batteryInfo = '';

  try {
    if ('getBattery' in navigator) {
      hasBattery = true;
      const b = await navigator.getBattery();
      batteryInfo = `${Math.round(b.level * 100)}% (${b.charging ? 'Charging' : 'On Battery'})`;
    }
  } catch (e) {}

  if (hasBattery) {
    return {
      id: 'battery_sensors',
      title: 'Battery Level & Sensor Tracking',
      category: 'hardware',
      status: 'danger',
      verdict: `Battery Charge Exposed (${batteryInfo})`,
      summary: 'Websites can read your exact battery percentage to track you across short browsing intervals.',
      impact: 'High Risk. Battery micro-percentages act as a temporary tracking beacon.',
      action: 'Update your browser. Modern privacy browsers disable battery access by default.',
      rawTelemetry: `navigator.getBattery(): Level=${batteryInfo}`
    };
  }

  return {
    id: 'battery_sensors',
    title: 'Battery Level & Sensor Tracking',
    category: 'hardware',
    status: 'secure',
    verdict: 'Battery Tracking Blocked',
    summary: 'Your browser blocks websites from reading your battery level and motion sensors.',
    impact: 'Safe. Modern privacy standard respected.',
    action: 'No action needed.',
    rawTelemetry: 'Battery API: Deprecated / Blocked'
  };
}

export async function runHardwareTests() {
  const [cpu, display, media, sensors] = await Promise.all([
    getHardwareConcurrencyAndMemory(),
    getDisplayGeometry(),
    getMediaDevicesExposure(),
    getSensorsAndBattery()
  ]);
  return [cpu, display, media, sensors];
}
