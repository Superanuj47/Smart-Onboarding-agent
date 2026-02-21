import React from 'react';
import { statusBg, statusColor } from '../utils/common';

export default function StatusBadge({ status, size = 'md' }) {
    const label = (status || 'UNKNOWN').replace(/_/g, ' ');
    const fontSize = size === 'sm' ? 10 : 11;
    return (
        <span className="badge" style={{
            background: statusBg(status),
            color: statusColor(status),
            fontSize,
            border: `1px solid ${statusColor(status)}33`
        }}>
            {label}
        </span>
    );
}
