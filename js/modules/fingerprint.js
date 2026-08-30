/**
 * Hardware & Graphical Fingerprinting Probe Engine
 * Provides non-tech friendly verdicts along with deep entropy telemetry.
 */

export function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return ('0000000' + (hash >>> 0).toString(16)).substr(-8);
}

/**
 * 1. Canvas 2D Fingerprint
 */
export async function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        id: 'canvas_2d',
        title: 'Canvas Graphics Tracking',
        category: 'fingerprint',
        status: 'secure',
        verdict: 'Canvas Drawing Blocked',
        summary: 'Websites cannot draw hidden graphics to track your device.',
        impact: 'Safe. Trackers cannot generate an image-based hardware fingerprint.',
        action: 'No action needed. Canvas tracking is blocked.',
        rawTelemetry: 'Status: Canvas 2D context disabled'
      };
    }

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('BrowserInspector.Security.Test, 1024', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('BrowserInspector.Security.Test, 1024', 4, 17);
    ctx.beginPath();
    ctx.arc(50, 45, 12, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    const hash = fnv1a(dataUrl);

    // Test noise randomization
    const canvas2 = document.createElement('canvas');
    canvas2.width = 280;
    canvas2.height = 60;
    const ctx2 = canvas2.getContext('2d');
    ctx2.textBaseline = 'top';
    ctx2.font = '14px Arial';
    ctx2.fillStyle = '#f60';
    ctx2.fillRect(125, 1, 62, 20);
    ctx2.fillStyle = '#069';
    ctx2.fillText('BrowserInspector.Security.Test, 1024', 2, 15);
    const isRandomized = (canvas.toDataURL() !== canvas2.toDataURL());

    if (isRandomized) {
      return {
        id: 'canvas_2d',
        title: 'Canvas Graphics Tracking',
        category: 'fingerprint',
        status: 'secure',
        verdict: 'Protected by Noise Randomization',
        summary: 'Your browser injects subtle random pixels into hidden images so trackers get fake data every time.',
        impact: 'Safe. Advertisers cannot link your visits across different websites.',
        action: 'No action needed. Anti-fingerprinting defense is fully active.',
        rawTelemetry: `Noise Protection Active | Dynamic Hash: ${hash}`
      };
    }

    return {
      id: 'canvas_2d',
      title: 'Canvas Graphics Tracking',
      category: 'fingerprint',
      status: 'warning',
      verdict: 'Unique Hardware Signature Exposed',
      summary: 'Websites can silently draw hidden shapes to generate a unique digital ID for your computer.',
      impact: 'High Tracking Risk. Ad networks can recognize your browser even in Private / Incognito mode.',
      action: 'Use a browser with built-in fingerprint shielding (like Brave or Firefox with ResistFingerprinting).',
      rawTelemetry: `Unprotected Raster Signature: ${hash} | Repeatable: True`
    };
  } catch (err) {
    return {
      id: 'canvas_2d',
      title: 'Canvas Graphics Tracking',
      category: 'fingerprint',
      status: 'info',
      verdict: 'Restricted by Browser',
      summary: 'Canvas drawing could not be executed due to security restrictions.',
      impact: 'Low Risk.',
      action: 'No action required.',
      rawTelemetry: `Error: ${err.message}`
    };
  }
}

/**
 * 2. WebGL & GPU Model Unmasking
 */
export async function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return {
        id: 'webgl_info',
        title: 'Graphics Card (GPU) Model Leak',
        category: 'fingerprint',
        status: 'secure',
        verdict: 'WebGL Disabled',
        summary: '3D graphics queries are disabled, preventing any GPU identification.',
        impact: 'Safe. Graphics hardware is hidden.',
        action: 'No action needed.',
        rawTelemetry: 'WebGL Context: Unavailable'
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let vendor = 'Generic / Hidden';
    let renderer = 'Generic / Hidden';

    if (debugInfo) {
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown';
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
    }

    const vPrecision = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
    const precisionHash = fnv1a(`${vPrecision ? vPrecision.precision : 0}`);
    const isExposed = (renderer !== 'Generic / Hidden' && !renderer.toLowerCase().includes('generic'));

    if (isExposed) {
      return {
        id: 'webgl_info',
        title: 'Graphics Card (GPU) Model Leak',
        category: 'fingerprint',
        status: 'warning',
        verdict: 'Exact GPU Brand & Model Broadcasted',
        summary: `Websites can see your exact graphics card: "${renderer}".`,
        impact: 'Moderate Risk. Combined with your screen size, this makes your browser easy to identify.',
        action: 'Use privacy extensions or privacy-hardened browser profiles to mask your GPU name.',
        rawTelemetry: `Vendor: ${vendor}\nRenderer: ${renderer}\nShader Precision: ${precisionHash}`
      };
    }

    return {
      id: 'webgl_info',
      title: 'Graphics Card (GPU) Model Leak',
      category: 'fingerprint',
      status: 'secure',
      verdict: 'GPU Model Successfully Masked',
      summary: 'Your browser gives a generic name for your graphics card instead of the real hardware model.',
      impact: 'Safe. Hardware model tracking is prevented.',
      action: 'No action needed. Hardware privacy protection is optimal.',
      rawTelemetry: `Masked Profile: ${renderer} | Precision: ${precisionHash}`
    };
  } catch (err) {
    return {
      id: 'webgl_info',
      title: 'Graphics Card (GPU) Model Leak',
      category: 'fingerprint',
      status: 'info',
      verdict: 'Restricted Access',
      summary: 'WebGL details could not be queried.',
      impact: 'Low Risk.',
      action: 'No action needed.',
      rawTelemetry: `Error: ${err.message}`
    };
  }
}

/**
 * 3. AudioContext Acoustic Fingerprint
 */
export async function getAudioFingerprint() {
  return new Promise((resolve) => {
    try {
      const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!AudioCtx) {
        return resolve({
          id: 'audio_context',
          title: 'Audio Hardware Processing Tracking',
          category: 'fingerprint',
          status: 'secure',
          verdict: 'Audio Fingerprinting Blocked',
          summary: 'Websites cannot test your computer’s audio processing chips.',
          impact: 'Safe. Sound-based tracking is disabled.',
          action: 'No action needed.',
          rawTelemetry: 'OfflineAudioContext: Disabled'
        });
      }

      const context = new AudioCtx(1, 44100, 44100);
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);

      const compressor = context.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, context.currentTime);
      compressor.knee.setValueAtTime(40, context.currentTime);
      compressor.ratio.setValueAtTime(12, context.currentTime);
      compressor.attack.setValueAtTime(0, context.currentTime);
      compressor.release.setValueAtTime(0.25, context.currentTime);

      oscillator.connect(compressor);
      compressor.connect(context.destination);
      oscillator.start(0);

      context.oncomplete = (e) => {
        const buffer = e.renderedBuffer.getChannelData(0);
        let sampleSum = 0;
        for (let i = 4500; i < 5000; i++) {
          sampleSum += Math.abs(buffer[i]);
        }
        const hash = fnv1a(sampleSum.toString());

        resolve({
          id: 'audio_context',
          title: 'Audio Hardware Processing Tracking',
          category: 'fingerprint',
          status: 'warning',
          verdict: 'Audio Processing Signature Exposed',
          summary: 'Websites can play an inaudible audio tone to test how your sound card renders audio waves.',
          impact: 'Moderate Risk. Generates an audio fingerprint that remains identical across browsing sessions.',
          action: 'Enable sound hardware farbling or anti-fingerprinting in your browser preferences.',
          rawTelemetry: `Audio Hash: ${hash} | Output Sample Sum: ${sampleSum.toFixed(6)}`
        });
      };

      context.startRendering();
      setTimeout(() => {
        resolve({
          id: 'audio_context',
          title: 'Audio Hardware Processing Tracking',
          category: 'fingerprint',
          status: 'info',
          verdict: 'Query Timed Out',
          summary: 'Audio rendering timed out before a signature could be captured.',
          impact: 'Low Risk.',
          action: 'No action required.',
          rawTelemetry: 'Timeout after 500ms'
        });
      }, 500);

    } catch (err) {
      resolve({
        id: 'audio_context',
        title: 'Audio Hardware Processing Tracking',
        category: 'fingerprint',
        status: 'secure',
        verdict: 'Blocked by Security Policy',
        summary: 'Web Audio API was blocked from testing audio signatures.',
        impact: 'Safe.',
        action: 'No action required.',
        rawTelemetry: `Policy Restriction: ${err.message}`
      });
    }
  });
}

/**
 * 4. System Font Metrics Profiling
 */
export async function getFontMetricsFingerprint() {
  try {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const fontList = [
      'Arial', 'Calibri', 'Cambria', 'Consolas', 'Courier New', 'Georgia',
      'Helvetica', 'Impact', 'Lucida Console', 'Palatino Linotype', 'Segoe UI',
      'Times New Roman', 'Trebuchet MS', 'Verdana', 'Ubuntu', 'Roboto', 'Menlo'
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        id: 'font_metrics',
        title: 'Installed System Fonts Profiling',
        category: 'fingerprint',
        status: 'info',
        verdict: 'Measurement Unavailable',
        summary: 'Font measurements could not be performed.',
        impact: 'Low Risk.',
        action: 'No action needed.',
        rawTelemetry: 'Canvas measureText: Unsupported'
      };
    }

    const testString = 'mmmmmmmmmmlli1100WWWWWW';
    const baseSizes = {};
    for (const base of baseFonts) {
      ctx.font = `72px ${base}`;
      baseSizes[base] = ctx.measureText(testString).width;
    }

    const detectedFonts = [];
    for (const font of fontList) {
      for (const base of baseFonts) {
        ctx.font = `72px '${font}', ${base}`;
        if (ctx.measureText(testString).width !== baseSizes[base]) {
          detectedFonts.push(font);
          break;
        }
      }
    }

    const isHigh = detectedFonts.length > 8;

    return {
      id: 'font_metrics',
      title: 'Installed System Fonts Profiling',
      category: 'fingerprint',
      status: isHigh ? 'warning' : 'secure',
      verdict: isHigh ? `${detectedFonts.length} Installed Fonts Identified` : 'Font List Standardized',
      summary: isHigh 
        ? `Websites can detect specific software fonts installed on your computer without asking for permission.`
        : 'Your browser standardizes font metrics to prevent font-based identification.',
      impact: isHigh ? 'Moderate Risk. The combination of your installed fonts reveals your operating system.' : 'Safe.',
      action: isHigh ? 'Use a browser that restricts font enumeration (such as Firefox with resistFingerprinting).' : 'Optimal configuration.',
      rawTelemetry: `Detected Fonts (${detectedFonts.length}): ${detectedFonts.join(', ')}`
    };
  } catch (err) {
    return {
      id: 'font_metrics',
      title: 'Installed System Fonts Profiling',
      category: 'fingerprint',
      status: 'info',
      verdict: 'Error Reading Fonts',
      summary: 'Font detection error occurred.',
      impact: 'Low Risk.',
      action: 'No action required.',
      rawTelemetry: `Error: ${err.message}`
    };
  }
}

export async function runFingerprintTests() {
  const [canvas, webgl, audio, fonts] = await Promise.all([
    getCanvasFingerprint(),
    getWebGLFingerprint(),
    getAudioFingerprint(),
    getFontMetricsFingerprint()
  ]);
  return [canvas, webgl, audio, fonts];
}
