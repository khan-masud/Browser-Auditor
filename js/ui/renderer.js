/**
 * Dynamic UI Rendering Engine
 * Renders Symmetrical Large Dual Scores, Icon-Only Statuses, and Clean Human-Friendly Risk Descriptions.
 */

import { ICONS, getCategoryIcon, getStatusIcon } from './icons.js';
import { BROWSER_BENCHMARKS } from '../modules/benchmark.js';

export class ReportRenderer {
  constructor() {
    this.cachedResults = [];
    this.cachedScores = null;
    this.cachedBrowser = null;
    this.activeCategory = 'all';
    this.observer = null;
  }

  setBrowserBadge(browserInfo) {
    this.cachedBrowser = browserInfo;
    const badgeHero = document.getElementById('landing-browser-badge');
    const badgeHeader = document.getElementById('header-browser-badge');
    const text = `${browserInfo.name} • ${browserInfo.platform}`;

    if (badgeHero) badgeHero.textContent = text;
    if (badgeHeader) badgeHeader.textContent = text;
  }

  showProgressBar(currentStep, totalSteps, message) {
    const wrapper = document.getElementById('scan-progress-wrapper');
    const fill = document.getElementById('scan-progress-fill');
    const statusText = document.getElementById('scan-status-text');
    const percentText = document.getElementById('scan-percent-text');

    if (wrapper) wrapper.classList.add('active');
    const percent = Math.round((currentStep / totalSteps) * 100);
    if (fill) fill.style.width = `${percent}%`;
    if (statusText) statusText.textContent = message || 'Running diagnostic probes...';
    if (percentText) percentText.textContent = `${percent}%`;
  }

  hideProgressBar() {
    const wrapper = document.getElementById('scan-progress-wrapper');
    if (wrapper) wrapper.classList.remove('active');
  }

  /**
   * Renders Symmetrical Large Dual Score Overview (Current Score on Left, Potential Score on Right in Same Font/Size)
   */
  renderScoreOverview(scores) {
    this.cachedScores = scores;

    // Card 1: Overall Protection
    const gradeEl = document.getElementById('score-grade-val');
    const overallNumEl = document.getElementById('score-overall-num');
    const potOverallContainer = document.getElementById('card-potential-overall');

    if (gradeEl) {
      gradeEl.textContent = scores.grade;
      gradeEl.style.color = scores.gradeColor;
    }
    if (overallNumEl) {
      overallNumEl.textContent = `${scores.currentScore}/100`;
    }
    if (potOverallContainer) {
      potOverallContainer.innerHTML = `
        <span class="score-number mono" style="color: ${scores.potentialGradeColor};">${scores.potentialGrade}</span>
        <span class="score-max mono" style="margin-left: 4px;">${scores.potentialScore}/100</span>
        ${scores.potentialOverallDelta > 0 ? `<span class="potential-delta-pill">+${scores.potentialOverallDelta}</span>` : ''}
      `;
    }

    // Card 2: Privacy Index
    const privacyEl = document.getElementById('score-privacy-val');
    const potPrivacyContainer = document.getElementById('card-potential-privacy');
    if (privacyEl) privacyEl.textContent = `${scores.privacyScore}`;
    if (potPrivacyContainer) {
      potPrivacyContainer.innerHTML = `
        <span class="score-number mono" style="color: var(--status-secure);">${scores.potentialPrivacyScore}</span>
        <span class="score-max mono">/100</span>
        ${scores.potentialPrivacyDelta > 0 ? `<span class="potential-delta-pill">+${scores.potentialPrivacyDelta}</span>` : ''}
      `;
    }

    // Card 3: Security Index
    const securityEl = document.getElementById('score-security-val');
    const potSecurityContainer = document.getElementById('card-potential-security');
    if (securityEl) securityEl.textContent = `${scores.securityScore}`;
    if (potSecurityContainer) {
      potSecurityContainer.innerHTML = `
        <span class="score-number mono" style="color: var(--status-secure);">${scores.potentialSecurityScore}</span>
        <span class="score-max mono">/100</span>
        ${scores.potentialSecurityDelta > 0 ? `<span class="potential-delta-pill">+${scores.potentialSecurityDelta}</span>` : ''}
      `;
    }

    // Card 4: Tracker Block Rate
    const trackerEl = document.getElementById('score-tracker-val');
    const potTrackerContainer = document.getElementById('card-potential-tracker');
    const currentTrackerNum = parseInt(scores.trackerRate, 10) || 0;
    const trackerDelta = Math.max(0, 99 - currentTrackerNum);

    if (trackerEl) trackerEl.textContent = scores.trackerRate;
    if (potTrackerContainer) {
      potTrackerContainer.innerHTML = `
        <span class="score-number mono" style="color: var(--status-secure);">99%</span>
        ${trackerDelta > 0 ? `<span class="potential-delta-pill">+${trackerDelta}%</span>` : ''}
      `;
    }
  }

  renderBenchmarkTable(scores, browserInfo) {
    const container = document.getElementById('benchmark-table-body');
    if (!container) return;

    const rows = [
      {
        name: `${browserInfo.name} (Your Current Session)`,
        score: scores.currentScore,
        grade: scores.grade,
        color: scores.gradeColor,
        isCurrent: true
      },
      ...BROWSER_BENCHMARKS
    ];

    rows.sort((a, b) => b.score - a.score);

    container.innerHTML = rows.map(item => `
      <tr class="${item.isCurrent ? 'benchmark-current-row' : ''}">
        <td>
          <span style="display: flex; align-items: center; gap: 6px;">
            ${item.isCurrent ? ICONS.shieldCheck : ''}
            <strong>${item.name}</strong>
          </span>
        </td>
        <td class="mono" style="font-weight: 700;">${item.grade}</td>
        <td class="benchmark-bar-cell">
          <div class="benchmark-bar-track">
            <div class="benchmark-bar-fill" style="width: ${item.score}%; background-color: ${item.color || 'var(--text-secondary)'};"></div>
          </div>
        </td>
        <td class="mono" style="text-align: right; font-weight: 600;">${item.score}/100</td>
      </tr>
    `).join('');
  }

  scrollToCategory(categoryId) {
    this.activeCategory = categoryId;
    this.updateActiveTabUI(categoryId);

    if (categoryId === 'all') {
      const tableCard = document.querySelector('.audit-table-card');
      if (tableCard) {
        const topPos = tableCard.getBoundingClientRect().top + window.pageYOffset - 116;
        window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
      }
      return;
    }

    const sectionEl = document.getElementById(`section-${categoryId}`);
    if (sectionEl) {
      const topPos = sectionEl.getBoundingClientRect().top + window.pageYOffset - 158;
      window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    }
  }

  updateActiveTabUI(categoryId) {
    document.querySelectorAll('.tab-nav-btn').forEach(btn => {
      const btnCat = btn.getAttribute('data-category');
      btn.classList.toggle('active', btnCat === categoryId);
    });
  }

  renderDataTable(enrichedTests) {
    this.cachedResults = enrichedTests;

    const tableBody = document.getElementById('audit-table-body');
    if (!tableBody) return;

    const allGroups = [
      {
        id: 'fingerprint',
        title: 'Hardware & Graphical Fingerprinting',
        category: 'fingerprint',
        icon: ICONS.fingerprint,
        tests: enrichedTests.filter(t => t.category === 'fingerprint' || t.category === 'hardware')
      },
      {
        id: 'network',
        title: 'Network & Connection Leaks',
        category: 'network',
        icon: ICONS.globe,
        tests: enrichedTests.filter(t => t.category === 'network')
      },
      {
        id: 'storage',
        title: 'Storage, Tracking & State Partitioning',
        category: 'storage',
        icon: ICONS.database,
        tests: enrichedTests.filter(t => t.category === 'storage')
      },
      {
        id: 'security',
        title: 'Security Posture & Sandbox Integrity',
        category: 'security',
        icon: ICONS.lock,
        tests: enrichedTests.filter(t => t.category === 'security')
      }
    ];

    let html = '';

    allGroups.forEach(group => {
      if (!group.tests || group.tests.length === 0) return;

      // Group Sub-Header Anchor Row
      html += `
        <tr class="category-separator-row" id="section-${group.id}">
          <td colspan="5">
            <div class="category-header-flex">
              ${group.icon}
              <span>${group.title}</span>
            </div>
          </td>
        </tr>
      `;

      // Data Rows
      group.tests.forEach(test => {
        const statusIcon = getStatusIcon(test.status);
        const riskColor = test.status === 'danger' 
          ? 'var(--status-danger)' 
          : (test.status === 'warning' ? 'var(--status-warning)' : 'var(--status-secure)');
        
        const riskIcon = test.status === 'secure' ? ICONS.shieldCheck : ICONS.shieldAlert;

        // Clean Icon-Only Actionable / Inherent Indicator (Inline with Title)
        let indicatorHTML = '';
        if (test.status === 'secure') {
          indicatorHTML = '';
        } else if (test.isActionable) {
          indicatorHTML = `
            <span class="indicator-actionable" title="User Fixable: You can fix this risk in your browser settings (+${test.potentialGain || 10} pts)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </span>
          `;
        } else {
          indicatorHTML = `
            <span class="indicator-system-limit" title="System Inherent: Limitation of this browser engine (Cannot be changed via standard settings)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
          `;
        }

        // Action Text
        const actionText = test.status === 'secure' 
          ? 'No action needed.' 
          : this.escapeHTML(test.action || test.remediation || 'No action required.');

        html += `
          <tr class="audit-data-row" id="row-${test.id}">
            
            <!-- Column 1: Audit Title + Info Tooltip + Icon-Only Indicator (Zero Text Clutter) -->
            <td>
              <div class="audit-title-line">
                <span class="audit-title-text">${test.title}</span>
                
                <!-- Info Icon with Tooltip -->
                <div class="tooltip-container" tabindex="0" aria-label="More info about ${test.title}">
                  <div class="tooltip-icon">
                    ${ICONS.info}
                  </div>
                  <div class="tooltip-box" role="tooltip">
                    <strong>How this affects you:</strong><br>
                    ${this.escapeHTML(test.summary || test.description)}
                  </div>
                </div>

                ${indicatorHTML}
              </div>
            </td>

            <!-- Column 2: Status (Icon Only with Color Pill, No Text) -->
            <td class="status-cell-center">
              <span class="status-icon-pill ${test.status}" title="${test.status.toUpperCase()}">
                ${statusIcon}
              </span>
            </td>

            <!-- Column 3: Risk Level (Plain Secondary Text with Subtle Icon) -->
            <td>
              <div class="risk-cell-container">
                <span class="risk-icon-prefix" style="color: ${riskColor};">
                  ${riskIcon}
                </span>
                <span class="risk-text-description">
                  ${this.escapeHTML(test.impact || test.risk || 'No privacy or security risk detected.')}
                </span>
              </div>
            </td>

            <!-- Column 4: Recommended Action (Browser Tailored / No action needed) -->
            <td>
              <div class="action-cell-container">
                <div class="action-cell-text">
                  ${actionText}
                </div>
              </div>
            </td>

            <!-- Column 5: Raw Telemetry Toggle -->
            <td style="text-align: right;">
              <button class="btn-toggle-telemetry" data-target="telemetry-row-${test.id}" title="Toggle raw technical parameters">
                <span>Raw</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </td>

          </tr>

          <!-- Expandable Raw Telemetry Sub-Row -->
          <tr id="telemetry-row-${test.id}" class="telemetry-expand-row">
            <td colspan="5" class="telemetry-expand-cell">
<strong>Diagnostic Telemetry:</strong>
${this.escapeHTML(test.rawTelemetry || test.value)}
            </td>
          </tr>
        `;
      });
    });

    tableBody.innerHTML = html;
    this.attachTelemetryToggles();
    this.initScrollSpy();
  }

  initScrollSpy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    const sectionIds = ['fingerprint', 'network', 'storage', 'security'];
    const sections = sectionIds.map(id => document.getElementById(`section-${id}`)).filter(Boolean);

    if (sections.length === 0) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('section-', '');
          this.updateActiveTabUI(id);
        }
      });
    }, {
      rootMargin: '-160px 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(s => this.observer.observe(s));
  }

  attachTelemetryToggles() {
    document.querySelectorAll('.btn-toggle-telemetry').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const row = document.getElementById(targetId);
        if (row) {
          const isOpen = row.classList.toggle('open');
          btn.classList.toggle('open', isOpen);
        }
      });
    });
  }

  showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
