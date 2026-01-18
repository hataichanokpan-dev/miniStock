'use client';

import { CanslimScore } from '@/types/analysis';
import { getCanslimRating, getCanslimColor } from '@/lib/analysis/canslim';

interface CanslimScoreCardProps {
  score: CanslimScore;
  symbol: string;
}

export default function CanslimScoreCard({ score, symbol }: CanslimScoreCardProps) {
  const rating = getCanslimRating(score.totalScore);
  const colorClass = getCanslimColor(score.totalScore);

  const canslimFactors = [
    { letter: 'C', name: 'Current Earnings', score: score.currentEarnings, weight: 15 },
    { letter: 'A', name: 'Annual Earnings', score: score.annualEarnings, weight: 20 },
    { letter: 'N', name: 'New Products', score: score.newProducts, weight: 10 },
    { letter: 'S', name: 'Supply & Demand', score: score.supplyDemand, weight: 10 },
    { letter: 'L', name: 'Leader', score: score.leader, weight: 15 },
    { letter: 'I', name: 'Institutional', score: score.institutional, weight: 15 },
    { letter: 'M', name: 'Market Direction', score: score.marketDirection, weight: 15 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">CAN SLIM Analysis</h3>
          <p className="text-sm text-gray-500">{symbol}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${colorClass}`}>
            {score.totalScore}
          </div>
          <div className="text-sm text-gray-500">{rating}</div>
        </div>
      </div>

      <div className="space-y-3">
        {canslimFactors.map((factor) => (
          <div key={factor.letter} className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded font-bold text-sm mr-3">
              {factor.letter}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                <span className="text-sm text-gray-500">{factor.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    factor.score >= 80
                      ? 'bg-green-500'
                      : factor.score >= 65
                      ? 'bg-lime-500'
                      : factor.score >= 50
                      ? 'bg-yellow-500'
                      : factor.score >= 35
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Scores are weighted: C (15%), A (20%), N (10%), S (10%), L (15%), I (15%), M (15%)
        </p>
      </div>
    </div>
  );
}
