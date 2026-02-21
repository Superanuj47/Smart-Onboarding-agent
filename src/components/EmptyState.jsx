import React from 'react';

export default function EmptyState({ icon = '📭', title = 'No Results', message = 'Nothing to display here.' }) {
    return (
        <div style={{ textAlign: 'center', padding: '52px 24px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>{icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13 }}>{message}</div>
        </div>
    );
}
