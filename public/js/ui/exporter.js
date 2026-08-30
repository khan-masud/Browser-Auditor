/**
 * Report Exporter Engine
 * Generates comprehensive JSON telemetry dumps, rich Markdown reports, and formatted Print-to-PDF.
 */

import { BROWSER_BENCHMARKS } from '../modules/benchmark.js';

export function exportJSON(enrichedTests, scores, browserInfo) {
  const data = {
    metadata: {
      generatedAt: new Date().toISOString(),
      generator: 'Browser Auditor Security & Privacy Engine v1.0',
      clientPlatform: navigator.platform || 'Unknown OS',
      browserDetected: browserInfo.name,
      browserFamily: browserInfo.family
    },
    clientEnvironment: {
      userAgent: browserInfo.userAgent,
      platform: browserInfo.platform,
      language: browserInfo.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: `${window.screen.colorDepth}-bit`,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Hidden',
      deviceMemoryGB: navigator.deviceMemory || 'Hidden'
    },
    executiveScores: {
      overallScore: scores.currentScore,
      overallGrade: scores.grade,
      potentialScore: scores.potentialScore,
      potentialGrade: scores.potentialGrade,
      potentialGainPoints: scores.potentialOverallDelta,
      privacyIndex: scores.privacyScore,
      potentialPrivacyIndex: scores.potentialPrivacyScore,
      securityIndex: scores.securityScore,
      potentialSecurityIndex: scores.potentialSecurityScore,
      trackerBlockRate: scores.trackerRate,
      actionableRiskCount: scores.actionableCount
    },
    diagnostics: enrichedTests.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      status: t.status,
      impact: t.impact || t.summary,
      isActionable: t.isActionable,
      potentialPointsGain: t.potentialGain || 0,
      recommendedAction: t.action,
      rawTelemetry: t.rawTelemetry || t.value
    })),
    benchmarkComparison: [
      {
        profile: `${browserInfo.name} (Your Current Session)`,
        score: scores.currentScore,
        grade: scores.grade,
        isCurrent: true
      },
      ...BROWSER_BENCHMARKS.map(b => ({
        profile: b.name,
        score: b.score,
        grade: b.grade
      }))
    ]
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `browser_auditor_report_${browserInfo.family}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyMarkdownReport(enrichedTests, scores, browserInfo) {
  const lines = [
    `# 🛡️ Browser Auditor — Security & Privacy Audit Report`,
    `> **Generated on:** ${new Date().toUTCString()}`,
    `> **Target Environment:** ${browserInfo.name} • ${browserInfo.platform}`,
    ``,
    `---`,
    ``,
    `## 📊 Executive Score Summary`,
    ``,
    `| Metric | Current Status | Achievable Potential | Actionable Gain |`,
    `| :--- | :--- | :--- | :--- |`,
    `| **Overall Protection** | **${scores.grade}** (${scores.currentScore}/100) | **${scores.potentialGrade}** (${scores.potentialScore}/100) | \`+${scores.potentialOverallDelta} pts\` |`,
    `| **Privacy Index** | ${scores.privacyScore}/100 | ${scores.potentialPrivacyScore}/100 | \`+${scores.potentialPrivacyDelta} pts\` |`,
    `| **Security Index** | ${scores.securityScore}/100 | ${scores.potentialSecurityScore}/100 | \`+${scores.potentialSecurityDelta} pts\` |`,
    `| **Tracker Block Rate** | ${scores.trackerRate} | 99% | \`uBlock Origin\` |`,
    ``,
    `---`,
    ``,
    `## 🔍 Diagnostic Vectors & Telemetry Matrix`,
    ``,
    `| Diagnostic Vector | Status | Risk Level | Actionable | Recommended Action |`,
    `| :--- | :--- | :--- | :---: | :--- |`
  ];

  enrichedTests.forEach(test => {
    const statusEmoji = test.status === 'secure' ? '✅ SECURE' : (test.status === 'warning' ? '⚠️ WARNING' : '❌ DANGER');
    const actionableTag = test.isActionable ? `Yes (+${test.potentialGain} pts)` : 'System Limit';
    const cleanAction = (test.action || 'No action needed.').replace(/\|/g, '\\|');
    const cleanImpact = (test.impact || 'Safe').replace(/\|/g, '\\|');
    lines.push(`| **${test.title}** | \`${statusEmoji}\` | ${cleanImpact} | ${actionableTag} | ${cleanAction} |`);
  });

  // Actionable remediation section
  const actionableTests = enrichedTests.filter(t => t.isActionable);
  if (actionableTests.length > 0) {
    lines.push(``, `---`, ``, `## 🛠️ Browser-Tailored Hardening Directives for ${browserInfo.name}`);
    actionableTests.forEach((t, i) => {
      lines.push(`${i + 1}. **${t.title}** (\`+${t.potentialGain} pts\`):`);
      lines.push(`   - *Directive:* ${t.action}`);
    });
  }

  // Benchmark section
  lines.push(
    ``,
    `---`,
    ``,
    `## 🏆 Standard Industry Benchmark Comparison`,
    ``,
    `| Browser Profile | Grade | Rating Index |`,
    `| :--- | :---: | :---: |`,
    `| **${browserInfo.name} (Your Current Session)** | **${scores.grade}** | **${scores.currentScore}/100** |`
  );

  BROWSER_BENCHMARKS.forEach(b => {
    lines.push(`| ${b.name} | ${b.grade} | ${b.score}/100 |`);
  });

  lines.push(``, `---`, `*Report generated 100% client-side via Browser Auditor.*`);

  const markdown = lines.join('\n');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(markdown);
      return true;
    }
  } catch (err) {}

  const textarea = document.createElement('textarea');
  textarea.value = markdown;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
  } catch (err) {}
  document.body.removeChild(textarea);
  return true;
}

export function printPDFReport() {
  window.print();
}
