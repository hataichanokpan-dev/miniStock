'use client';

import { SpeaScore } from '@/types/analysis';
import { getSpeaRating, getSpeaColor } from '@/lib/analysis/spea';

interface SpeaRadarChartProps {
  score: SpeaScore;
  symbol: string;
}

export default function SpeaRadarChart({ score, symbol }: SpeaRadarChartProps) {
  const rating = getSpeaRating(score.totalScore);
  const colorClass = getSpeaColor(score.totalScore);

  const speaQuadrants = [
    { name: 'Strategic Position', score: score.strategicPosition, weight: 25, color: 'bg-blue-500' },
    { name: 'Financial Health', score: score.financialHealth, weight: 30, color: 'bg-green-500' },
    { name: 'Earnings Quality', score: score.earningsQuality, weight: 25, color: 'bg-purple-500' },
    { name: 'Attractive Valuation', score: score.attractiveValuation, weight: 20, color: 'bg-orange-500' },
  ];

  // Calculate bar positions for radar-like visualization
  const centerX = 50;
  const centerY = 50;
  const radius = 40;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">SPEA Analysis</h3>
          <p className="text-sm text-gray-500">{symbol}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${colorClass}`}>
            {score.totalScore}
          </div>
          <div className="text-sm text-gray-500">{rating}</div>
        </div>
      </div>

      {/* Radar Chart Visualization */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background circles */}
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          <circle cx={centerX} cy={centerY} r={radius * 0.75} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          <circle cx={centerX} cy={centerY} r={radius * 0.25} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />

          {/* Axis lines */}
          <line x1={centerX} y1={centerY} x2={centerX} y2={centerY - radius} stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1={centerX} y1={centerY} x2={centerX + radius * 0.707} y2={centerY - radius * 0.707} stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1={centerX} y1={centerY} x2={centerX + radius * 0.707} y2={centerY + radius * 0.707} stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1={centerX} y1={centerY} x2={centerX} y2={centerY + radius} stroke="#e5e7eb" strokeWidth="0.5" />

          {/* Data polygon */}
          <polygon
            points={`
              ${centerX},${centerY - (radius * score.strategicPosition) / 100}
              ${centerX + (radius * 0.707 * score.financialHealth) / 100},${centerY - (radius * 0.707 * score.financialHealth) / 100}
              ${centerX + (radius * 0.707 * score.earningsQuality) / 100},${centerY + (radius * 0.707 * score.earningsQuality) / 100}
              ${centerX},${centerY + (radius * score.attractiveValuation) / 100}
            `}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth="1"
          />

          {/* Data points */}
          <circle cx={centerX} cy={centerY - (radius * score.strategicPosition) / 100} r="1.5" fill="#3b82f6" />
          <circle
            cx={centerX + (radius * 0.707 * score.financialHealth) / 100}
            cy={centerY - (radius * 0.707 * score.financialHealth) / 100}
            r="1.5"
            fill="#22c55e"
          />
          <circle
            cx={centerX + (radius * 0.707 * score.earningsQuality) / 100}
            cy={centerY + (radius * 0.707 * score.earningsQuality) / 100}
            r="1.5"
            fill="#a855f7"
          />
          <circle cx={centerX} cy={centerY + (radius * score.attractiveValuation) / 100} r="1.5" fill="#f97316" />
        </svg>

        {/* Labels */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-xs text-center">
          <span className="font-semibold text-blue-600">Strategic</span>
        </div>
        <div className="absolute top-8 right-0 text-xs text-right">
          <span className="font-semibold text-green-600">Health</span>
        </div>
        <div className="absolute bottom-8 right-0 text-xs text-right">
          <span className="font-semibold text-purple-600">Quality</span>
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 text-xs text-center">
          <span className="font-semibold text-orange-600">Valuation</span>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {speaQuadrants.map((quadrant) => (
          <div key={quadrant.name} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">{quadrant.name}</span>
              <span className="text-sm font-bold text-gray-900">{quadrant.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${quadrant.color}`}
                style={{ width: `${quadrant.score}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Weight: {quadrant.weight}%</p>
          </div>
        ))}
      </div>

      {/* Valuation Status */}
      <div className={`mt-4 pt-4 border-t border-gray-200 rounded p-3 ${
        score.valuation === 'undervalued'
          ? 'bg-green-50'
          : score.valuation === 'fair'
          ? 'bg-yellow-50'
          : 'bg-red-50'
      }`}>
        <p className="text-sm font-medium text-gray-700">
          Valuation: <span className={`font-bold ${
            score.valuation === 'undervalued'
              ? 'text-green-700'
              : score.valuation === 'fair'
              ? 'text-yellow-700'
              : 'text-red-700'
          }`}>{score.valuation.toUpperCase()}</span>
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Scores are weighted: Strategic Position (25%), Financial Health (30%), Earnings Quality (25%), Attractive Valuation (20%)
        </p>
      </div>
    </div>
  );
}
