import React from 'react';
import { riskColor, riskBg } from '../utils/common';

/**
 * Circular gauge / donut chart for risk score
 */
export default function RiskGauge({ score = 0 }) {
    const level = score <= 35 ? "LOW" : score <= 65 ? "MEDIUM" : "HIGH";
    const radius = 30;
    const stroke = 6;
    const norm = radius - stroke / 2;
    const circ = 2 * Math.PI * norm;
    const filled = ((score || 0) / 100) * circ;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 82 }}>
            <svg width={82} height={82} viewBox="-6 -6 88 88">
                {/* Background track */}
                <circle cx={radius + 5} cy={radius + 5} r={norm} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
                {/* Score arc */}
                <circle
                    cx={radius + 5} cy={radius + 5} r={norm}
                    fill="none"
                    stroke={riskColor(level)}
                    strokeWidth={stroke}
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${radius + 5} ${radius + 5})`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
                <text x={radius + 5} y={radius + 8} dominantBaseline="middle" textAnchor="middle" fontSize={15} fontWeight={800} fill={riskColor(level)}>
                    {score}
                </text>
                <text x={radius + 5} y={radius + 21} dominantBaseline="middle" textAnchor="middle" fontSize={7} fontWeight={600} fill="#9ca3af">
                    /100
                </text>
            </svg>
            <div style={{ fontSize: 10, fontWeight: 800, color: riskColor(level), letterSpacing: "0.5px", marginTop: -4 }}>{level}</div>
        </div>
    );
}
