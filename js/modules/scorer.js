/**
 * Scoring & Risk Aggregation Engine with Dual Scoring Intelligence
 * Realistic Cybersecurity Ceiling: Clamped to 99% maximum (nothing on the web is 100% safe).
 */

import { enrichTestWithBrowserRules, BROWSER_RULES } from './browserRules.js';

export function calculateScores(allTests, browserInfo) {
  let privacyPointsEarned = 0;
  let privacyMaxPoints = 0;
  let privacyRecoverable = 0;

  let securityPointsEarned = 0;
  let securityMaxPoints = 0;
  let securityRecoverable = 0;

  let totalRecoverablePoints = 0;
  let actionableCount = 0;
  const remediations = [];

  const enrichedTests = allTests.map(test => enrichTestWithBrowserRules(test, browserInfo));

  enrichedTests.forEach(test => {
    const rule = BROWSER_RULES[test.id];
    const weight = (rule && typeof rule.weight === 'number') ? rule.weight : 10;

    let testScore = 0;
    if (test.status === 'secure') testScore = weight;
    else if (test.status === 'info') testScore = weight * 0.7;
    else if (test.status === 'warning') testScore = weight * 0.35;
    else if (test.status === 'danger') testScore = 0;

    const lostPoints = weight - testScore;

    // Distribute points into Privacy vs Security buckets
    if (test.category === 'fingerprint' || test.category === 'storage' || test.category === 'hardware') {
      privacyPointsEarned += testScore;
      privacyMaxPoints += weight;
      if (test.isActionable) {
        privacyRecoverable += lostPoints;
      }
    } else {
      securityPointsEarned += testScore;
      securityMaxPoints += weight;
      if (test.isActionable) {
        securityRecoverable += lostPoints;
      }
    }

    if (test.isActionable) {
      actionableCount++;
      totalRecoverablePoints += lostPoints;
    }

    if (test.status === 'danger' || test.status === 'warning') {
      remediations.push({
        id: test.id,
        title: test.title,
        status: test.status,
        impact: test.impact || test.summary,
        remediation: test.action || test.remediation,
        category: test.category,
        isActionable: test.isActionable,
        potentialGain: test.potentialGain
      });
    }
  });

  // Current Scores (Max 99% — Cybersecurity realism ceiling)
  const privacyScore = Math.min(99, Math.max(0, Math.round((privacyPointsEarned / (privacyMaxPoints || 1)) * 100)));
  const securityScore = Math.min(99, Math.max(0, Math.round((securityPointsEarned / (securityMaxPoints || 1)) * 100)));
  const currentScore = Math.min(99, Math.round((privacyScore * 0.55) + (securityScore * 0.45)));

  // Potential Category Scores (Max 99%)
  const potentialPrivacyDelta = Math.round((privacyRecoverable / (privacyMaxPoints || 1)) * 100);
  const potentialPrivacyScore = Math.min(99, privacyScore + potentialPrivacyDelta);

  const potentialSecurityDelta = Math.round((securityRecoverable / (securityMaxPoints || 1)) * 100);
  const potentialSecurityScore = Math.min(99, securityScore + potentialSecurityDelta);

  // Overall Potential Score (Max 99%)
  const totalMax = (privacyMaxPoints + securityMaxPoints) || 1;
  const potentialOverallDelta = Math.round((totalRecoverablePoints / totalMax) * 100);
  const potentialScore = Math.min(99, currentScore + potentialOverallDelta);

  const currentGrade = getGradeFromScore(currentScore);
  const potentialGrade = getGradeFromScore(potentialScore);

  // Tracker Block Rate (Max 99%)
  const trackerTest = enrichedTests.find(t => t.id === 'tracker_blocker');
  let trackerRate = '0%';
  if (trackerTest && trackerTest.verdict) {
    const match = trackerTest.verdict.match(/(\d+)%/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      trackerRate = `${Math.min(99, parsed)}%`;
    }
  }

  return {
    // Current Scores
    privacyScore,
    securityScore,
    currentScore,
    overallScore: currentScore,
    grade: currentGrade.letter,
    gradeColor: currentGrade.color,

    // Potential Scores (Max 99%)
    potentialScore,
    potentialGrade: potentialGrade.letter,
    potentialGradeColor: potentialGrade.color,
    potentialOverallDelta: Math.max(0, potentialScore - currentScore),

    potentialPrivacyScore,
    potentialPrivacyDelta: Math.max(0, potentialPrivacyScore - privacyScore),

    potentialSecurityScore,
    potentialSecurityDelta: Math.max(0, potentialSecurityScore - securityScore),

    // Telemetry & Breakdown
    trackerRate,
    passedCount: enrichedTests.filter(t => t.status === 'secure').length,
    warningCount: enrichedTests.filter(t => t.status === 'warning').length,
    dangerCount: enrichedTests.filter(t => t.status === 'danger').length,
    totalTests: enrichedTests.length,
    actionableCount,
    remediations,
    enrichedTests
  };
}

function getGradeFromScore(score) {
  if (score >= 94) return { letter: 'A+', color: '#10b981' };
  if (score >= 84) return { letter: 'A', color: '#10b981' };
  if (score >= 72) return { letter: 'B', color: '#3b82f6' };
  if (score >= 55) return { letter: 'C', color: '#f59e0b' };
  if (score >= 40) return { letter: 'D', color: '#f97316' };
  return { letter: 'F', color: '#ef4444' };
}
