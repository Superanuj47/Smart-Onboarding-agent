import React from 'react';

export default function LoadingSpinner({ size = 32, text = null }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="spinner" style={{ width: size, height: size }} />
            {text && <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>{text}</div>}
        </div>
    );
}
