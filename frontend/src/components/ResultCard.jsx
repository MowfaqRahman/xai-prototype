import React from 'react';
import ActionPlan from './ActionPlan';

const ResultCard = ({ result, onReset }) => {
    const isApproved = result.loan_status === "Approved";
    const statusColor = isApproved ? 'var(--success)' : 'var(--danger)'; 

    return (
        <div className="glass-card fade-in" style={{ 
            maxWidth: '1000px', 
            maxHeight: '85vh',
            overflowY: 'auto',
            paddingRight: '1rem'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: statusColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    fontSize: '2.5rem'
                }}>
                    <i className={isApproved ? "ri-check-line" : "ri-close-line"}></i>
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fff' }}>
                    {result.loan_status}
                </h2>
                <div style={{ color: 'var(--secondary)' }}>
                    Probability of Default: <span style={{ color: '#fff', fontWeight: '500' }}>{result.probability_of_default}</span>
                </div>
                <div style={{ marginTop: '1rem' }}>
                     <span style={{ 
                         padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                         background: result.risk_category === "High Risk" ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                         color: result.risk_category === "High Risk" ? '#fca5a5' : '#86efac'
                     }}>
                        {result.risk_category}
                    </span>
                </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', color: '#fff' }}>
                    <i className="ri-brain-line"></i> AI Analysis
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                    {/* SHAP Factors */}
                    <div>
                        <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <i className="ri-bar-chart-horizontal-line"></i> Key Drivers (SHAP)
                        </h4>
                        {result.explanations?.shap_top_factors?.map((item, i) => (
                            <div key={i} style={{ 
                                display: 'flex', justifyContent: 'space-between', 
                                background: 'rgba(255,255,255,0.03)', padding: '0.75rem', 
                                borderRadius: '8px', marginBottom: '0.5rem' 
                            }}>
                                <span style={{ fontSize: '0.9rem' }}>{item.feature}</span>
                                <span style={{ 
                                    color: item.impact_direction.includes("Increases") ? 'var(--danger)' : 'var(--success)',
                                    fontWeight: '600', fontSize: '0.9rem'
                                }}>
                                    {item.impact_score}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* LIME Rules */}
                    <div>
                        <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <i className="ri-list-check-2"></i> Specific Rules (LIME)
                        </h4>
                        {Array.isArray(result.explanations?.lime_rules) ? (
                            result.explanations.lime_rules.map((item, i) => (
                                <div key={i} style={{ 
                                    marginBottom: '0.5rem', fontSize: '0.9rem', 
                                    background: 'rgba(255,255,255,0.03)', padding: '0.75rem', 
                                    borderRadius: '8px',
                                    wordBreak: 'break-word'
                                }}>
                                    {item.rule}
                                </div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--secondary)', fontStyle: 'italic', padding: '0.75rem' }}>
                                {result.explanations?.lime_rules}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTION PLAN */}
            {!isApproved && result.action_plan && result.action_plan.length > 0 && (
                <ActionPlan plans={result.action_plan} />
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="primary-btn" onClick={onReset}>
                    Assess Another Applicant <i className="ri-refresh-line" style={{ marginLeft: '8px' }}></i>
                </button>
            </div>
        </div>
    );
};

export default ResultCard;
