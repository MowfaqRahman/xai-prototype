import React, { useState } from 'react';
import InputGroup from './InputGroup';

const LoanForm = ({ onSubmit, loading, error }) => {
    const initialForm = {
        person_age: 25,
        person_gender: 'male',
        person_education: 'Bachelor',
        person_income: 55000,
        person_emp_exp: 2,
        person_home_ownership: 'RENT',
        loan_amnt: 10000,
        loan_intent: 'PERSONAL',
        loan_int_rate: 11.5,
        cb_person_cred_hist_length: 3,
        credit_score: 650,
        previous_loan_defaults_on_file: 'No'
    };

    const [formData, setFormData] = useState(initialForm);

    const updateField = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="glass-card fade-in">
            <h2 className="card-title">
                <i className="ri-user-line"></i> Applicant Details
            </h2>

            {error && (
                <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid var(--danger)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    color: '#fca5a5', 
                    marginBottom: '2rem' 
                }}>
                    <i className="ri-error-warning-line"></i> {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="input-grid">
                    {/* Personal Info */}
                    <div className="input-section">
                        <h3 className="section-title">Personal</h3>
                        <InputGroup label="Age" type="number" value={formData.person_age} onChange={v => updateField('person_age', v)} />
                        <InputGroup label="Gender" value={formData.person_gender} onChange={v => updateField('person_gender', v)} options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} />
                        <InputGroup label="Education" value={formData.person_education} onChange={v => updateField('person_education', v)} options={[{ label: 'High School', value: 'High School' }, { label: 'Associate', value: 'Associate' }, { label: 'Bachelor', value: 'Bachelor' }, { label: 'Master', value: 'Master' }, { label: 'Doctorate', value: 'Doctorate' }]} />
                        <InputGroup label="Home Ownership" value={formData.person_home_ownership} onChange={v => updateField('person_home_ownership', v)} options={[{ label: 'Rent', value: 'RENT' }, { label: 'Own', value: 'OWN' }, { label: 'Mortgage', value: 'MORTGAGE' }, { label: 'Other', value: 'OTHER' }]} />
                    </div>

                    {/* Financial Info */}
                    <div className="input-section">
                        <h3 className="section-title">Financial</h3>
                        <InputGroup label="Annual Income ($)" type="number" value={formData.person_income} onChange={v => updateField('person_income', v)} />
                        <InputGroup label="Employment Exp (Years)" type="number" value={formData.person_emp_exp} onChange={v => updateField('person_emp_exp', v)} />
                        <InputGroup label="Loan Amount ($)" type="number" value={formData.loan_amnt} onChange={v => updateField('loan_amnt', v)} />
                        <InputGroup label="Intent" value={formData.loan_intent} onChange={v => updateField('loan_intent', v)} options={[{ label: 'Personal', value: 'PERSONAL' }, { label: 'Education', value: 'EDUCATION' }, { label: 'Medical', value: 'MEDICAL' }, { label: 'Venture', value: 'VENTURE' }, { label: 'Home Improvement', value: 'HOMEIMPROVEMENT' }, { label: 'Debt Consolidation', value: 'DEBTCONSOLIDATION' }]} />
                    </div>

                    {/* Credit Info */}
                    <div className="input-section">
                        <h3 className="section-title">Credit Profile</h3>
                        <InputGroup label="Interest Rate (%)" type="number" value={formData.loan_int_rate} onChange={v => updateField('loan_int_rate', v)} />
                        <InputGroup label="Credit Score" type="number" value={formData.credit_score} onChange={v => updateField('credit_score', v)} />
                        <InputGroup label="Credit History (Years)" type="number" value={formData.cb_person_cred_hist_length} onChange={v => updateField('cb_person_cred_hist_length', v)} />
                        <InputGroup label="Prior Defaults" value={formData.previous_loan_defaults_on_file} onChange={v => updateField('previous_loan_defaults_on_file', v)} options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }]} />
                    </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? (
                            <><i className="ri-loader-4-line ri-spin"></i> Analyzing...</>
                        ) : (
                            <>Predict Status <i className="ri-arrow-right-line"></i></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoanForm;
