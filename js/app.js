/**
 * Main Application Orchestrator
 * Coordinates diagnostic probes, dual scoring, theme toggling, and smooth category navigation.
 */

import { runFingerprintTests } from './modules/fingerprint.js';
import { runNetworkTests } from './modules/network.js';
import { runStorageTests } from './modules/storage.js';
import { runHardwareTests } from './modules/hardware.js';
import { runSecurityTests } from './modules/security.js';
import { calculateScores } from './modules/scorer.js';
import { getBrowserInfo } from './modules/benchmark.js';
import { ReportRenderer } from './ui/renderer.js';
import { exportJSON, copyMarkdownReport, printPDFReport } from './ui/exporter.js';
import { ICONS } from './ui/icons.js';

class BrowserInspectorApp {
  constructor() {
    this.renderer = new ReportRenderer();
    this.browserInfo = null;
    this.allResults = [];
    this.scores = null;
    this.isScanning = false;
    this.currentTheme = 'light';
  }

  async init() {
    this.bindEvents();
    this.initTheme();
    this.setInitialSyncBadge();

    try {
      this.browserInfo = await getBrowserInfo();
      this.renderer.setBrowserBadge(this.browserInfo);
    } catch (e) {
      console.warn('Browser detection fallback:', e);
    }
  }

  setInitialSyncBadge() {
    const ua = navigator.userAgent;
    let name = 'Web Browser';
    let fam = 'other';
    if (ua.includes('Edg/')) { name = 'Microsoft Edge'; fam = 'edge'; }
    else if (ua.includes('Firefox/')) { name = 'Mozilla Firefox'; fam = 'firefox'; }
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) { name = 'Apple Safari'; fam = 'safari'; }
    else if (ua.includes('Chrome/')) { name = 'Google Chrome'; fam = 'chrome'; }
    
    this.browserInfo = {
      name,
      family: fam,
      userAgent: ua,
      platform: navigator.platform || 'OS',
      language: navigator.language || 'en-US'
    };
    this.renderer.setBrowserBadge(this.browserInfo);
  }

  initTheme() {
    const savedTheme = localStorage.getItem('browser_auditor_theme') || localStorage.getItem('browser_inspector_theme');
    this.currentTheme = savedTheme || 'light';
    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('browser_auditor_theme', theme);

    const themeIcons = document.querySelectorAll('.theme-icon-container');
    themeIcons.forEach(el => {
      el.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    });
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.btn-theme-toggle');
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleTheme();
        return;
      }

      const heroRunBtn = e.target.closest('#btn-run-hero');
      if (heroRunBtn) {
        e.preventDefault();
        if (!this.isScanning) {
          this.transitionToReportAndAudit();
        }
        return;
      }

      const headerRunBtn = e.target.closest('#btn-run-header');
      if (headerRunBtn) {
        e.preventDefault();
        if (!this.isScanning) {
          this.executeAudit();
        }
        return;
      }
    });

    document.querySelectorAll('.tab-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.currentTarget.getAttribute('data-category');
        this.renderer.scrollToCategory(category);
      });
    });

    const jsonBtn = document.getElementById('btn-export-json');
    if (jsonBtn) {
      jsonBtn.addEventListener('click', () => {
        if (this.scores && this.scores.enrichedTests) {
          exportJSON(this.scores.enrichedTests, this.scores, this.browserInfo);
          this.renderer.showToast('JSON telemetry report downloaded.');
        }
      });
    }

    const copyBtn = document.getElementById('btn-copy-md');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        if (this.scores && this.scores.enrichedTests) {
          await copyMarkdownReport(this.scores.enrichedTests, this.scores, this.browserInfo);
          this.renderer.showToast('Markdown report copied to clipboard.');
        }
      });
    }

    const printBtn = document.getElementById('btn-print-pdf');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        printPDFReport();
      });
    }
  }

  async transitionToReportAndAudit() {
    if (this.isScanning) return;

    const reportView = document.getElementById('view-report');
    if (reportView) {
      reportView.classList.add('active');
      reportView.scrollIntoView({ behavior: 'smooth' });
    }

    await this.executeAudit();
  }

  async executeAudit() {
    if (this.isScanning) return;
    this.isScanning = true;
    this.allResults = [];

    const headerRunBtn = document.getElementById('btn-run-header');
    const heroRunBtn = document.getElementById('btn-run-hero');

    if (headerRunBtn) {
      headerRunBtn.disabled = true;
      headerRunBtn.innerHTML = `${ICONS.refresh} Testing...`;
    }
    if (heroRunBtn) {
      heroRunBtn.disabled = true;
      heroRunBtn.textContent = 'Testing Browser...';
    }

    try {
      if (!this.browserInfo || !this.browserInfo.family) {
        this.browserInfo = await getBrowserInfo();
        this.renderer.setBrowserBadge(this.browserInfo);
      }

      // Step 1: Canvas, WebGL & AudioContext entropy probes
      this.renderer.showProgressBar(1, 5, 'Executing Canvas, WebGL & AudioContext entropy probes...');
      const fpResults = await runFingerprintTests();
      this.allResults.push(...fpResults);

      // Step 2: Network & WebRTC IP leak probes
      this.renderer.showProgressBar(2, 5, 'Testing WebRTC IP leaks, loopback access & network telemetry...');
      const netResults = await runNetworkTests();
      this.allResults.push(...netResults);

      // Step 3: Storage & Content Filter probes
      this.renderer.showProgressBar(3, 5, 'Evaluating tracker block rate, GPC signals & storage sandbox...');
      const storeResults = await runStorageTests();
      this.allResults.push(...storeResults);

      // Step 4: Hardware & Peripherals probes
      this.renderer.showProgressBar(4, 5, 'Probing CPU concurrency, memory, screen geometry & media APIs...');
      const hwResults = await runHardwareTests();
      this.allResults.push(...hwResults);

      // Step 5: Security Posture & Sandbox probes
      this.renderer.showProgressBar(5, 5, 'Verifying Spectre mitigations, automation flags & permissions...');
      const secResults = await runSecurityTests();
      this.allResults.push(...secResults);

      // Calculate Dual Scores with Browser-Specific Intelligence
      this.scores = calculateScores(this.allResults, this.browserInfo);

      // Render Dynamic Views with Actionable Badges
      this.renderer.renderScoreOverview(this.scores);
      this.renderer.renderDataTable(this.scores.enrichedTests);
      this.renderer.renderBenchmarkTable(this.scores, this.browserInfo);

      this.renderer.hideProgressBar();
      this.renderer.showToast(`Test complete. Configured for ${this.browserInfo.name}.`);

    } catch (err) {
      console.error('Audit execution error:', err);
      this.renderer.hideProgressBar();
      this.renderer.showToast('Test completed with non-critical warnings.');
    } finally {
      this.isScanning = false;
      if (headerRunBtn) {
        headerRunBtn.disabled = false;
        headerRunBtn.innerHTML = `${ICONS.refresh} Re-run Test`;
      }
      if (heroRunBtn) {
        heroRunBtn.disabled = false;
        heroRunBtn.innerHTML = `${ICONS.play} Run Test`;
      }
    }
  }
}

const initApp = async () => {
  const app = new BrowserInspectorApp();
  await app.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
