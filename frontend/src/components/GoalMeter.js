import React from 'react';

/**
 * GoalMeter Component
 * Visual progress bar showing how close the portfolio is to the investment goal.
 * Includes probability badge and achievement status.
 */
export default function GoalMeter({ average = 0, goal = 1, probability = 0, goalAchievable = false }) {
  const progress = Math.min((average / goal) * 100, 150); // Cap at 150% for visual
  const displayProgress = Math.min(progress, 100);

  // Colors based on achievement probability
  let barColor, statusText, statusBadge;
  if (probability >= 70) {
    barColor = 'linear-gradient(90deg, #10b981, #34d399)';
    statusText = 'On Track';
    statusBadge = 'badge-success';
  } else if (probability >= 40) {
    barColor = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    statusText = 'Needs Improvement';
    statusBadge = 'badge-warning';
  } else {
    barColor = 'linear-gradient(90deg, #ef4444, #f87171)';
    statusText = 'At Risk';
    statusBadge = 'badge-danger';
  }

  return (
    <div className="glass-card animate-fade-in">
      <div className="section-header">
        <div className="section-icon">🏆</div>
        <div>
          <h2 className="section-title">Goal Achievement</h2>
          <p className="section-subtitle">Target: ₹{goal.toLocaleString('en-IN')}</p>
        </div>
        <div className="ml-auto">
          <span className={`badge ${statusBadge}`}>
            {goalAchievable ? '✓' : '✗'} {statusText}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="goal-meter-bar">
        <div
          className="goal-meter-fill"
          style={{
            width: `${displayProgress}%`,
            background: barColor,
          }}
        ></div>
      </div>

      {/* Stats below bar */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            ₹{average.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-text-muted">Expected Value</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: probability >= 50 ? '#10b981' : '#ef4444' }}>
            {probability}%
          </p>
          <p className="text-xs text-text-muted">Success Rate</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-text-primary">
            ₹{goal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-text-muted">Target Goal</p>
        </div>
      </div>
    </div>
  );
}
