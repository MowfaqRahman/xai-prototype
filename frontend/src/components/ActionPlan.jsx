import React from 'react';

const ActionPlan = ({ plans }) => {
    if (!plans || plans.length === 0) return null;

    return (
        <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '1.5rem', 
            borderRadius: '16px', 
            margin: '2rem 0',
            textAlign: 'left'
        }}>
            <h3 style={{ color: '#86efac', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ri-route-line"></i> Path to Approval
            </h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Our AI found {plans.length} alternative scenarios where your loan would be approved:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {plans.map((planGroup, index) => (
                    <div key={index} style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        padding: '1rem', 
                        borderRadius: '8px' 
                    }}>
                        <strong style={{ color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                            Option {index + 1}:
                        </strong>
                        <ul style={{ color: '#e2e8f0', marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
                            {planGroup.map((step, i) => (
                                <li key={i} style={{ marginBottom: '0.3rem' }}>{step}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActionPlan;
